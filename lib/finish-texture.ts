// How many times each procedural tile repeats across the 6m floor. Flake chips are only ~1cm,
// which a single 1024px tile spread over 6m can't resolve.
export const finishRepeat = (system: number) => system === 1 ? 3 : 1;

const hexRgb = (hex: string): [number, number, number] => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];

// Value noise on a lattice that wraps every `period` cells, so fbm over [0,1) tiles seamlessly.
function tileNoise(x: number, y: number, period: number, seed: number) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
  const hash = (hx: number, hy: number) => {
    let h = Math.imul(((hx % period) + period) % period, 374761393) ^ Math.imul(((hy % period) + period) % period, 668265263) ^ seed;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy), b = hash(ix + 1, iy), c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

function fbm(x: number, y: number, seed: number, base = 3, octaves = 4) {
  let sum = 0, amp = .5, freq = base;
  for (let o = 0; o < octaves; o++, amp *= .5, freq *= 2) sum += amp * tileNoise(x * freq, y * freq, freq, seed + o * 1013);
  return sum / (1 - .5 ** octaves);
}

// Metallic epoxy: pigment pulled into marbled cells by a twice domain-warped field, with
// bright lacing where the warp folds over on itself.
function paintMetallic(ctx: CanvasRenderingContext2D, base: string, accent: string, n = 512, span = 1, out = 1024) {
  const image = ctx.createImageData(n, n);
  const [br, bg, bb] = hexRgb(base), [ar, ag, ab] = hexRgb(accent);
  for (let py = 0; py < n; py++) for (let px = 0; px < n; px++) {
    const x = px / n * span, y = py / n * span;
    const qx = fbm(x, y, 11), qy = fbm(x + .37, y + .71, 23);
    const rx = fbm(x + .45 * qx, y + .45 * qy, 37, 2);
    const v = fbm(x + .35 * rx, y + .35 * qx, 51, 2);
    const cell = Math.min(1, Math.max(0, (v - .3) / .45));
    const shade = cell * cell * (3 - 2 * cell);
    const lace = Math.exp(-Math.abs(rx - .52) * 16) * .22 + Math.exp(-Math.abs(v - .58) * 24) * .14;
    const t = Math.min(1, shade * .78 + lace);
    const pool = .72 + .28 * Math.min(1, v * 1.5);
    const i = (py * n + px) * 4;
    image.data[i] = (br * pool) + (ar - br * pool) * t;
    image.data[i + 1] = (bg * pool) + (ag - bg * pool) * t;
    image.data[i + 2] = (bb * pool) + (ab - bb * pool) * t;
    image.data[i + 3] = 255;
  }
  const field = document.createElement("canvas");
  field.width = field.height = n;
  field.getContext("2d")!.putImageData(image, 0, 0);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(field, 0, 0, out, out);
}

// A 4×4in sample chip close up, so 512px ≈ 10cm: individual flakes and the pull of a single
// metallic swirl are visible, unlike the room-scale floor tiles above.
export function buildSampleCanvas(system: number, base: string, accent: string): HTMLCanvasElement {
  const size = 512;
  const tile = document.createElement("canvas");
  tile.width = tile.height = size;
  const ctx = tile.getContext("2d")!;
  let seed = 71;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  ctx.fillStyle = base; ctx.fillRect(0, 0, size, size);
  if (system === 0) {
    paintMetallic(ctx, base, accent, 224, .6, size);
    for (let i = 0; i < 5000; i++) {
      ctx.globalAlpha = .06 + random() * .14;
      ctx.fillStyle = random() > .4 ? accent : "#ffffff";
      ctx.fillRect(random() * size, random() * size, 1, 1);
    }
  } else if (system === 1) {
    const palette = [accent, accent, base, base, base, "#2a2d31", "#e9e6df", "#6f7276"];
    for (let i = 0; i < 2600; i++) {
      const x = random() * size, y = random() * size, r = 6 + random() * random() * 22;
      const angle = random() * Math.PI * 2, sides = 4 + Math.floor(random() * 3);
      ctx.fillStyle = palette[Math.floor(random() * palette.length)];
      ctx.globalAlpha = .9;
      ctx.beginPath();
      for (let k = 0; k < sides; k++) {
        const a = angle + k / sides * Math.PI * 2, radius = r * (.55 + random() * .6);
        ctx[k ? "lineTo" : "moveTo"](x + Math.cos(a) * radius, y + Math.sin(a) * radius * .8);
      }
      ctx.closePath(); ctx.fill();
    }
  } else {
    for (let i = 0; i < 160; i++) {
      const x = random() * size, y = random() * size, r = 40 + random() * 140;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, random() > .5 ? accent : "#3c3d3b"); g.addColorStop(1, "transparent");
      ctx.globalAlpha = .06 + random() * .1;
      ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    // Exposed fine aggregate from the grind.
    for (let i = 0; i < 1400; i++) {
      const x = random() * size, y = random() * size, r = .8 + random() * random() * 5;
      ctx.globalAlpha = .25 + random() * .45;
      ctx.fillStyle = ["#d9d5cc", "#6d6a64", "#a49b8c", "#2f2f2d"][Math.floor(random() * 4)];
      ctx.beginPath(); ctx.ellipse(x, y, r, r * (.6 + random() * .4), random() * Math.PI, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
  return tile;
}

// Draws `paint` at (x, y) plus wrapped copies when it overlaps a tile edge, keeping repeats seamless.
function wrapped(size: number, x: number, y: number, r: number, paint: (x: number, y: number) => void) {
  for (const dx of [-size, 0, size]) for (const dy of [-size, 0, size]) {
    if ((dx && (x + dx < -r || x + dx > size + r)) || (dy && (y + dy < -r || y + dy > size + r))) continue;
    paint(x + dx, y + dy);
  }
}

export function buildFinishCanvas(system: number, base: string, accent: string): HTMLCanvasElement {
  const tile = document.createElement("canvas");
  tile.width = 1024; tile.height = 1024;
  const ctx = tile.getContext("2d")!;
  let seed = 31;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  ctx.fillStyle = base; ctx.fillRect(0, 0, 1024, 1024);
  if (system === 0) {
    paintMetallic(ctx, base, accent);
    // Fine mica glints suspended in the coat.
    for (let i = 0; i < 26000; i++) {
      ctx.globalAlpha = .05 + random() * .12;
      ctx.fillStyle = random() > .4 ? accent : "#ffffff";
      ctx.fillRect(random() * 1024, random() * 1024, 1, 1);
    }
  } else if (system === 1) {
    // Full broadcast: the base coat is completely hidden under overlapping vinyl chips. The tile
    // spans 2m (see finishRepeat), so 1px ≈ 2mm and chips land in the real 6–12mm range.
    const palette = [accent, accent, base, base, base, "#2a2d31", "#e9e6df", "#6f7276"];
    for (let i = 0; i < 115000; i++) {
      const x = random() * 1024, y = random() * 1024, r = 1.6 + random() * random() * 4.2;
      const angle = random() * Math.PI * 2, sides = 4 + Math.floor(random() * 3);
      const radii = Array.from({ length: sides }, () => r * (.55 + random() * .6));
      ctx.fillStyle = palette[Math.floor(random() * palette.length)];
      ctx.globalAlpha = .82 + random() * .18;
      wrapped(1024, x, y, r * 1.2, (cx, cy) => {
        ctx.beginPath();
        radii.forEach((radius, k) => {
          const a = angle + k / sides * Math.PI * 2;
          ctx[k ? "lineTo" : "moveTo"](cx + Math.cos(a) * radius, cy + Math.sin(a) * radius * .8);
        });
        ctx.closePath(); ctx.fill();
      });
    }
  } else {
    for (let i = 0; i < 700; i++) {
      const x = random() * 1024, y = random() * 1024, r = 30 + random() * 120;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, accent); g.addColorStop(1, "transparent");
      ctx.globalAlpha = .05 + random() * .09;
      ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    for (let i = 0; i < 24000; i++) {
      ctx.globalAlpha = random() * .11;
      ctx.fillStyle = i % 2 ? accent : "#333333";
      ctx.fillRect(random() * 1024, random() * 1024, 1, 1);
    }
  }
  ctx.globalAlpha = 1;
  return tile;
}

export function buildRoughnessCanvas(system: number): HTMLCanvasElement {
  const tile = document.createElement("canvas");
  tile.width = 512; tile.height = 512;
  const ctx = tile.getContext("2d")!;
  let seed = 97;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  ctx.fillStyle = system === 1 ? "#888" : system === 2 ? "#aaa" : "#444";
  ctx.fillRect(0, 0, 512, 512);
  if (system === 1) {
    // Per-chip variation, sized like the chips in the colour tile.
    for (let i = 0; i < 14000; i++) {
      const x = random() * 512, y = random() * 512, r = .8 + random() * 1.6;
      ctx.globalAlpha = .25 + random() * .4;
      ctx.fillStyle = random() > .5 ? "#bbb" : "#555";
      wrapped(512, x, y, r, (cx, cy) => { ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill(); });
    }
  } else {
    // Soft wear and trowel variation; hard-edged specks read as sparkling squares under lights.
    for (let i = 0; i < 900; i++) {
      const x = random() * 512, y = random() * 512, r = 10 + random() * 40;
      const tone = random() > .5 ? 255 : 0;
      ctx.globalAlpha = .05 + random() * .1;
      wrapped(512, x, y, r, (cx, cy) => {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, `rgb(${tone},${tone},${tone})`); g.addColorStop(1, `rgba(${tone},${tone},${tone},0)`);
        ctx.fillStyle = g; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      });
    }
  }
  ctx.globalAlpha = 1;
  return tile;
}

export function buildNormalCanvas(system: number): HTMLCanvasElement {
  const tile = document.createElement("canvas");
  tile.width = 512; tile.height = 512;
  const ctx = tile.getContext("2d")!;
  let seed = 227;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  ctx.fillStyle = "rgb(128,128,255)"; ctx.fillRect(0, 0, 512, 512);
  if (system === 1) {
    // Chip edges catching the light under the clear topcoat: each chip tilts a little.
    for (let i = 0; i < 26000; i++) {
      const x = random() * 512, y = random() * 512, r = .8 + random() * 2.2;
      const dx = Math.round(random() * 50 - 25), dy = Math.round(random() * 50 - 25);
      ctx.fillStyle = `rgb(${128 + dx},${128 + dy},255)`;
      ctx.globalAlpha = .5;
      wrapped(512, x, y, r, (cx, cy) => { ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill(); });
    }
  } else if (system === 2) {
    for (let i = 0; i < 4500; i++) {
      const x = random() * 512, y = random() * 512, r = 8 + random() * 24;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(${150 + Math.round(random() * 40)},${110 + Math.round(random() * 30)},255,0.6)`);
      g.addColorStop(1, "rgba(128,128,255,0)");
      ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
  } else {
    for (let i = 0; i < 2500; i++) {
      const x = random() * 512, y = random() * 512, w = 60 + random() * 180, h = 2 + random() * 6;
      ctx.save();
      ctx.translate(x, y); ctx.rotate(Math.PI / 4);
      const dx = Math.round(random() * 20 - 10);
      ctx.fillStyle = `rgb(${128 + dx},${128 - dx * 0.3},255)`;
      ctx.globalAlpha = .22;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.restore();
    }
  }
  ctx.globalAlpha = 1;
  return tile;
}

export function buildInstallStageCanvas(stage: number, system: number, base: string, accent: string): HTMLCanvasElement {
  if (stage >= 1) return buildFinishCanvas(system, base, accent);
  const tile = document.createElement("canvas");
  tile.width = 1024; tile.height = 1024;
  const ctx = tile.getContext("2d")!;
  let seed = 51 + stage * 7;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  if (stage < 0.33) {
    ctx.fillStyle = "#6c6a68"; ctx.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 1800; i++) {
      const x = random() * 1024, y = random() * 1024, r = 30 + random() * 160;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, random() > .5 ? "#8a8681" : "#4e4c49");
      g.addColorStop(1, "transparent");
      ctx.globalAlpha = .14 + random() * .18;
      ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    for (let i = 0; i < 70; i++) {
      ctx.strokeStyle = "#38352f";
      ctx.globalAlpha = .25 + random() * .35;
      ctx.lineWidth = 1 + random() * 2.5;
      ctx.beginPath();
      ctx.moveTo(random() * 1024, random() * 1024);
      ctx.bezierCurveTo(random() * 1024, random() * 1024, random() * 1024, random() * 1024, random() * 1024, random() * 1024);
      ctx.stroke();
    }
  } else {
    const bg = ctx.createLinearGradient(0, 0, 1024, 1024);
    bg.addColorStop(0, system === 2 ? "#858782" : base); bg.addColorStop(1, system === 2 ? "#a5a69f" : base);
    ctx.fillStyle = bg; ctx.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 400; i++) {
      const x = random() * 1024, y = random() * 1024, r = 40 + random() * 220;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, accent);
      g.addColorStop(1, "transparent");
      ctx.globalAlpha = .03 + random() * .05;
      ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
  }
  ctx.globalAlpha = 1;
  return tile;
}

export const finishPhotoPath = (systemId: string, colorName: string, kind: "map" | "normal" = "map") => {
  const slug = colorName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `/finishes/${systemId}-${slug}${kind === "normal" ? "-normal" : ""}.jpg`;
};

export const roomGlbPath = (roomIndex: number): string => {
  const slugs = ["living", "garage", "showroom", "basement", "patio"];
  return `/rooms/${slugs[roomIndex] ?? "living"}.glb`;
};
