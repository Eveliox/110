"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Smartphone } from "lucide-react";
import { finishes } from "@/lib/design";
import { floorSystems } from "@/lib/floor-studio";
import { buildSampleCanvas } from "@/lib/finish-texture";
import { useAtmosphere } from "./SiteAtmosphere";
import { sound } from "@/lib/sound";

const systemFor = (slug: string) => slug === "metallic-epoxy" ? 0 : slug === "epoxy-flake" ? 1 : 2;
const clamp = (v: number) => Math.max(-1, Math.min(1, v));

type OrientationPermission = { requestPermission?: () => Promise<"granted" | "denied"> };

/** The finish library as physical 4×4 sample chips: hold one up and tilt it under the light. */
export function SampleDeck({ active, onSelect }: { active: number; onSelect: (index: number) => void }) {
  const { finish: worn } = useAtmosphere();
  const deckRef = useRef<HTMLDivElement>(null);
  const chips = useRef<(HTMLButtonElement | null)[]>([]);
  const activeRef = useRef(active);
  const listenToTilt = useRef<() => void>(() => {});
  const [faces, setFaces] = useState<Record<string, string>>({});
  const [tiltGranted, setTiltGranted] = useState(false);
  useEffect(() => { activeRef.current = active; }, [active]);

  // Each chip shows the blend picked in the studio when it's that finish, otherwise the house blend.
  const colorways = useMemo(() => finishes.map(f => {
    const system = systemFor(f.slug);
    const blend = worn?.system === system ? worn : floorSystems[system].colors[0];
    return { system, base: blend.base, accent: blend.accent, key: `${system}-${blend.base}-${blend.accent}` };
  }), [worn]);

  // Faces are painted lazily, once the deck is close to the viewport, one per idle slot.
  useEffect(() => {
    const deck = deckRef.current;
    if (!deck) return;
    let cancelled = false;
    const urls: string[] = [];
    const paint = () => colorways.reduce((chain, way) => chain.then(() => new Promise<void>(resolve => {
      if (cancelled || faces[way.key]) return resolve();
      const run = () => buildSampleCanvas(way.system, way.base, way.accent).toBlob(blob => {
        if (blob && !cancelled) { const url = URL.createObjectURL(blob); urls.push(url); setFaces(prev => ({ ...prev, [way.key]: url })); }
        resolve();
      }, "image/webp", .9);
      if ("requestIdleCallback" in window) requestIdleCallback(run, { timeout: 600 }); else setTimeout(run, 30);
    })), Promise.resolve());
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { observer.disconnect(); paint(); } }, { rootMargin: "800px" });
    observer.observe(deck);
    return () => { cancelled = true; observer.disconnect(); };
    // Blob URLs are kept for the session so switching blends back is instant.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorways]);

  useEffect(() => {
    const deck = deckRef.current;
    if (!deck || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let target = { x: 0, y: 0 }, inView = false, frame = 0, lastInput = -1e4;
    const current = { x: 0, y: 0 };
    const io = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; }, { rootMargin: "100px" });
    io.observe(deck);
    const onMove = (event: PointerEvent) => {
      if (!inView || event.pointerType === "touch") return;
      const r = deck.getBoundingClientRect();
      target = { x: clamp((event.clientX - (r.left + r.width / 2)) / (r.width * .6)), y: clamp((event.clientY - (r.top + r.height * .4)) / (window.innerHeight * .45)) };
      lastInput = performance.now();
    };
    const onOrient = (event: DeviceOrientationEvent) => {
      if (event.gamma == null || event.beta == null) return;
      target = { x: clamp(event.gamma / 25), y: clamp((event.beta - 40) / 25) };
      lastInput = performance.now();
    };
    listenToTilt.current = () => window.addEventListener("deviceorientation", onOrient);
    // Android exposes orientation freely; iOS waits for the tilt button's permission prompt.
    const needsPermission = typeof (DeviceOrientationEvent as unknown as OrientationPermission).requestPermission === "function";
    if (matchMedia("(pointer: coarse)").matches && !needsPermission) listenToTilt.current();
    window.addEventListener("pointermove", onMove, { passive: true });
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (!inView) return;
      // Left alone, the chip turns slowly so the light keeps travelling across it.
      const idle = now - lastInput > 2500;
      const goal = idle ? { x: Math.sin(now / 1700) * .55, y: Math.cos(now / 2300) * .35 } : target;
      current.x += (goal.x - current.x) * .09; current.y += (goal.y - current.y) * .09;
      chips.current.forEach((chip, i) => {
        if (!chip) return;
        const k = i === activeRef.current ? 1 : .3;
        chip.style.setProperty("--rx", `${(-current.y * 18 * k).toFixed(2)}deg`);
        chip.style.setProperty("--ry", `${(current.x * 22 * k).toFixed(2)}deg`);
        chip.style.setProperty("--lx", `${(50 + current.x * 48).toFixed(1)}%`);
        chip.style.setProperty("--ly", `${(38 + current.y * 48).toFixed(1)}%`);
        chip.style.setProperty("--sx", `${(50 - current.x * 70).toFixed(1)}%`);
      });
    };
    frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); io.disconnect(); window.removeEventListener("pointermove", onMove); window.removeEventListener("deviceorientation", onOrient); };
  }, []);

  const enableTilt = async () => {
    const request = (DeviceOrientationEvent as unknown as OrientationPermission).requestPermission;
    if (request && await request().catch(() => "denied") !== "granted") return;
    listenToTilt.current();
    setTiltGranted(true);
  };

  return <>
    <div className="sample-deck" role="tablist" aria-label="Explore floor finishes" ref={deckRef}>
      {finishes.map((f, i) => {
        const way = colorways[i];
        const face = faces[way.key];
        return <button
          key={f.slug} ref={el => { chips.current[i] = el; }}
          id={"finish-tab-" + i} role="tab" aria-selected={active === i} aria-controls="finish-display" tabIndex={active === i ? 0 : -1}
          className={`sample-chip ${active === i ? "active" : ""}`} data-system={way.system}
          onClick={() => { onSelect(i); sound.tap(); }}
          onKeyDown={(e) => {
            if (!["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"].includes(e.key)) return;
            e.preventDefault();
            const next = e.key === "Home" ? 0 : e.key === "End" ? finishes.length - 1 : (active + (e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1) + finishes.length) % finishes.length;
            onSelect(next); sound.tap(); document.getElementById("finish-tab-" + next)?.focus();
          }}
        >
          <span className="chip-lift">
            <span className="chip-body" style={{ "--chip-base": way.base, "--chip-accent": way.accent } as CSSProperties}>
              <span className="chip-face" style={face ? { backgroundImage: `url(${face})` } : undefined} />
              <span className="chip-sheen" />
              <span className="chip-stamp">110% · 4×4 SAMPLE</span>
            </span>
          </span>
          <span className="chip-caption"><span className="finish-index">0{i + 1}</span><strong>{f.name}</strong><small>{f.label}</small></span>
        </button>;
      })}
    </div>
    <p className="sample-hint">
      <span className="hint-pointer">Move your cursor to tilt the sample under the light.</span>
      {!tiltGranted && <button className="hint-touch" onClick={enableTilt}><Smartphone size={13} />Tilt your phone to catch the light</button>}
    </p>
  </>;
}
