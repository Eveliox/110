"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { PrismField } from "./PrismField";

const AtmosphereContext = createContext({ paused: false, toggle: () => {} });
export const useAtmosphere = () => useContext(AtmosphereContext);

export function SiteAtmosphere({ children }: { children: ReactNode }) {
  const [paused, setPaused] = useState(false);
  return <AtmosphereContext.Provider value={{ paused, toggle: () => setPaused(value => !value) }}>
    <div className="site-shell">
      <div className="site-atmosphere" aria-hidden="true"><PrismField paused={paused} palette={0} /></div>
      {children}
    </div>
  </AtmosphereContext.Provider>;
}
