"use client";

import { useEffect, useRef, useState } from "react";
import { RotateCcw, Sparkles } from "lucide-react";
import { sound } from "@/lib/sound";

// One original stacked comparison photo: the raw slab above, the finished metallic floor below,
// shot from nearly the same spot so the two halves register.
const SOURCE = "/gallery/before-after-2.jpg";
const BEFORE = { x: 10, y: 10, w: 1180, h: 582 };
const AFTER = { x: 10, y: 606, w: 1180, h: 582 };

type Point = { x: number; y: number };

/** Drag a squeegee across the raw concrete to pull the finished coat over it. */
export function SqueegeeReveal() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const api = useRef<{ reveal: () => void; reset: () => void }>({ reveal: () => {}, reset: () => {} });
  const [coverage, setCoverage] = useState(0);
  const [cured, setCured] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current, canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d")!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const photo = new window.Image();
    photo.src = SOURCE;

    const layers = { before: document.createElement("canvas"), after: document.createElement("canvas"), coated: document.createElement("canvas"), mask: document.createElement("canvas"), wet: document.createElement("canvas"), probe: document.createElement("canvas") };
    layers.probe.width = 64; layers.probe.height = 32;
    let width = 0, height = 0, ratio = 1, frame = 0, inView = false, dirty = true;
    let blade: { at: Point; angle: number; visible: boolean } = { at: { x: 0, y: 0 }, angle: 0, visible: false };
    let readyForDemo = false, lastMoveAt = 0, dragging = false, last: Point | null = null, lastAngle = 0, wetUntil = 0, demoPlayed = false, sweep: { t0: number } | null = null, strokes = 0;

    // Crop a source half to the canvas aspect, like object-fit: cover.
    const paintHalf = (target: HTMLCanvasElement, rect: typeof BEFORE) => {
      target.width = width; target.height = height;
      const c = target.getContext("2d")!;
      const scale = Math.max(width / rect.w, height / rect.h);
      const sw = width / scale, sh = height / scale;
      c.drawImage(photo, rect.x + (rect.w - sw) / 2, rect.y + (rect.h - sh) * .55, sw, sh, 0, 0, width, height);
    };
    const resize = () => {
      const bounds = wrap.getBoundingClientRect();
      ratio = Math.min(2, devicePixelRatio || 1);
      width = Math.round(bounds.width * ratio); height = Math.round(bounds.height * ratio);
      if (!width || !height) return;
      // Keep what's already been coated across a resize.
      const previous = layers.mask.width ? (() => { const keep = document.createElement("canvas"); keep.width = layers.mask.width; keep.height = layers.mask.height; keep.getContext("2d")!.drawImage(layers.mask, 0, 0); return keep; })() : null;
      canvas.width = width; canvas.height = height;
      for (const layer of [layers.mask, layers.wet]) { layer.width = Math.ceil(width / 2); layer.height = Math.ceil(height / 2); }
      layers.coated.width = width; layers.coated.height = height;
      if (previous) layers.mask.getContext("2d")!.drawImage(previous, 0, 0, layers.mask.width, layers.mask.height);
      if (photo.complete && photo.naturalWidth) { paintHalf(layers.before, BEFORE); paintHalf(layers.after, AFTER); }
      dirty = true;
    };
    photo.onload = () => { resize(); if (readyForDemo) demo(); };

    const bladeLength = () => Math.min(width, height) * .36;
    // The squeegee leaves a straight-edged swath: fill the quad between consecutive blade positions.
    const pull = (from: Point, to: Point, angleFrom: number, angleTo: number) => {
      const half = bladeLength() / 2 / 2; // mask is half resolution
      const ends = (p: Point, a: number) => [{ x: p.x / 2 + Math.cos(a) * half, y: p.y / 2 + Math.sin(a) * half }, { x: p.x / 2 - Math.cos(a) * half, y: p.y / 2 - Math.sin(a) * half }];
      const [a1, a2] = ends(from, angleFrom), [b1, b2] = ends(to, angleTo);
      for (const [layer, fill] of [[layers.mask, "#fff"], [layers.wet, "#ffffff70"]] as const) {
        const c = layer.getContext("2d")!;
        c.fillStyle = fill;
        c.beginPath(); c.moveTo(a1.x, a1.y); c.lineTo(b1.x, b1.y); c.lineTo(b2.x, b2.y); c.lineTo(a2.x, a2.y); c.closePath(); c.fill();
        // Overdraw the edges so neighbouring swaths don't leave anti-aliased hairlines between them.
        if (layer === layers.mask) { c.strokeStyle = fill; c.lineWidth = 1.5; c.stroke(); }
      }
      wetUntil = performance.now() + 1800; dirty = true;
    };
    const move = (to: Point) => {
      if (last) {
        const dx = to.x - last.x, dy = to.y - last.y;
        if (Math.hypot(dx, dy) < 1) return;
        // The blade sits across the direction of travel and turns smoothly as the stroke curves.
        let target = Math.atan2(dy, dx) + Math.PI / 2;
        while (target - lastAngle > Math.PI / 2) target -= Math.PI;
        while (target - lastAngle < -Math.PI / 2) target += Math.PI;
        const angle = lastAngle + (target - lastAngle) * .35;
        const now = performance.now();
        sound.squeegee(Math.hypot(dx, dy) / ratio / Math.max(4, now - lastMoveAt));
        lastMoveAt = now;
        pull(last, to, lastAngle, angle);
        lastAngle = angle;
        if (++strokes % 8 === 0) measure();
      }
      last = to;
      blade = { at: to, angle: lastAngle, visible: true };
    };
    const measure = () => {
      const probe = layers.probe.getContext("2d", { willReadFrequently: true })!;
      probe.clearRect(0, 0, 64, 32); probe.drawImage(layers.mask, 0, 0, 64, 32);
      const data = probe.getImageData(0, 0, 64, 32).data;
      let lit = 0; for (let i = 3; i < data.length; i += 4) lit += data[i] / 255;
      const share = lit / (64 * 32);
      setCoverage(Math.round(share * 100));
      if (share > .8 && !sweep) finish();
    };
    // Coat whatever's left with one last pass from the left, then let it cure.
    const finish = () => { sweep = { t0: performance.now() }; dirty = true; };

    const local = (event: PointerEvent): Point => { const r = canvas.getBoundingClientRect(); return { x: (event.clientX - r.left) * ratio, y: (event.clientY - r.top) * ratio }; };
    const down = (event: PointerEvent) => { dragging = true; last = local(event); blade = { at: last, angle: lastAngle, visible: true }; canvas.setPointerCapture(event.pointerId); setTouched(true); };
    const over = (event: PointerEvent) => { const p = local(event); if (dragging) move(p); else { blade = { at: p, angle: lastAngle, visible: event.pointerType !== "touch" }; dirty = true; } };
    const up = () => { dragging = false; last = null; measure(); };
    const leave = () => { if (!dragging) { blade.visible = false; dirty = true; } };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", over);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    canvas.addEventListener("pointerleave", leave);

    const demo = () => {
      if (reduce || demoPlayed) return;
      demoPlayed = true;
      const t0 = performance.now();
      const path = (t: number): Point => ({ x: width * (.08 + .3 * t), y: height * (.25 + .5 * t + Math.sin(t * Math.PI) * -.08) });
      last = path(0);
      const step = (now: number) => {
        if (dragging) return;
        const t = Math.min(1, (now - t0) / 1500);
        move(path(t * t * (3 - 2 * t)));
        if (t < 1) requestAnimationFrame(step);
        else { last = null; setTimeout(() => { if (!dragging) { blade.visible = false; dirty = true; } }, 500); measure(); }
      };
      requestAnimationFrame(step);
    };

    const draw = (now: number) => {
      frame = requestAnimationFrame(draw);
      if (!inView || !width || !photo.complete) return;
      if (sweep) {
        const t = Math.min(1, (now - sweep.t0) / (reduce ? 1 : 900));
        const m = layers.mask.getContext("2d")!;
        m.fillStyle = "#fff"; m.fillRect(0, 0, layers.mask.width * (t * t * (3 - 2 * t)), layers.mask.height);
        dirty = true;
        if (t >= 1) { sweep = null; setCoverage(100); setCured(true); }
      }
      const wet = now < wetUntil;
      if (wet) {
        // Fresh resin glistens, then levels and dulls to the finished sheen.
        const w = layers.wet.getContext("2d")!;
        w.globalCompositeOperation = "destination-out"; w.fillStyle = "#00000010"; w.fillRect(0, 0, layers.wet.width, layers.wet.height);
        w.globalCompositeOperation = "source-over";
      }
      if (!dirty && !wet) return;
      dirty = false;
      ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
      ctx.drawImage(layers.before, 0, 0);
      const coated = layers.coated.getContext("2d")!;
      coated.globalCompositeOperation = "source-over";
      coated.clearRect(0, 0, width, height);
      coated.drawImage(layers.after, 0, 0);
      coated.globalCompositeOperation = "destination-in";
      coated.drawImage(layers.mask, 0, 0, width, height);
      ctx.drawImage(layers.coated, 0, 0);
      ctx.globalCompositeOperation = "screen"; ctx.globalAlpha = .55;
      ctx.drawImage(layers.wet, 0, 0, width, height);
      ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
      if (blade.visible) {
        const length = bladeLength();
        ctx.save();
        ctx.translate(blade.at.x, blade.at.y); ctx.rotate(blade.angle);
        // The bead of resin pushed ahead of the rubber, then the blade and its frame.
        ctx.fillStyle = "#ffffff55"; ctx.fillRect(-length / 2, -9 * ratio, length, 5 * ratio);
        ctx.fillStyle = "#121214"; ctx.fillRect(-length / 2, -4 * ratio, length, 8 * ratio);
        ctx.fillStyle = "#c9c9cf"; ctx.fillRect(-length / 2, 4 * ratio, length, 3 * ratio);
        ctx.fillStyle = "#2b2b30"; ctx.fillRect(-2 * ratio, 7 * ratio, 4 * ratio, length * .55);
        ctx.restore();
      }
    };

    const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(wrap);
    const io = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; readyForDemo = entry.intersectionRatio > .6; if (inView) { dirty = true; if (readyForDemo && photo.complete && width) demo(); } }, { threshold: [0, .6] });
    io.observe(wrap);
    frame = requestAnimationFrame(draw);

    api.current = {
      reveal: () => finish(),
      reset: () => {
        for (const layer of [layers.mask, layers.wet]) layer.getContext("2d")!.clearRect(0, 0, layer.width, layer.height);
        sweep = null; strokes = 0; setCoverage(0); setCured(false); dirty = true;
      },
    };
    return () => {
      cancelAnimationFrame(frame); resizeObserver.disconnect(); io.disconnect();
      canvas.removeEventListener("pointerdown", down); canvas.removeEventListener("pointermove", over);
      canvas.removeEventListener("pointerup", up); canvas.removeEventListener("pointercancel", up); canvas.removeEventListener("pointerleave", leave);
    };
  }, []);

  return <figure className="squeegee">
    <div className="squeegee-stage" ref={wrapRef}>
      <canvas ref={canvasRef} role="img" aria-label="Interactive before and after of one of our projects: a bare, dusty concrete slab that becomes a glossy blue and white metallic epoxy floor as you drag across it." />
      <span className="squeegee-pill before">Raw slab</span>
      <span className={`squeegee-pill after ${coverage > 0 ? "shown" : ""}`}>Metallic epoxy</span>
      {!touched && !cured && <span className="squeegee-cue" aria-hidden="true">Drag to pull the coat</span>}
    </div>
    <figcaption className="squeegee-bar">
      <span className="squeegee-meter" aria-live="polite"><span style={{ width: `${coverage}%` }} /><b>{cured ? "100% coated · Cured" : `${coverage}% coated`}</b></span>
      <span className="squeegee-actions">
        {!cured && <button onClick={() => api.current.reveal()}><Sparkles size={13} />Finish the coat</button>}
        {coverage > 0 && <button onClick={() => api.current.reset()}><RotateCcw size={13} />Back to bare concrete</button>}
      </span>
      <small>Original project photographs. Same room, before and after.</small>
    </figcaption>
  </figure>;
}
