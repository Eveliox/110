// Runs Segment Anything (SlimSAM, Apache-2.0) off the main thread, so the page stays responsive
// while the model works. The photo never leaves the device: only the model files are downloaded.
//
// Two steps, because they cost very different amounts:
//   "embed"  – the big vision encoder reads the whole photo once (seconds).
//   "decode" – the small mask decoder turns "what surface is at this point?" prompts into masks
//              (milliseconds), so it can re-run every time the visitor moves a handle.
import { AutoProcessor, RawImage, SamModel, Tensor, env } from "@huggingface/transformers";
import type { FloorWorkerRequest, FloorWorkerResponse } from "./floor-detect";

// Pinned to an exact model revision so a future upload to the model repo can't change the site.
const MODEL = "Xenova/slimsam-77-uniform";
const REVISION = "5850ab45f587c112167512ffef949107115e26a0";
// SAM pads every image to a 1024×1024 square before reading it.
const PAD = 1024;
env.allowLocalModels = false;

type Inputs = { pixel_values: Tensor; original_sizes: [number, number][]; reshaped_input_sizes: [number, number][] };
type Embeddings = { image_embeddings: Tensor; image_positional_embeddings: Tensor };
type Sam = {
  get_image_embeddings(inputs: Inputs): Promise<Embeddings>;
  (inputs: Embeddings & { input_points: Tensor; input_labels: Tensor }): Promise<{ pred_masks: Tensor; iou_scores: Tensor }>;
};
type Processor = (image: RawImage) => Promise<Inputs>;

const post = (message: FloorWorkerResponse, transfer: Transferable[] = []) => (self as unknown as Worker).postMessage(message, transfer);

type Backend = "webgpu" | "wasm";
let loaded: Promise<{ model: Sam; processor: Processor; backend: Backend }> | null = null;
let current: { token: number; inputs: Inputs; embeddings: Embeddings } | null = null;
let gpuFailed = false;

// The encoder is the slow part: several seconds on one CPU thread (the browser only allows more
// threads on pages with strict cross-origin headers, which would break the rest of the site).
// On the graphics chip, via WebGPU, it's far faster. Half precision (fp16) halves the download
// and needs the GPU's "shader-f16" feature; without it, the CPU path is used.
async function canUseGpu() {
  if (gpuFailed) return false;
  try {
    const gpu = (navigator as unknown as { gpu?: { requestAdapter(): Promise<{ features: Set<string> } | null> } }).gpu;
    const adapter = await gpu?.requestAdapter();
    return !!adapter?.features.has("shader-f16");
  } catch {
    return false;
  }
}

function load() {
  loaded ??= (async () => {
    // Several files download at once; report one overall percentage.
    const files = new Map<string, { loaded: number; total: number }>();
    const progress_callback = (event: { status: string; file?: string; loaded?: number; total?: number }) => {
      if (event.status !== "progress" || !event.file || !event.total) return;
      files.set(event.file, { loaded: event.loaded ?? 0, total: event.total });
      let done = 0, total = 0;
      files.forEach(f => { done += f.loaded; total += f.total; });
      post({ type: "progress", percent: Math.min(99, Math.round((done / total) * 100)) });
    };
    const backend: Backend = (await canUseGpu()) ? "webgpu" : "wasm";
    // The decoder is tiny and runs on the CPU either way.
    const options = backend === "webgpu"
      ? { device: { vision_encoder: "webgpu", prompt_encoder_mask_decoder: "wasm" }, dtype: { vision_encoder: "fp16", prompt_encoder_mask_decoder: "q8" } }
      : { device: "wasm", dtype: "q8" };
    const [model, processor] = await Promise.all([
      SamModel.from_pretrained(MODEL, { revision: REVISION, progress_callback, ...(options as object) }),
      AutoProcessor.from_pretrained(MODEL, { revision: REVISION }),
    ]);
    return { model: model as unknown as Sam, processor: processor as unknown as Processor, backend };
  })();
  // A failed download shouldn't poison every later attempt.
  loaded.catch(() => { loaded = null; });
  return loaded;
}

async function embed(request: Extract<FloorWorkerRequest, { type: "embed" }>) {
  const { model, processor, backend } = await load();
  const image = new RawImage(request.pixels, request.width, request.height, 4).rgb();
  const inputs = await processor(image);
  const embeddings = await model.get_image_embeddings(inputs);
  current = { token: request.token, inputs, embeddings };
  post({ type: "embedded", id: request.id, backend });
}

async function handle(request: FloorWorkerRequest) {
  if (request.type === "embed") {
    try {
      await embed(request);
    } catch (error) {
      // GPU drivers vary; if the GPU path fails, retry once on the CPU before giving up.
      if (gpuFailed || !(await canUseGpu())) throw error;
      gpuFailed = true;
      loaded = null;
      await embed(request);
    }
    return;
  }
  const { model } = await load();

  // A decode for a photo that has since been replaced is answered with nothing.
  if (!current || current.token !== request.token) { post({ type: "error", id: request.id, message: "stale" }); return; }
  const { inputs, embeddings } = current;
  // Each point is its own prompt ("what surface is this?"), all answered in one batched run.
  // Points arrive as 0–1 fractions of the photo; the model wants pixels of its resized input.
  const [rh, rw] = inputs.reshaped_input_sizes[0];
  const count = request.points.length;
  const coords = request.points.flatMap(([x, y]) => [x * rw, y * rh]);
  const input_points = new Tensor("float32", Float32Array.from(coords), [1, count, 1, 2]);
  const input_labels = new Tensor("int64", BigInt64Array.from(request.points, () => BigInt(1)), [1, count, 1]);
  const output = await model({ ...embeddings, input_points, input_labels });
  // pred_masks: [1, prompts, 3, 256, 256] raw scores (logits) on the model's padded 1024×1024
  // canvas. SAM proposes three candidates per prompt (small, medium, whole). Choosing and
  // combining them is ordinary logic, so it happens on the main thread (lib/floor-detect.ts).
  const [, prompts, candidates, side] = output.pred_masks.dims;
  const logits = Float32Array.from(output.pred_masks.data as Float32Array);
  const scores = Float32Array.from(output.iou_scores.data as Float32Array);
  post({ type: "masks", id: request.id, prompts, candidates, side, valid: [Math.round((rw * side) / PAD), Math.round((rh * side) / PAD)], logits, scores }, [logits.buffer, scores.buffer]);
}

self.onmessage = (event: MessageEvent<FloorWorkerRequest>) => {
  handle(event.data).catch((error: unknown) => post({ type: "error", id: event.data.id, message: error instanceof Error ? error.message : String(error) }));
};
