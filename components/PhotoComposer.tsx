"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { Download, Move, Share2, Trash2, Upload } from "lucide-react";
import { buildFinishCanvas } from "@/lib/finish-texture";

type Point = { x: number; y: number };
type Corners = [Point, Point, Point, Point];

export type PhotoAppearance = { system: number; base: string; accent: string; sheen: number };

const HANDLE_RADIUS = 14;
const DEFAULT_CORNERS = (w: number, h: number): Corners => [
  { x: w * 0.18, y: h * 0.55 },
  { x: w * 0.82, y: h * 0.55 },
  { x: w * 1.02, y: h * 0.92 },
  { x: w * -0.02, y: h * 0.92 },
];

function drawWarpedTexture(ctx: CanvasRenderingContext2D, texture: HTMLCanvasElement, corners: Corners, subdivisions: number, opacity: number) {
  const dstPoint = (u: number, v: number): Point => {
    const top = { x: corners[0].x + (corners[1].x - corners[0].x) * u, y: corners[0].y + (corners[1].y - corners[0].y) * u };
    const bot = { x: corners[3].x + (corners[2].x - corners[3].x) * u, y: corners[3].y + (corners[2].y - corners[3].y) * u };
    return { x: top.x + (bot.x - top.x) * v, y: top.y + (bot.y - top.y) * v };
  };
  const triangle = (s0: Point, s1: Point, s2: Point, d0: Point, d1: Point, d2: Point) => {
    const sx1 = s1.x - s0.x, sy1 = s1.y - s0.y, sx2 = s2.x - s0.x, sy2 = s2.y - s0.y;
    const det = sx1 * sy2 - sx2 * sy1;
    if (Math.abs(det) < 1e-6) return;
    const ax = ((d1.x - d0.x) * sy2 - (d2.x - d0.x) * sy1) / det;
    const bx = ((d1.y - d0.y) * sy2 - (d2.y - d0.y) * sy1) / det;
    const cy = ((d2.x - d0.x) * sx1 - (d1.x - d0.x) * sx2) / det;
    const dy = ((d2.y - d0.y) * sx1 - (d1.y - d0.y) * sx2) / det;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(d0.x, d0.y); ctx.lineTo(d1.x, d1.y); ctx.lineTo(d2.x, d2.y);
    ctx.closePath();
    ctx.clip();
    ctx.setTransform(ax, bx, cy, dy, d0.x - ax * s0.x - cy * s0.y, d0.y - bx * s0.x - dy * s0.y);
    ctx.globalAlpha = opacity;
    ctx.drawImage(texture, 0, 0);
    ctx.restore();
  };
  const tex = texture.width;
  for (let v = 0; v < subdivisions; v++) {
    for (let u = 0; u < subdivisions; u++) {
      const su = u / subdivisions * tex, sv = v / subdivisions * tex;
      const su1 = (u + 1) / subdivisions * tex, sv1 = (v + 1) / subdivisions * tex;
      const s0: Point = { x: su, y: sv }, s1: Point = { x: su1, y: sv }, s2: Point = { x: su1, y: sv1 }, s3: Point = { x: su, y: sv1 };
      const d0 = dstPoint(u / subdivisions, v / subdivisions);
      const d1 = dstPoint((u + 1) / subdivisions, v / subdivisions);
      const d2 = dstPoint((u + 1) / subdivisions, (v + 1) / subdivisions);
      const d3 = dstPoint(u / subdivisions, (v + 1) / subdivisions);
      triangle(s0, s1, s2, d0, d1, d2);
      triangle(s0, s2, s3, d0, d2, d3);
    }
  }
}

export function PhotoComposer({ appearance, finishLabel }: { appearance: PhotoAppearance; finishLabel: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [corners, setCorners] = useState<Corners | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const [notice, setNotice] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const texture = useMemo(() => buildFinishCanvas(appearance.system, appearance.base, appearance.accent), [appearance.system, appearance.base, appearance.accent]);
  const opacity = 0.72 + appearance.sheen * 0.18;

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas || !image || !corners) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(image, 0, 0);
    ctx.globalCompositeOperation = "multiply";
    drawWarpedTexture(ctx, texture, corners, 24, opacity);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    const scale = canvas.width / canvas.clientWidth;
    const radius = HANDLE_RADIUS * scale;
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
  };

  useEffect(() => { render(); });

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) { setNotice("That doesn't look like an image. Try a JPG or PNG."); return; }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setImage(img);
      setCorners(DEFAULT_CORNERS(img.naturalWidth, img.naturalHeight));
      setNotice("Drag the four handles to the corners of your floor.");
      URL.revokeObjectURL(url);
    };
    img.onerror = () => { setNotice("Couldn't load that image. Try another one."); URL.revokeObjectURL(url); };
    img.src = url;
  };

  const toImageCoords = (ev: PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (ev.clientX - rect.left) * scaleX, y: (ev.clientY - rect.top) * scaleY };
  };

  const findHandle = (p: Point): number | null => {
    if (!corners) return null;
    const canvas = canvasRef.current!;
    const scale = canvas.width / canvas.clientWidth;
    const hitRadius = (HANDLE_RADIUS + 10) * scale;
    for (let i = 0; i < 4; i++) {
      const dx = p.x - corners[i].x;
      const dy = p.y - corners[i].y;
      if (Math.hypot(dx, dy) <= hitRadius) return i;
    }
    return null;
  };

  const onPointerDown = (ev: PointerEvent<HTMLCanvasElement>) => {
    const point = toImageCoords(ev);
    const handle = findHandle(point);
    if (handle === null) return;
    ev.currentTarget.setPointerCapture(ev.pointerId);
    setDragging(handle);
  };
  const onPointerMove = (ev: PointerEvent<HTMLCanvasElement>) => {
    if (dragging === null || !corners || !image) return;
    const point = toImageCoords(ev);
    const next: Corners = [...corners] as Corners;
    next[dragging] = {
      x: Math.max(-image.naturalWidth * 0.1, Math.min(image.naturalWidth * 1.1, point.x)),
      y: Math.max(-image.naturalHeight * 0.1, Math.min(image.naturalHeight * 1.1, point.y)),
    };
    setCorners(next);
  };
  const stopDragging = () => setDragging(null);

  const clear = () => {
    setImage(null);
    setCorners(null);
    setNotice("");
  };

  const exportPhoto = () => {
    const canvas = canvasRef.current;
    if (!canvas || !image || !corners) return;
    const temp = document.createElement("canvas");
    temp.width = canvas.width;
    temp.height = canvas.height + 72;
    const ctx = temp.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#17121e";
    ctx.fillRect(0, 0, temp.width, temp.height);
    ctx.drawImage(image, 0, 0);
    ctx.globalCompositeOperation = "multiply";
    drawWarpedTexture(ctx, texture, corners, 32, opacity);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#17121e";
    ctx.fillRect(0, canvas.height, temp.width, 72);
    ctx.fillStyle = "#eee4f4";
    ctx.font = "18px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("110% COATINGS", 24, canvas.height + 30);
    ctx.font = "13px sans-serif";
    ctx.fillStyle = "#d7bddc";
    ctx.fillText(`${finishLabel} · composed in Floor Studio`, 24, canvas.height + 52);
    const link = document.createElement("a");
    link.download = "110-coatings-my-space.png";
    link.href = temp.toDataURL("image/png");
    link.click();
    setNotice("Saved. Share it with whoever needs to see it.");
  };

  const sharePhoto = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !image || !corners) return;
    const temp = document.createElement("canvas");
    temp.width = canvas.width;
    temp.height = canvas.height;
    const ctx = temp.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(image, 0, 0);
    ctx.globalCompositeOperation = "multiply";
    drawWarpedTexture(ctx, texture, corners, 32, opacity);
    try {
      const blob: Blob | null = await new Promise(res => temp.toBlob(b => res(b), "image/png"));
      if (!blob) throw new Error("blob");
      const file = new File([blob], "110-coatings-my-space.png", { type: "image/png" });
      if (typeof navigator.share === "function" && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "My 110% Coatings floor" });
        setNotice("Shared.");
        return;
      }
    } catch { /* fall through */ }
    exportPhoto();
  };

  const onDrop = (ev: React.DragEvent<HTMLLabelElement>) => {
    ev.preventDefault();
    setIsDragOver(false);
    const file = ev.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  if (!image) {
    return (
      <div className="photo-composer">
        <label
          className={`photo-dropzone${isDragOver ? " photo-dropzone-active" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={onDrop}
        >
          <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          <div className="photo-dropzone-inner">
            <Upload size={28} strokeWidth={1.5} />
            <strong>Drop a photo of your space</strong>
            <span>Garage, basement, living room — JPG or PNG, usually from your phone camera.</span>
            <span className="photo-dropzone-hint">We render your chosen finish onto the floor so you can see it in your own space.</span>
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
        <div className="photo-canvas-hint"><Move size={13} />Drag the numbered handles to the four corners of your floor</div>
      </div>
      <div className="photo-actions">
        <button className="photo-action-ghost" onClick={clear}><Trash2 size={14} />Use a different photo</button>
        <button className="photo-action-ghost" onClick={sharePhoto}><Share2 size={14} />Share</button>
        <button className="photo-action-primary" onClick={exportPhoto}><Download size={16} />Save my photo</button>
      </div>
      {notice && <p className="photo-notice">{notice}</p>}
    </div>
  );
}
