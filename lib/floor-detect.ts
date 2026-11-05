// Main-thread side of automatic floor detection. The model itself runs in
// floor-segment.worker.ts; this file starts that worker on demand, matches its replies to
// requests, and holds the plain logic for choosing a mask and fitting handles to it.

type Point = { x: number; y: number };
export type Quad = [Point, Point, Point, Point];

export type FloorWorkerRequest =
  | { type: "embed"; id: number; token: number; width: number; height: number; pixels: Uint8ClampedArray }
  | { type: "decode"; id: number; token: number; points: [number, number][] };

export type FloorWorkerResponse =
  | { type: "progress"; percent: number }
  | { type: "embedded"; id: number; backend: "webgpu" | "wasm" }
  // logits: [prompts, candidates, side, side]; scores: [prompts, candidates]; valid: [width, height]
  // of the low-res grid that's actually photo (the rest is padding).
  | { type: "masks"; id: number; prompts: number; candidates: number; side: number; valid: [number, number]; logits: Float32Array; scores: Float32Array }
  | { type: "error"; id: number; message: string };

export type MaskSet = Extract<FloorWorkerResponse, { type: "masks" }>;

// The model reads images at 1024px on the long side, so there's no point sending more.
const MODEL_SIDE = 1024;

let worker: Worker | null = null;
let nextId = 1;
const pending = new Map<number, { resolve: (value: FloorWorkerResponse) => void; reject: (error: Error) => void }>();
const progressListeners = new Set<(percent: number) => void>();

function getWorker() {
  if (worker) return worker;
  worker = new Worker(new URL("./floor-segment.worker.ts", import.meta.url), { type: "module" });
  worker.onmessage = (event: MessageEvent<FloorWorkerResponse>) => {
    const message = event.data;
    if (message.type === "progress") { progressListeners.forEach(listener => listener(message.percent)); return; }
    const waiting = pending.get(message.id);
    if (!waiting) return;
    pending.delete(message.id);
    if (message.type === "error") waiting.reject(new Error(message.message));
    else waiting.resolve(message);
  };
  // If the worker itself dies (no WebAssembly, out of memory), fail everything waiting on it.
  worker.onerror = () => {
    pending.forEach(waiting => waiting.reject(new Error("worker failed")));
    pending.clear();
    worker?.terminate();
    worker = null;
  };
  return worker;
}

// Request/response over postMessage: each request gets an id, and the reply with that id
// settles the promise.
// Applied to each member of the union separately, so an "embed" request keeps its own fields.
type WithoutId<T> = T extends unknown ? Omit<T, "id"> : never;
function ask(request: WithoutId<FloorWorkerRequest>, transfer: Transferable[] = []) {
  const id = nextId++;
  return new Promise<FloorWorkerResponse>((resolve, reject) => {
    pending.set(id, { resolve, reject });
    getWorker().postMessage({ ...request, id } as FloorWorkerRequest, transfer);
  });
}

// Reads the photo once. `token` names this photo; decodes for an older photo are refused.
export async function embedPhoto(photo: HTMLCanvasElement | ImageData, token: number, onProgress: (percent: number) => void) {
  const width = photo.width, height = photo.height;
  const scale = Math.min(1, MODEL_SIDE / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale); canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext("2d")!;
  if (photo instanceof ImageData) {
    const full = document.createElement("canvas");
    full.width = width; full.height = height;
    full.getContext("2d")!.putImageData(photo, 0, 0);
    ctx.drawImage(full, 0, 0, canvas.width, canvas.height);
  } else ctx.drawImage(photo, 0, 0, canvas.width, canvas.height);
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  progressListeners.add(onProgress);
  try {
    const reply = await ask({ type: "embed", token, width: canvas.width, height: canvas.height, pixels }, [pixels.buffer]);
    return reply.type === "embedded" ? reply.backend : "wasm";
  } finally {
    progressListeners.delete(onProgress);
  }
}

// Points are 0–1 fractions of the photo; each is asked about separately, in one batch.
export async function decodeFloor(token: number, points: [number, number][]) {
  return (await ask({ type: "decode", token, points })) as MaskSet;
}

export type FloorMask = { data: Uint8Array; width: number; height: number };

// Turns the model's answers into one floor mask (0–255, soft edges) covering the photo.
//
// Each prompt asked "what surface is at this point?". Per prompt, take the largest confident
// candidate (SAM's "whole object" answer) unless it swallows most of the photo, which is
// walls-and-all rather than floor. Then keep only floor-sized answers: a hint that landed on a
// toolbox comes back as a toolbox-sized mask and is dropped. The kept answers are combined, so
// a floor the model sees as two surfaces (fresh and old concrete, a rug on tile) is covered.
export function combineFloorMasks(set: MaskSet, quad: Quad): FloorMask {
  const { prompts, candidates, side, logits, scores } = set;
  const [width, height] = set.valid;
  const plane = side * side;
  const inQuad = quadMask(quad, width, height);
  const quadArea = inQuad.reduce((sum, v) => sum + v, 0) || 1;

  type Answer = { offset: number; area: number; inside: number };
  const answers: Answer[] = [];
  for (let b = 0; b < prompts; b++) {
    let best = -Infinity;
    for (let m = 0; m < candidates; m++) best = Math.max(best, scores[b * candidates + m]);
    let chosen: Answer | null = null;
    for (let m = 0; m < candidates; m++) {
      if (scores[b * candidates + m] < best - 0.15) continue;
      const offset = (b * candidates + m) * plane;
      let area = 0, inside = 0;
      for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
        if (logits[offset + y * side + x] <= 0) continue;
        area++;
        if (inQuad[y * width + x]) inside++;
      }
      if (area > width * height * 0.75) continue;
      if (!chosen || area > chosen.area) chosen = { offset, area, inside };
    }
    if (chosen) answers.push(chosen);
  }
  let kept = answers.filter(a => a.inside >= quadArea * 0.12);
  if (!kept.length && answers.length) kept = [answers.reduce((a, b) => (b.inside > a.inside ? b : a))];

  // Union = the highest score at each pixel, smoothed over 3×3 so isolated uncertain pixels
  // don't flicker, then squashed to 0–255 with a sigmoid. Uncertain areas fade instead of
  // turning into a speckled pattern.
  const union = new Float32Array(width * height).fill(-20);
  for (const a of kept) for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const v = logits[a.offset + y * side + x];
    if (v > union[y * width + x]) union[y * width + x] = v;
  }
  const data = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    let sum = 0, n = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const yy = y + dy, xx = x + dx;
      if (yy < 0 || xx < 0 || yy >= height || xx >= width) continue;
      sum += union[yy * width + xx]; n++;
    }
    data[y * width + x] = Math.round(255 / (1 + Math.exp(-(sum / n) * 1.5)));
  }
  return { data, width, height };
}

// 1 for pixels inside the quad, 0 outside (even-odd ray test on each pixel center).
function quadMask(quad: Quad, width: number, height: number) {
  const out = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    const py = (y + 0.5) / height;
    for (let x = 0; x < width; x++) {
      const px = (x + 0.5) / width;
      let inside = false;
      for (let k = 0, j = 3; k < 4; j = k++) {
        const a = quad[k], b = quad[j];
        if ((a.y > py) !== (b.y > py) && px < ((b.x - a.x) * (py - a.y)) / (b.y - a.y) + a.x) inside = !inside;
      }
      if (inside) out[y * width + x] = 1;
    }
  }
  return out;
}

// Places the four handles around a floor mask: a trapezoid from the floor's far edge to its
// near edge, which is how a floor looks from standing height. Returned as 0–1 fractions.
// Returns null when the mask is too small to be a floor.
export function fitQuad({ data: mask, width, height }: FloorMask): Quad | null {
  const rows = new Uint32Array(height);
  let total = 0;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) if (mask[y * width + x] >= 128) { rows[y]++; total++; }
  if (total < width * height * 0.04) return null;
  // Ignore the thinnest 2% at the far edge and the near edge: stray specks, not floor.
  let seen = 0, top = 0, bottom = height - 1;
  for (let y = 0; y < height; y++) { seen += rows[y]; if (seen >= total * 0.02) { top = y; break; } }
  seen = 0;
  for (let y = height - 1; y >= 0; y--) { seen += rows[y]; if (seen >= total * 0.02) { bottom = y; break; } }
  if (bottom - top < height * 0.08) return null;
  const band = Math.max(2, Math.round((bottom - top) * 0.12));
  const span = (from: number, to: number) => {
    const xs: number[] = [];
    for (let y = from; y <= to; y++) for (let x = 0; x < width; x++) if (mask[y * width + x] >= 128) xs.push(x);
    xs.sort((a, b) => a - b);
    return [xs[Math.floor(xs.length * 0.03)] ?? 0, xs[Math.floor(xs.length * 0.97)] ?? width - 1];
  };
  const [topLeft, topRight] = span(top, top + band);
  const [bottomLeft, bottomRight] = span(bottom - band, bottom);
  // The mask decides exactly where the finish goes, so the outline only has to contain the floor
  // and get the perspective roughly right. Erring big is free; erring small leaves bare strips.
  // So: pad outward a little, and snap to the photo's edge when the floor runs off it.
  const pad = width * 0.03;
  const fx = (x: number) => { const f = x / (width - 1); return f < 0.04 ? 0 : f > 0.96 ? 1 : Math.min(1, Math.max(0, f)); };
  const fy = (y: number) => { const f = y / (height - 1); return f > 0.95 ? 1 : Math.min(1, Math.max(0, f)); };
  return [
    { x: fx(topLeft - pad), y: fy(top - height * 0.01) },
    { x: fx(topRight + pad), y: fy(top - height * 0.01) },
    { x: fx(bottomRight + pad), y: fy(bottom) },
    { x: fx(bottomLeft - pad), y: fy(bottom) },
  ];
}
