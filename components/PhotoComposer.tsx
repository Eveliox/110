"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { Check, Download, Loader2, Move, Share2, Trash2, Upload } from "lucide-react";
import { buildFinishCanvas, finishRepeat } from "@/lib/finish-texture";
import { useCopy } from "./LangProvider";
import { combineFloorMasks, decodeFloor, embedPhoto, fitQuad, type FloorMask, type Quad } from "@/lib/floor-detect";

type Point = { x: number; y: number };
type Corners = [Point, Point, Point, Point];
type Mat3 = [number, number, number, number, number, number, number, number, number];

export type PhotoAppearance = { system: number; base: string; accent: string; sheen: number };

// Phone photos are 12–48 MP. Working at that size makes every drag frame slow and goes past
// iOS Safari's canvas memory limit (the canvas silently comes back blank), so photos are
// scaled down once on upload. 1600px is still sharper than the preview is ever shown.
const MAX_SIDE = 1600;
const HANDLE_RADIUS = 14;
// The procedural finish tile spans 6m of floor (see finishRepeat); used to size the pattern.
const TILE_METERS = 6;

// Starts inside the frame so all four handles can be grabbed, even on a phone.
const DEFAULT_CORNERS = (w: number, h: number): Corners => [
  { x: w * 0.2, y: h * 0.58 },
  { x: w * 0.8, y: h * 0.58 },
  { x: w * 0.96, y: h * 0.96 },
  { x: w * 0.04, y: h * 0.96 },
];

// pixels: the photo. soft: lightly blurred copy, so single noisy pixels don't decide what's
// floor and what's an object. smooth: a stronger blur for the color test, so small stains and
// rust specks on the old slab wash out while real objects (bins, toolboxes) don't. light:
// heavily blurred luminance (0–1) for the room's lighting.
type Photo = { width: number; height: number; pixels: ImageData; soft: Uint8ClampedArray; smooth: Uint8ClampedArray; light: Float32Array };

// Downscales the photo and precomputes two blurred copies. Blurring by shrinking and
// re-enlarging with smoothing is far cheaper than a convolution and good enough here. The heavy
// blur keeps the room's light falloff and the shadows furniture casts, without the old floor's
// stains and cracks showing through the new finish.
function preparePhoto(img: HTMLImageElement): Photo {
  const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, width, height);
  const pixels = ctx.getImageData(0, 0, width, height);

  const blur = (factor: number) => {
    const small = document.createElement("canvas");
    small.width = Math.max(2, Math.round(width / factor)); small.height = Math.max(2, Math.round(height / factor));
    const sctx = small.getContext("2d")!;
    sctx.imageSmoothingQuality = "high";
    sctx.drawImage(img, 0, 0, small.width, small.height);
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(small, 0, 0, width, height);
    return ctx.getImageData(0, 0, width, height).data;
  };
  const soft = blur(3);
  const smooth = blur(8);
  const blurred = blur(24);
  const light = new Float32Array(width * height);
  for (let i = 0, p = 0; i < light.length; i++, p += 4) light[i] = (0.2126 * blurred[p] + 0.7152 * blurred[p + 1] + 0.0722 * blurred[p + 2]) / 255;
  return { width, height, pixels, soft, smooth, light };
}

// Projective map from the unit square onto the quad (Heckbert): (0,0)→c0, (1,0)→c1, (1,1)→c2, (0,1)→c3.
function squareToQuad([p0, p1, p2, p3]: Corners): Mat3 {
  const dx1 = p1.x - p2.x, dx2 = p3.x - p2.x, dx3 = p0.x - p1.x + p2.x - p3.x;
  const dy1 = p1.y - p2.y, dy2 = p3.y - p2.y, dy3 = p0.y - p1.y + p2.y - p3.y;
  const den = dx1 * dy2 - dx2 * dy1;
  const g = Math.abs(den) > 1e-9 ? (dx3 * dy2 - dx2 * dy3) / den : 0;
  const h = Math.abs(den) > 1e-9 ? (dx1 * dy3 - dx3 * dy1) / den : 0;
  return [p1.x - p0.x + g * p1.x, p3.x - p0.x + h * p3.x, p0.x, p1.y - p0.y + g * p1.y, p3.y - p0.y + h * p3.y, p0.y, g, h, 1];
}

// Adjugate inverse; scale doesn't matter because the map is used as a ratio.
function invert([a, b, c, d, e, f, g, h, i]: Mat3): Mat3 {
  return [e * i - f * h, c * h - b * i, b * f - c * e, f * g - d * i, a * i - c * g, c * d - a * f, d * h - e * g, b * g - a * h, a * e - b * d];
}

type TextureLevel = { size: number; data: Uint8ClampedArray };

// The finish tile at a few sizes, so far-away floor samples a smaller copy instead of
// sparkling with aliasing.
function textureLevels(tile: HTMLCanvasElement): TextureLevel[] {
  return [1024, 512, 256, 128].map(size => {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d", { willReadFrequently: true })!;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(tile, 0, 0, size, size);
    return { size, data: ctx.getImageData(0, 0, size, size).data };
  });
}

// Anti-aliased "how inside the quad is this point": edge lines with inward normals give a value
// that ramps from 0 to 1 across the one pixel straddling each edge. Null for a collapsed quad.
function quadCoverage(corners: Corners) {
  let area = 0;
  for (let k = 0; k < 4; k++) { const a = corners[k], b = corners[(k + 1) % 4]; area += a.x * b.y - b.x * a.y; }
  if (Math.abs(area) < 16) return null;
  const sign = area > 0 ? 1 : -1;
  const [e0, e1, e2, e3] = corners.map((a, k) => {
    const b = corners[(k + 1) % 4];
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const nx = -(b.y - a.y) / len * sign, ny = (b.x - a.x) / len * sign;
    return [nx, ny, -(nx * a.x + ny * a.y)];
  });
  return (x: number, y: number) => Math.min(e0[0] * x + e0[1] * y + e0[2], e1[0] * x + e1[1] * y + e1[2], e2[0] * x + e2[1] * y + e2[2], e3[0] * x + e3[1] * y + e3[2]) + 0.5;
}

const quadBounds = (corners: Corners, width: number, height: number) => ({
  x0: Math.max(0, Math.floor(Math.min(...corners.map(p => p.x)) - 1)), x1: Math.min(width, Math.ceil(Math.max(...corners.map(p => p.x)) + 1)),
  y0: Math.max(0, Math.floor(Math.min(...corners.map(p => p.y)) - 1)), y1: Math.min(height, Math.ceil(Math.max(...corners.map(p => p.y)) + 1)),
});

type FloorReference = { mean: number; floorLum: number; tintR: number; tintB: number };

// What the bare floor inside the quad looks like. `mean` is its average light. The median
// brightness ignores the minority of pixels that are objects; the floor's tint is the average
// chromaticity (color with brightness divided out) of pixels near that median.
function floorReference(photo: Photo, corners: Corners): FloorReference | null {
  const { width, height, soft, smooth, light } = photo;
  const coverage = quadCoverage(corners);
  const { x0, x1, y0, y1 } = quadBounds(corners, width, height);
  if (!coverage || x1 <= x0 || y1 <= y0) return null;
  let sum = 0;
  const histogram = new Uint32Array(64);
  const samples: number[] = [];
  for (let y = y0; y < y1; y += 4) for (let x = x0; x < x1; x += 4) {
    if (coverage(x + 0.5, y + 0.5) < 1) continue;
    const p = (y * width + x) * 4;
    sum += light[y * width + x];
    histogram[Math.min(63, Math.floor((0.2126 * soft[p] + 0.7152 * soft[p + 1] + 0.0722 * soft[p + 2]) / 4))]++;
    samples.push(p);
  }
  const mean = Math.max(0.04, samples.length ? sum / samples.length : 0.5);
  let floorLum = mean, seen = 0;
  for (let b = 0; b < 64; b++) { seen += histogram[b]; if (seen * 2 >= samples.length) { floorLum = (b + 0.5) / 64; break; } }
  let tintR = 1 / 3, tintB = 1 / 3, tinted = 0, sumR = 0, sumB = 0;
  for (const p of samples) {
    const r = smooth[p], g = smooth[p + 1], b = smooth[p + 2];
    if (Math.abs((0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 - floorLum) > 0.12) continue;
    const total = r + g + b + 1;
    sumR += r / total; sumB += b / total; tinted++;
  }
  if (tinted) { tintR = sumR / tinted; tintB = sumB / tinted; }
  return { mean, floorLum, tintR, tintB };
}

// The color rule: how much a pixel looks like an object rather than floor, 0–1. Much darker
// than the floor (equipment, tires, hoses) or a clearly different color (a red toolbox, a blue
// bin). Soft ramps, not hard cutoffs, so object edges don't crawl. Shadows on the floor are
// rarely more than ~2.5× darker than it, so they stay floor; black hoses and tires are 4× or
// more. Very dark stains on the old slab can read as objects.
// `source` is which blurred copy to judge by: the light blur keeps thin dark things like hoses;
// the stronger one washes out specks (old flake chips, stains) so only bigger dark things count.
function darkness(photo: Photo, p: number, ref: FloorReference, source = photo.soft) {
  const softLum = (0.2126 * source[p] + 0.7152 * source[p + 1] + 0.0722 * source[p + 2]) / 255;
  return Math.min(1, Math.max(0, (ref.floorLum * 0.45 - softLum) / (ref.floorLum * 0.08)));
}
function colorObjectness(photo: Photo, p: number, ref: FloorReference) {
  const { smooth } = photo;
  const mr = smooth[p], mg = smooth[p + 1], mb = smooth[p + 2], total = mr + mg + mb + 1;
  const hue = (Math.hypot(mr / total - ref.tintR, mb / total - ref.tintB) - 0.035) / 0.025;
  return Math.min(1, Math.max(darkness(photo, p, ref), hue));
}

// Up to nine points to ask the model about, spread across the outlined area in perspective (so
// they spread across the floor rather than bunching at the back). Points on something clearly
// dark (a tire, a black machine) are skipped; anything else that isn't floor is filtered out
// later by the size of the model's answer.
function floorSeeds(photo: Photo, corners: Corners): [number, number][] {
  const ref = floorReference(photo, corners);
  const [a, b, c, d, e, f, g, h] = squareToQuad(corners);
  const seeds: [number, number][] = [];
  for (const v of [0.2, 0.5, 0.8]) for (const u of [0.2, 0.5, 0.8]) {
    const w = g * u + h * v + 1;
    const px = Math.min(photo.width - 1, Math.max(0, Math.round((a * u + b * v + c) / w)));
    const py = Math.min(photo.height - 1, Math.max(0, Math.round((d * u + e * v + f) / w)));
    if (ref && darkness(photo, (py * photo.width + px) * 4, ref) > 0.5) continue;
    seeds.push([px / photo.width, py / photo.height]);
  }
  if (seeds.length) return seeds;
  const w = g * 0.5 + h * 0.6 + 1;
  return [[(a * 0.5 + b * 0.6 + c) / w / photo.width, (d * 0.5 + e * 0.6 + f) / w / photo.height]];
}

// The model's floor mask is low resolution (about 256px); stretching it to the photo with
// smoothing (bilinear) gives smooth edges for free. Returns 0–255 per photo pixel.
function upscaleMask({ data: mask, width, height }: FloorMask, photo: Photo) {
  const small = document.createElement("canvas");
  small.width = width; small.height = height;
  const image = new ImageData(width, height);
  for (let i = 0; i < mask.length; i++) { image.data[i * 4] = mask[i]; image.data[i * 4 + 3] = 255; }
  small.getContext("2d")!.putImageData(image, 0, 0);
  const big = document.createElement("canvas");
  big.width = photo.width; big.height = photo.height;
  const ctx = big.getContext("2d", { willReadFrequently: true })!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(small, 0, 0, photo.width, photo.height);
  const data = ctx.getImageData(0, 0, photo.width, photo.height).data;
  const out = new Uint8Array(photo.width * photo.height);
  for (let i = 0; i < out.length; i++) out[i] = data[i * 4];
  return out;
}

// Lays the finish onto the floor quad in perspective. The finish keeps its own color; the
// photo contributes lighting (normalized to the floor's average so the finish isn't darkened
// wholesale), a touch of detail for contact shadows, and highlights that the sheen sells.
// What counts as floor comes from the model's mask when there is one (plus the darkness test,
// which still catches thin black hoses the model can miss), and from the color rule otherwise.
// `step` > 1 shades one pixel per step×step block: a quarter of the work at 2, used for
// the live preview while a handle is being dragged.
function compose(photo: Photo, out: ImageData, corners: Corners, levels: TextureLevel[], repeat: number, sheen: number, floorMask: Uint8Array | null, step = 1) {
  const { width, height, pixels, soft, light } = photo;
  const src = pixels.data, dst = out.data;
  dst.set(src);

  const coverage = quadCoverage(corners);
  const ref = floorReference(photo, corners);
  if (!coverage || !ref) return;
  const [A, B, C, D, E, F, G, H, I] = invert(squareToQuad(corners));
  const { x0, x1, y0, y1 } = quadBounds(corners, width, height);
  const { mean } = ref;
  const exposure = Math.min(1.2, Math.max(0.55, 0.5 + mean));
  const glare = Math.min(0.95, mean * 1.3);

  // Pick the tile size that roughly matches how many photo pixels one tile covers.
  const across = (Math.hypot(corners[1].x - corners[0].x, corners[1].y - corners[0].y) + Math.hypot(corners[2].x - corners[3].x, corners[2].y - corners[3].y)) / 2;
  const target = across / repeat;
  const level = levels.find(l => l.size <= target) ?? levels[levels.length - 1];
  const tex = level.data, size = level.size, mask = size - 1, scale = repeat * size;

  for (let y = y0; y < y1; y += step) {
    const py = y + step / 2;
    for (let x = x0; x < x1; x += step) {
      const px = x + step / 2;
      let cov = coverage(px, py);
      if (cov <= 0) continue;
      if (cov > 1) cov = 1;
      const w = G * px + H * py + I;
      let u = (A * px + B * py + C) / w, v = (D * px + E * py + F) / w;
      // Also maps NaN (a degenerate quad) to 0.
      u = u > 0 ? (u < 1 ? u : 1) : 0; v = v > 0 ? (v < 1 ? v : 1) : 0;
      // Bilinear sample of the tiling texture. Sizes are powers of two, so `& mask` wraps
      // (negative indices included) without a modulo.
      const fx = u * scale - 0.5, fy = v * scale - 0.5;
      const ix = Math.floor(fx), iy = Math.floor(fy), ax = fx - ix, ay = fy - iy;
      const r0 = (iy & mask) * size, r1 = ((iy + 1) & mask) * size, c0 = ix & mask, c1 = (ix + 1) & mask;
      const t00 = (r0 + c0) * 4, t10 = (r0 + c1) * 4, t01 = (r1 + c0) * 4, t11 = (r1 + c1) * 4;
      const w00 = (1 - ax) * (1 - ay), w10 = ax * (1 - ay), w01 = (1 - ax) * ay, w11 = ax * ay;
      const tr = tex[t00] * w00 + tex[t10] * w10 + tex[t01] * w01 + tex[t11] * w11;
      const tg = tex[t00 + 1] * w00 + tex[t10 + 1] * w10 + tex[t01 + 1] * w01 + tex[t11 + 1] * w11;
      const tb = tex[t00 + 2] * w00 + tex[t10 + 2] * w10 + tex[t01 + 2] * w01 + tex[t11 + 2] * w11;

      const i = y * width + x, p = i * 4;

      const object = floorMask ? Math.max(1 - floorMask[i] / 255, darkness(photo, p, ref, photo.smooth)) : colorObjectness(photo, p, ref);
      if (object >= 1) continue;
      const softLum = (0.2126 * soft[p] + 0.7152 * soft[p + 1] + 0.0722 * soft[p + 2]) / 255;

      const lit = light[i];
      const detail = Math.min(1.25, Math.max(0.75, softLum / (lit + 0.03)));
      let shade = 1 + (lit / mean - 1) * 0.85;
      shade = (shade < 0.3 ? 0.3 : shade > 1.6 ? 1.6 : shade) * exposure * (1 + (detail - 1) * 0.15);
      const highlight = lit > glare ? Math.min(1, (lit - glare) / (1 - glare + 1e-3)) * sheen * 150 : 0;

      const a = cov * (1 - object) * 0.97, keep = 1 - a;
      const fr = (tr * shade + highlight) * a, fg = (tg * shade + highlight) * a, fb = (tb * shade + highlight) * a;
      if (step === 1) {
        dst[p] = src[p] * keep + fr; dst[p + 1] = src[p + 1] * keep + fg; dst[p + 2] = src[p + 2] * keep + fb;
        continue;
      }
      for (let by = y, yEnd = Math.min(y + step, y1); by < yEnd; by++) {
        for (let bx = x, xEnd = Math.min(x + step, x1); bx < xEnd; bx++) {
          const q = (by * width + bx) * 4;
          dst[q] = src[q] * keep + fr; dst[q + 1] = src[q + 1] * keep + fg; dst[q + 2] = src[q + 2] * keep + fb;
        }
      }
    }
  }
}

export function PhotoComposer({ appearance, finishLabel, area }: { appearance: PhotoAppearance; finishLabel: string; area: number }) {
  const c = useCopy().photo;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const composedRef = useRef<ImageData | null>(null);
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [corners, setCorners] = useState<Corners | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const [notice, setNotice] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  // Automatic floor detection. `floorMask` is 0–255 per photo pixel once the model has answered.
  const [floorMask, setFloorMask] = useState<Uint8Array | null>(null);
  const [detect, setDetect] = useState<{ status: "loading"; percent: number } | { status: "finding" | "found" | "off" } | null>(null);
  const photoToken = useRef(0);
  const handlesMoved = useRef(false);
  const levels = useMemo(() => textureLevels(buildFinishCanvas(appearance.system, appearance.base, appearance.accent)), [appearance.system, appearance.base, appearance.accent]);
  // Pattern scale assumes the outlined floor is roughly the visitor's square footage.
  const repeat = Math.max(0.5, Math.sqrt(area * 0.0929) / (TILE_METERS / finishRepeat(appearance.system)));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !photo || !corners) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (canvas.width !== photo.width || canvas.height !== photo.height) { canvas.width = photo.width; canvas.height = photo.height; }
    if (!composedRef.current || composedRef.current.width !== photo.width || composedRef.current.height !== photo.height) composedRef.current = new ImageData(photo.width, photo.height);
    compose(photo, composedRef.current, corners, levels, repeat, appearance.sheen, floorMask, dragging === null ? 1 : 2);
    ctx.putImageData(composedRef.current, 0, 0);

    const scale = canvas.width / (canvas.clientWidth || canvas.width);
    const radius = HANDLE_RADIUS * scale;
    ctx.save();
    ctx.lineWidth = 1.5 * scale;
    ctx.strokeStyle = "rgba(243, 207, 240, 0.75)";
    ctx.setLineDash([6 * scale, 5 * scale]);
    ctx.beginPath();
    corners.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
    corners.forEach((corner, index) => {
      ctx.beginPath();
      ctx.arc(corner.x, corner.y, radius + 4 * scale, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(16, 10, 20, 0.55)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(corner.x, corner.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = index === dragging ? "#f3cff0" : "#e8cde3";
      ctx.fill();
      ctx.lineWidth = 2 * scale;
      ctx.strokeStyle = "#231528";
      ctx.stroke();
      ctx.fillStyle = "#231528";
      ctx.font = `${Math.round(14 * scale)}px ui-monospace, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(index + 1), corner.x, corner.y + 1);
    });
  }, [photo, corners, levels, repeat, appearance.sheen, dragging, floorMask]);

  // Asks the model for the floor, using hints from the current outline. Answers that arrive
  // after the photo was replaced are dropped (the token check).
  const findFloor = async (target: Photo, outline: Corners, token: number) => {
    const set = await decodeFloor(token, floorSeeds(target, outline));
    if (photoToken.current !== token) return null;
    const asFractions = outline.map(p => ({ x: p.x / target.width, y: p.y / target.height })) as Quad;
    const mask = combineFloorMasks(set, asFractions);
    setFloorMask(upscaleMask(mask, target));
    return mask;
  };

  // Runs once per photo: read it with the model, find the floor from the default outline, then
  // move the handles onto the floor it found (unless the visitor already moved them) and refine.
  // Any failure leaves the color rule in charge, which is how the tool worked without a model.
  const detectFloor = async (target: Photo, token: number) => {
    try {
      setDetect({ status: "loading", percent: 0 });
      const backend = await embedPhoto(target.pixels, token, percent => { if (photoToken.current === token) setDetect({ status: "loading", percent }); });
      if (canvasRef.current) canvasRef.current.dataset.backend = backend;
      if (photoToken.current !== token) return;
      setDetect({ status: "finding" });
      const first = await findFloor(target, DEFAULT_CORNERS(target.width, target.height), token);
      if (!first) return;
      // An answer too small to be a floor is more likely wrong than right: keep the color rule.
      const fitted = fitQuad(first);
      if (!fitted) {
        setFloorMask(null);
        setDetect({ status: "off" });
        setNotice(c.corners);
        return;
      }
      if (!handlesMoved.current) {
        const placed = fitted.map(p => ({ x: p.x * target.width, y: p.y * target.height })) as Corners;
        setCorners(placed);
        await findFloor(target, placed, token);
      }
      if (photoToken.current !== token) return;
      setDetect({ status: "found" });
      setNotice(c.found);
    } catch {
      if (photoToken.current !== token) return;
      setDetect({ status: "off" });
      setFloorMask(null);
      setNotice(c.detectFailed);
    }
  };

  const handleFile = (file: File) => {
    // Some systems report HEIC photos with an empty type; let the browser try to decode them.
    if (file.type && !file.type.startsWith("image/")) { setNotice(c.notImage); return; }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const prepared = preparePhoto(img);
        const token = ++photoToken.current;
        handlesMoved.current = false;
        setPhoto(prepared);
        setFloorMask(null);
        setCorners(DEFAULT_CORNERS(prepared.width, prepared.height));
        setNotice(c.corners);
        void detectFloor(prepared, token);
      } catch {
        setNotice(c.loadFailed);
      }
      URL.revokeObjectURL(url);
    };
    img.onerror = () => { setNotice(c.loadFailed); URL.revokeObjectURL(url); };
    img.src = url;
  };

  const toImageCoords = (ev: PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: (ev.clientX - rect.left) * (canvas.width / rect.width), y: (ev.clientY - rect.top) * (canvas.height / rect.height) };
  };

  // Nearest handle within reach; fingers get a bigger reach than a mouse.
  const findHandle = (p: Point, touch: boolean): number | null => {
    if (!corners) return null;
    const canvas = canvasRef.current!;
    const reach = ((touch ? 40 : HANDLE_RADIUS + 10) * canvas.width) / (canvas.clientWidth || canvas.width);
    let best: number | null = null, bestDistance = reach;
    corners.forEach((corner, i) => {
      const distance = Math.hypot(p.x - corner.x, p.y - corner.y);
      if (distance <= bestDistance) { best = i; bestDistance = distance; }
    });
    return best;
  };

  const onPointerDown = (ev: PointerEvent<HTMLCanvasElement>) => {
    const handle = findHandle(toImageCoords(ev), ev.pointerType !== "mouse");
    if (handle === null) return;
    ev.currentTarget.setPointerCapture(ev.pointerId);
    // From now on the visitor's placement wins over automatic placement.
    handlesMoved.current = true;
    setDragging(handle);
  };
  const onPointerMove = (ev: PointerEvent<HTMLCanvasElement>) => {
    if (dragging === null || !corners || !photo) return;
    const point = toImageCoords(ev);
    const next: Corners = [...corners] as Corners;
    // Kept inside the photo so a handle can never be lost off the edge.
    next[dragging] = { x: Math.max(0, Math.min(photo.width, point.x)), y: Math.max(0, Math.min(photo.height, point.y)) };
    setCorners(next);
  };
  // Letting go of a handle re-asks the model with hints from the new outline (milliseconds,
  // since the photo has already been read).
  const stopDragging = () => {
    if (dragging === null) return;
    setDragging(null);
    if (photo && corners && detect?.status === "found") findFloor(photo, corners, photoToken.current).catch(() => {});
  };

  const clear = () => {
    photoToken.current++;
    setPhoto(null);
    setFloorMask(null);
    setDetect(null);
    setCorners(null);
    composedRef.current = null;
    setNotice("");
  };

  // The finished photo without handles.
  const cleanCanvas = () => {
    if (!photo || !corners) return null;
    const composed = new ImageData(photo.width, photo.height);
    compose(photo, composed, corners, levels, repeat, appearance.sheen, floorMask);
    const out = document.createElement("canvas");
    out.width = photo.width; out.height = photo.height;
    out.getContext("2d")!.putImageData(composed, 0, 0);
    return out;
  };

  const exportPhoto = () => {
    const clean = cleanCanvas();
    if (!clean) return;
    const footer = Math.round(Math.max(72, clean.width * 0.07));
    const temp = document.createElement("canvas");
    temp.width = clean.width;
    temp.height = clean.height + footer;
    const ctx = temp.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#17121e";
    ctx.fillRect(0, 0, temp.width, temp.height);
    ctx.drawImage(clean, 0, 0);
    const unit = footer / 72;
    ctx.fillStyle = "#eee4f4";
    ctx.font = `${Math.round(18 * unit)}px sans-serif`;
    ctx.textAlign = "left";
    ctx.fillText("110% COATINGS", 24 * unit, clean.height + 30 * unit);
    ctx.font = `${Math.round(13 * unit)}px sans-serif`;
    ctx.fillStyle = "#d7bddc";
    ctx.fillText(`${finishLabel} · ${c.composed}`, 24 * unit, clean.height + 52 * unit);
    const link = document.createElement("a");
    link.download = "110-coatings-my-space.png";
    link.href = temp.toDataURL("image/png");
    link.click();
    setNotice(c.saved);
  };

  const sharePhoto = async () => {
    const clean = cleanCanvas();
    if (!clean) return;
    try {
      const blob: Blob | null = await new Promise(res => clean.toBlob(b => res(b), "image/jpeg", 0.92));
      if (!blob) throw new Error("blob");
      const file = new File([blob], "110-coatings-my-space.jpg", { type: "image/jpeg" });
      if (typeof navigator.share === "function" && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: c.shareTitle });
        setNotice(c.shared);
        return;
      }
    } catch (error) {
      // Closing the share sheet isn't a failure; don't follow it with a download.
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
    exportPhoto();
  };

  const onDrop = (ev: React.DragEvent<HTMLLabelElement>) => {
    ev.preventDefault();
    setIsDragOver(false);
    const file = ev.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  if (!photo) {
    return (
      <div className="photo-composer">
        <label
          className={`photo-dropzone${isDragOver ? " photo-dropzone-active" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={onDrop}
        >
          <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
          <div className="photo-dropzone-inner">
            <Upload size={28} strokeWidth={1.5} />
            <strong>{c.drop}</strong>
            <span>{c.dropHint}</span>
            <span className="photo-dropzone-hint">{c.dropNote}</span>
          </div>
        </label>
        {notice && <p className="photo-notice">{notice}</p>}
      </div>
    );
  }

  return (
    <div className="photo-composer">
      <div className="photo-canvas-wrap">
        <canvas
          ref={canvasRef}
          className="photo-canvas"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={stopDragging}
          onPointerCancel={stopDragging}
          onLostPointerCapture={stopDragging}
        />
        {detect && detect.status !== "off" && <div className={`photo-detect photo-detect-${detect.status}`} role="status">
          {detect.status === "found" ? <Check size={13} /> : <Loader2 size={13} className="photo-detect-spin" />}
          {detect.status === "loading" ? c.detecting(detect.percent) : detect.status === "finding" ? c.finding : c.detected}
        </div>}
        <div className="photo-canvas-hint"><Move size={13} />{c.handles}</div>
      </div>
      <div className="photo-actions">
        <button className="photo-action-ghost" onClick={clear}><Trash2 size={14} />{c.another}</button>
        <button className="photo-action-ghost" onClick={sharePhoto}><Share2 size={14} />{c.share}</button>
        <button className="photo-action-primary" onClick={exportPhoto}><Download size={16} />{c.save}</button>
      </div>
      {notice && <p className="photo-notice">{notice}</p>}
    </div>
  );
}
