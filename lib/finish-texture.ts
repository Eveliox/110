export function buildFinishCanvas(system: number, base: string, accent: string): HTMLCanvasElement {
  const tile = document.createElement("canvas");
  tile.width = 1024; tile.height = 1024;
  const ctx = tile.getContext("2d")!;
  let seed = 31;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  ctx.fillStyle = base; ctx.fillRect(0, 0, 1024, 1024);
  if (system === 0) {
    const gradient = ctx.createLinearGradient(0, 0, 1024, 1024);
    gradient.addColorStop(0, base); gradient.addColorStop(.4, accent); gradient.addColorStop(.65, base); gradient.addColorStop(1, accent);
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 220; i++) {
      const y = i * 6 - 220;
      ctx.beginPath(); ctx.moveTo(-120, y);
      ctx.bezierCurveTo(240, y + 320 + Math.sin(i * .09) * 180, 540, y - 240, 1180, y + 220);
      ctx.strokeStyle = i % 3 === 0 ? accent : base;
      ctx.globalAlpha = .14 + random() * .22;
      ctx.lineWidth = 2 + random() * 26;
      ctx.stroke();
    }
  } else if (system === 1) {
    for (let i = 0; i < 42000; i++) {
      const x = random() * 1024, y = random() * 1024, r = 1.5 + random() * 3.5;
      ctx.fillStyle = [accent, base, "#272b30", "#e7e4dd"][i % 4];
      ctx.globalAlpha = .55 + random() * .4;
      ctx.beginPath();
      ctx.moveTo(x, y); ctx.lineTo(x + r * 1.6, y + r * .3); ctx.lineTo(x + r, y + r); ctx.lineTo(x - r * .2, y + r * .8);
      ctx.closePath(); ctx.fill();
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
  const density = system === 1 ? 14000 : system === 2 ? 6000 : 3000;
  for (let i = 0; i < density; i++) {
    const x = random() * 512, y = random() * 512, s = system === 1 ? 1 + random() * 2.5 : 1 + random() * 4;
    ctx.globalAlpha = .35 + random() * .55;
    ctx.fillStyle = random() > .5 ? "#fff" : "#222";
    ctx.fillRect(x, y, s, s);
  }
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
    for (let i = 0; i < 9000; i++) {
      const x = random() * 512, y = random() * 512, r = 2 + random() * 4;
      const dx = Math.round(10 + random() * 40), dy = Math.round(10 + random() * 40);
      ctx.fillStyle = `rgb(${128 + dx},${128 - dy},255)`;
      ctx.globalAlpha = .55;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
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
