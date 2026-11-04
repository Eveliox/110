"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ScanLine, X } from "lucide-react";
import type { ArFinish } from "@/lib/floor-ar";
import { useCopy } from "./LangProvider";

const never = () => () => {};
const supportsQuickLook = () => document.createElement("a").relList.supports("ar");

/** Shown only on devices that can place the finish on a real floor (AR Quick Look or WebXR). */
export function ArButton({ finish, label, onNotice }: { finish: ArFinish; label: string; onNotice: (text: string) => void }) {
  const c = useCopy().ar;
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
      onNotice(c.failed);
    } finally {
      setBusy(false);
    }
  };

  return <>
    <button onClick={open} disabled={busy}><ScanLine size={15} />{busy ? c.opening : c.open}</button>
    <div ref={overlayRef} className="ar-overlay" hidden={!active}>
      <p><strong>{label}</strong>{c.place}</p>
      <button onClick={() => sessionRef.current?.end()} aria-label={c.leave}><X size={18} />{c.done}</button>
    </div>
  </>;
}
