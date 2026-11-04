"use client";

import { createContext, useContext, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { PourField } from "./PourField";
import { brandPalette, brandTones, finishPalette, finishTones, type Palette } from "@/lib/atmosphere";

export type WornFinish = { name: string; system: number; base: string; accent: string };

const AtmosphereContext = createContext<{ finish: WornFinish | null; wear: (finish: WornFinish | null) => void; palette: Palette }>({
  finish: null, wear: () => {}, palette: brandPalette,
});
export const useAtmosphere = () => useContext(AtmosphereContext);

export function SiteAtmosphere({ children }: { children: ReactNode }) {
  const [finish, wear] = useState<WornFinish | null>(null);
  const palette = useMemo(() => finish ? finishPalette(finish.base, finish.accent) : brandPalette, [finish]);
  const tones = finish ? finishTones(finish.base, finish.accent) : brandTones;
  const value = useMemo(() => ({ finish, wear, palette }), [finish, palette]);
  return <AtmosphereContext.Provider value={value}>
    <div className="site-shell" style={{ "--tone-soft": tones.soft, "--tone-em": tones.em, "--tone-glow": tones.glow } as CSSProperties}>
      <div className="site-atmosphere" aria-hidden="true"><PourField palette={palette} /></div>
      {children}
    </div>
  </AtmosphereContext.Provider>;
}
