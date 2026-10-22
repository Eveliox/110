"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

export function BeforeAfter({
  before,
  after,
  label,
  finish,
  aspect = "4 / 3",
}: {
  before: string;
  after: string;
  label: string;
  finish?: string;
  aspect?: string;
}) {
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const setFromClient = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const next = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, next)));
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: PointerEvent) => setFromClient(e.clientX);
    const onUp = () => setDragging(false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [dragging, setFromClient]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setPos((p) => Math.max(0, p - 5));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setPos((p) => Math.min(100, p + 5));
    } else if (e.key === "Home") {
      e.preventDefault();
      setPos(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setPos(100);
    }
  };

  const effectivePos = prefersReducedMotion ? 50 : pos;

  return (
    <div
      ref={containerRef}
      className="ba-wrap"
      role="slider"
      aria-label={`Before and after: ${label}`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(effectivePos)}
      tabIndex={0}
      onKeyDown={onKey}
      onPointerDown={(e) => {
        setDragging(true);
        setFromClient(e.clientX);
      }}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: aspect,
        overflow: "hidden",
        borderRadius: 20,
        background: "var(--ink-2)",
        cursor: prefersReducedMotion ? "default" : "ew-resize",
        touchAction: "none",
        userSelect: "none",
      }}
    >
      <Image
        src={before}
        alt={`Before: ${label}`}
        fill
        sizes="(max-width: 900px) 100vw, 50vw"
        style={{ objectFit: "cover", filter: "contrast(1.03)" }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          clipPath: `inset(0 0 0 ${effectivePos}%)`,
          overflow: "hidden",
        }}
      >
        <Image
          src={after}
          alt={`After: ${label}`}
          fill
          sizes="(max-width: 900px) 100vw, 50vw"
          style={{
            objectFit: "cover",
            filter: "contrast(1.08) saturate(1.05)",
          }}
        />
      </div>

      <span className="ba-pill ba-pill-before">Before</span>
      <span className="ba-pill ba-pill-after">After</span>

      {finish && (
        <span
          className="expanded-label"
          style={{
            position: "absolute",
            left: 20,
            bottom: 20,
            color: "#fff",
            background: "rgba(11,11,13,0.55)",
            padding: "6px 10px",
            borderRadius: 999,
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            fontSize: 10,
          }}
        >
          {label}
        </span>
      )}

      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${effectivePos}%`,
          width: 2,
          background: "linear-gradient(180deg, #FF1AA3 0%, #7B2CF5 100%)",
          transform: "translateX(-1px)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "50%",
          left: `${effectivePos}%`,
          transform: "translate(-50%, -50%)",
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "#fff",
          border: "1px solid rgba(11,11,13,0.08)",
          boxShadow: "0 10px 30px rgba(11,11,13,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "linear-gradient(100deg, #FF1AA3 0%, #7B2CF5 100%)",
          }}
        />
      </div>

      <style>{`
        .ba-pill {
          position: absolute;
          top: 16px;
          font-family: var(--font-display);
          font-variation-settings: "wdth" 125;
          font-weight: 500;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.3em;
          padding: 6px 10px;
          border-radius: 999px;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 2;
        }
        .ba-pill-before {
          left: 16px;
          background: rgba(255,255,255,0.9);
          color: var(--ink);
        }
        .ba-pill-after {
          right: 16px;
          background: rgba(11,11,13,0.65);
          color: #fff;
        }
      `}</style>
    </div>
  );
}
