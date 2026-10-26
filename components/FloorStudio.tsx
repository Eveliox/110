"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import dynamic from "next/dynamic";
import { ArrowUpRight, Camera, Check, Cuboid, Download, Footprints, Mail, Pause, Play, RotateCcw, Share2, SlidersHorizontal, Sunrise } from "lucide-react";
const FloorRoom = dynamic(() => import("./FloorRoom").then(m => m.FloorRoom), { ssr: false, loading: () => <div className="floor-room"><div className="room-fallback"><p>Preparing your room preview…</p></div><div className="room-badge">LOADING PREVIEW</div></div> });
const PhotoComposer = dynamic(() => import("./PhotoComposer").then(m => m.PhotoComposer), { ssr: false, loading: () => <div className="photo-composer"><div className="photo-dropzone"><div className="photo-dropzone-inner"><strong>Loading…</strong></div></div></div> });
import { floorSystems, resolveLighting, roomNames, sheenNames, type FloorSystem, type FloorSelection } from "@/lib/floor-studio";

const clampIndex = (value: number, length: number) => (Number.isFinite(value) && value >= 0 && value < length ? Math.floor(value) : -1);
import { INSTALL_DURATION_MS } from "@/lib/install-sequence";

export function FloorStudio({ initialSystem = "metallic" }: { initialSystem?: FloorSystem }) {
  const [system, setSystem] = useState(Math.max(0, floorSystems.findIndex(s => s.id === initialSystem)));
  const [color, setColor] = useState(0);
  const [sheen, setSheen] = useState(2);
  const [room, setRoom] = useState(0);
  const [daylight, setDaylight] = useState(0.33);
  const [yaw, setYaw] = useState(23);
  const [elevation, setElevation] = useState(39);
  const [zoom, setZoom] = useState(10);
  const [notice, setNotice] = useState("");
  const [mode, setMode] = useState<"room" | "photo">("room");
  const [firstPerson, setFirstPerson] = useState(false);
  const [installProgress, setInstallProgress] = useState<number | null>(null);
  const installHold = useRef<ReturnType<typeof setTimeout> | null>(null);
  const installRaf = useRef<number | null>(null);
  const exportRef = useRef<(() => void) | null>(null);

  // Hydrate a shared design only after mount, preserving the server-rendered defaults.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fsIdx = floorSystems.findIndex(s => s.id === params.get("fs"));
    if (fsIdx >= 0) setSystem(fsIdx);
    const parsedColor = clampIndex(Number(params.get("fc")), 4);
    if (parsedColor >= 0) setColor(parsedColor);
    const parsedSheen = clampIndex(Number(params.get("fsh")), sheenNames.length);
    if (parsedSheen >= 0) setSheen(parsedSheen);
    const parsedRoom = clampIndex(Number(params.get("fr")), roomNames.length);
    if (parsedRoom >= 0) setRoom(parsedRoom);
    const dl = Number(params.get("fl"));
    if (Number.isFinite(dl) && dl >= 0 && dl <= 1) setDaylight(dl);
    else if (params.get("fw") === "1") setDaylight(0.66);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => () => { if (installRaf.current !== null) cancelAnimationFrame(installRaf.current); if (installHold.current !== null) clearTimeout(installHold.current); }, []);

  const finish = floorSystems[system];
  const blend = finish.colors[color];
  const lighting = resolveLighting(daylight);
  const selection: FloorSelection = { system: finish.id, finish: finish.name, color: blend.name, sheen: sheenNames[sheen], room: roomNames[room] };
  const resetView = () => { setYaw(23); setElevation(39); setZoom(10); };

  const buildShareUrl = () => {
    const params = new URLSearchParams({ fs: finish.id, fc: String(color), fsh: String(sheen), fr: String(room), fl: daylight.toFixed(2) });
    return `${window.location.origin}${window.location.pathname}?${params.toString()}#floor-studio`;
  };

  const scrollToQuote = () => document.getElementById("quote")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });

  const useDesign = () => {
    window.dispatchEvent(new CustomEvent<FloorSelection>("floor-studio-selection", { detail: selection }));
    scrollToQuote();
    setNotice("Your selected look has been added to the project form below.");
  };

  const requestSample = () => {
    window.dispatchEvent(new CustomEvent<FloorSelection>("floor-studio-sample", { detail: selection }));
    scrollToQuote();
    setNotice("We've prefilled the form for a free 4×4 sample — just add your address.");
  };

  const share = async () => {
    const url = buildShareUrl();
    const payload = { title: "110% Coatings · Floor Studio", text: `${blend.name} · ${finish.name} / ${sheenNames[sheen]}`, url };
    try {
      if (typeof navigator.share === "function") {
        await navigator.share(payload);
        setNotice("Shared.");
        return;
      }
    } catch { /* user cancelled */ }
    try {
      await navigator.clipboard.writeText(url);
      setNotice("Shareable link copied — paste it anywhere.");
    } catch {
      setNotice(`Copy this link: ${url}`);
    }
  };

  const playInstall = useCallback(() => {
    if (installRaf.current !== null || installHold.current !== null) {
      if (installRaf.current !== null) cancelAnimationFrame(installRaf.current);
      if (installHold.current !== null) clearTimeout(installHold.current);
      installRaf.current = null; installHold.current = null; setInstallProgress(null); return;
    }
    setInstallProgress(0);
    const start = performance.now();
    const tick = () => {
      const elapsed = performance.now() - start;
      const progress = Math.min(1, elapsed / INSTALL_DURATION_MS);
      setInstallProgress(progress);
      if (progress < 1) {
        installRaf.current = requestAnimationFrame(tick);
      } else {
        installRaf.current = null;
        installHold.current = setTimeout(() => { setInstallProgress(null); installHold.current = null; }, 1800);
      }
    };
    setNotice("Playing a 110% install — bare concrete to sealed topcoat.");
    installRaf.current = requestAnimationFrame(tick);
  }, []);

  const toggleFirstPerson = () => {
    setFirstPerson(prev => {
      const next = !prev;
      if (next) { setYaw(0); setElevation(45); setNotice("Walk mode on — W/A/S/D to move, drag to look. Toggle off to orbit."); }
      else { setYaw(23); setElevation(39); setZoom(10); setNotice(""); }
      return next;
    });
  };

  return <section id="floor-studio" className="floor-studio-section">
    <div className="container">
      <div className="section-heading studio-heading"><div><span className="eyebrow">NOT SURE WHAT TO CHOOSE?</span><h2>See the possibilities.<br /><em>Find your floor.</em></h2></div><p>Try a finish. Change the light. Look around.<br />A little inspiration before the real transformation.</p></div>
      <div className="floor-studio-shell">
        <div className="studio-preview-column">
          <div className="studio-preview-top">
            <div className="studio-mode-tabs" role="tablist" aria-label="Preview mode">
              <button role="tab" aria-selected={mode === "room"} className={mode === "room" ? "selected" : ""} onClick={() => setMode("room")}><Cuboid size={13} />3D Studio</button>
              <button role="tab" aria-selected={mode === "photo"} className={mode === "photo" ? "selected" : ""} onClick={() => setMode("photo")}><Camera size={13} />Try in my photo</button>
            </div>
            {mode === "room" && <div className="studio-preview-top-actions">
              <button onClick={toggleFirstPerson} className={firstPerson ? "studio-pill selected" : "studio-pill"} aria-pressed={firstPerson}><Footprints size={13} />{firstPerson ? "Overview" : "Walk the room"}</button>
              <button onClick={resetView} className="studio-reset-view"><RotateCcw size={13} />Reset view</button>
            </div>}
          </div>
          {mode === "room"
            ? <FloorRoom appearance={{ system, base: blend.base, accent: blend.accent, sheen: [0,.45,1][sheen], room, yaw, elevation, zoom, daylight, firstPerson, installProgress }} exportRef={exportRef} onOrbit={(y,e)=>{setYaw(y);setElevation(e);}} />
            : <PhotoComposer appearance={{ system, base: blend.base, accent: blend.accent, sheen: [0,.45,1][sheen] }} finishLabel={`${blend.name} · ${finish.name} / ${sheenNames[sheen]}`} />}
          {mode === "room" && <div className="studio-preview-summary" aria-live="polite">
            <span><strong>{blend.name}</strong><small>{finish.name} / {sheenNames[sheen]} · {lighting.stopLabel}</small></span>
            <div className="studio-preview-actions">
              <button onClick={playInstall} aria-pressed={installProgress !== null} className={installProgress !== null ? "selected" : ""}>{installProgress !== null ? <Pause size={14} /> : <Play size={14} />}{installProgress !== null ? "Stop" : "Play install"}</button>
              <button onClick={share} aria-label="Share this look"><Share2 size={15} />Share</button>
              <button onClick={()=>{if(exportRef.current){exportRef.current();setNotice("Your concept preview has been downloaded.");}else setNotice("Image saving needs 3D support in your browser. You can still use this design in your project brief.");}}><Download size={16} />Save preview</button>
            </div>
          </div>}
          {mode === "room" && <details className="studio-camera"><summary><SlidersHorizontal size={14} />Camera controls <span>Adjust your perspective</span></summary><div><label>Rotate <output>{Math.round(yaw)}°</output><input type="range" min={-35} max={35} value={yaw} onChange={e=>setYaw(Number(e.target.value))} /></label><label>Height <output>{Math.round(elevation)}°</output><input type="range" min={20} max={60} value={elevation} onChange={e=>setElevation(Number(e.target.value))} /></label><label>Zoom <output>{Math.round((12-zoom)*20+20)}%</output><input type="range" min={8} max={12} step={.1} value={12-(zoom-8)} onChange={e=>setZoom(20-Number(e.target.value))} /></label></div></details>}
        </div>
        <div className="studio-controls">
          <fieldset><legend><span>01</span> Choose a finish</legend><div className="studio-system-options">{floorSystems.map((s,i)=><button key={s.id} className={i===system?"selected":""} aria-pressed={i===system} onClick={()=>{setSystem(i);setColor(0);setNotice("");}}>{s.name}{i===system?<Check size={14}/>:<ArrowUpRight size={14}/>}</button>)}</div><p className="studio-description">{finish.description}</p></fieldset>
          <fieldset><legend><span>02</span> Explore a color blend</legend><div className="studio-swatches">{finish.colors.map((c,i)=><button key={c.name} aria-pressed={color===i} className={color===i?"selected":""} onClick={()=>{setColor(i);setNotice("");}}><span className={`studio-swatch swatch-${finish.id}`} style={{"--swatch-base":c.base,"--swatch-accent":c.accent} as CSSProperties}>{color===i&&<Check size={14}/>}</span><span>{c.name}</span></button>)}</div></fieldset>
          <fieldset>
            <legend><span>03</span> Set the scene</legend>
            <label className="studio-room-label">Space<select value={room} onChange={e=>setRoom(Number(e.target.value))}>{roomNames.map((name,i)=><option value={i} key={name}>{name}</option>)}</select></label>
            <span className="studio-control-label">Sheen</span>
            <div className="studio-segments">{sheenNames.map((name,i)=><button aria-pressed={sheen===i} className={sheen===i?"selected":""} onClick={()=>setSheen(i)} key={name}>{name}</button>)}</div>
            <span className="studio-control-label studio-daylight-label"><Sunrise size={12} />Lighting<output>{lighting.stopLabel}</output></span>
            <input type="range" min={0} max={1} step={0.01} value={daylight} onChange={e=>setDaylight(Number(e.target.value))} className="studio-daylight-slider" aria-label="Time of day" />
            <div className="studio-daylight-stops">
              <span>Overcast</span><span>Noon</span><span>Sunset</span><span>Night</span>
            </div>
          </fieldset>
          <button className="studio-use-design" onClick={useDesign}>I like this look <ArrowUpRight size={18}/></button>
          <button className="studio-request-sample" onClick={requestSample}><Mail size={14} />Request a free 4×4 sample</button>
          <p className="studio-notice" role="status">{notice}</p>
        </div>
      </div>
      <p className="studio-disclaimer">A design concept, not an exact product sample. Patterns, color, sheen, and availability are confirmed with your project consultation.</p>
    </div>
  </section>;
}
