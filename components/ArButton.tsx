"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ScanLine, X } from "lucide-react";
import type { ArFinish } from "@/lib/floor-ar";

const never = () => () => {};
const supportsQuickLook = () => document.createElement("a").relList.supports("ar");

/** Shown only on devices that can place the finish on a real floor (AR Quick Look or WebXR). */
export function ArButton({ finish, label, onNotice }: { finish: ArFinish; label: string; onNotice: (text: string) => void }) {
  const quickLook = useSyncExternalStore(never, supportsQuickLook, () => false);
  const [webXr, setWebXr] = useState(false);
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<XRSession | null>(null);

  useEffect(() => {
    let cancelled = false;
    navigator.xr?.isSessionSupported("immersive-ar").then(ok => {
      if (cancelled || !ok) return;
      setWebXr(true);
      // Warm the module so the session request still counts as part of the tap.
      void import("@/lib/floor-ar");
    }).catch(() => {});
    return () => { cancelled = true; sessionRef.current?.end().catch(() => {}); };
  }, []);

  if (!quickLook && !webXr) return null;

  const open = async () => {
    setBusy(true);
    try {
      const ar = await import("@/lib/floor-ar");
      if (quickLook) { await ar.openQuickLook(finish); return; }
      setActive(true);
      sessionRef.current = await ar.startWebXr(finish, overlayRef.current!, () => { setActive(false); sessionRef.current = null; });
    } catch {
      setActive(false);
      onNotice("Couldn't start AR on this device. You can still try the finish in your own photo.");
    } finally {
      setBusy(false);
    }
  };

  return <>
    <button onClick={open} disabled={busy}><ScanLine size={15} />{busy ? "Opening…" : "View on my floor"}</button>
    <div ref={overlayRef} className="ar-overlay" hidden={!active}>
      <p><strong>{label}</strong>Point at your floor, then tap to place a 3 m square. Tap again to move it.</p>
      <button onClick={() => sessionRef.current?.end()} aria-label="Leave AR"><X size={18} />Done</button>
    </div>
  </>;
}
