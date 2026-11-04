"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import dynamic from "next/dynamic";
import { ArrowUpRight, Camera, Check, Cuboid, Download, Footprints, Mail, Pause, Play, RotateCcw, Share2, SlidersHorizontal, Sunrise } from "lucide-react";
function RoomLoading() { const c = useCopy(); return <div className="floor-room"><div className="room-fallback"><p>{c.studio.preparing}</p></div><div className="room-badge">{c.studio.loading}</div></div>; }
function PhotoLoading() { const c = useCopy(); return <div className="photo-composer"><div className="photo-dropzone"><div className="photo-dropzone-inner"><strong>{c.studio.loadingShort}</strong></div></div></div>; }
const FloorRoom = dynamic(() => import("./FloorRoom").then(m => m.FloorRoom), { ssr: false, loading: () => <RoomLoading /> });
const PhotoComposer = dynamic(() => import("./PhotoComposer").then(m => m.PhotoComposer), { ssr: false, loading: () => <PhotoLoading /> });
import { floorSystems, resolveLighting, roomNames, sheenNames, type FloorSystem, type FloorSelection } from "@/lib/floor-studio";

const clampIndex = (value: number, length: number) => (Number.isFinite(value) && value >= 0 && value < length ? Math.floor(value) : -1);
import { INSTALL_DURATION_MS } from "@/lib/install-sequence";
import { estimate, estimatorVisible, pricing, roomAreas } from "@/lib/pricing";
import { useAtmosphere } from "./SiteAtmosphere";
import { ArButton } from "./ArButton";
import { useCopy } from "./LangProvider";

export function FloorStudio({ initialSystem = "metallic" }: { initialSystem?: FloorSystem }) {
  const [system, setSystem] = useState(Math.max(0, floorSystems.findIndex(s => s.id === initialSystem)));
  const [color, setColor] = useState(0);
  const [sheen, setSheen] = useState(2);
  const [room, setRoom] = useState(0);
  // Follows the room's typical size until the visitor sets their own.
  const [customArea, setCustomArea] = useState<number | null>(null);
  const area = customArea ?? roomAreas[room];
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
  const { finish: worn, wear, palette } = useAtmosphere();
  const c = useCopy();
  const s = c.studio;
  // Picking a blend dresses the whole site in it (see SiteAtmosphere).
  const choose = useCallback((nextSystem: number, nextColor: number) => {
    setSystem(nextSystem); setColor(nextColor);
    const picked = floorSystems[nextSystem].colors[nextColor];
    wear({ name: c.studio.wornName(c.systems[nextSystem].colors[nextColor], c.systems[nextSystem].name), system: nextSystem, base: picked.base, accent: picked.accent });
  }, [wear, c]);

  // Hydrate a shared design only after mount, preserving the server-rendered defaults.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fsIdx = floorSystems.findIndex(s => s.id === params.get("fs"));
    const parsedColor = params.has("fc") ? clampIndex(Number(params.get("fc")), 4) : -1;
    // A shared link arrives already dressed in the shared finish.
    if (fsIdx >= 0 || parsedColor >= 0) choose(fsIdx >= 0 ? fsIdx : Math.max(0, floorSystems.findIndex(s => s.id === initialSystem)), Math.max(0, parsedColor));
    const parsedSheen = params.has("fsh") ? clampIndex(Number(params.get("fsh")), sheenNames.length) : -1;
    if (parsedSheen >= 0) setSheen(parsedSheen);
    const parsedRoom = params.has("fr") ? clampIndex(Number(params.get("fr")), roomNames.length) : -1;
    if (parsedRoom >= 0) setRoom(parsedRoom);
    const dl = Number(params.get("fl"));
    if (Number.isFinite(dl) && dl >= 0 && dl <= 1) setDaylight(dl);
    else if (params.get("fw") === "1") setDaylight(0.66);
  }, [choose, initialSystem]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => () => { if (installRaf.current !== null) cancelAnimationFrame(installRaf.current); if (installHold.current !== null) clearTimeout(installHold.current); }, []);

  const finish = floorSystems[system];
  const blend = finish.colors[color];
  const lighting = resolveLighting(daylight);
  // Shown names come from the copy in the page's language; ids, colors and indices from lib/floor-studio.
  const finishName = c.systems[system].name, blendName = c.systems[system].colors[color], sheenName = c.sheens[sheen], lightName = c.lighting[lighting.stopIndex];
  // The quote form lists finishes by their library names, so pass the matching one.
  const formFinish = c.finishes[finish.id === "flake" ? 0 : finish.id === "metallic" ? 1 : 2].name;
  const selection: FloorSelection = { system: finish.id, finish: formFinish, color: blendName, sheen: sheenName, room: c.rooms[room], ...(estimatorVisible && { area }) };
  const [priceLow, priceHigh] = estimate(finish.id, area);
  const resetView = () => { setYaw(23); setElevation(39); setZoom(10); };

  const buildShareUrl = () => {
    const params = new URLSearchParams({ fs: finish.id, fc: String(color), fsh: String(sheen), fr: String(room), fl: daylight.toFixed(2) });
    return `${window.location.origin}${window.location.pathname}?${params.toString()}#floor-studio`;
  };

  const scrollToQuote = () => document.getElementById("quote")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });

  const useDesign = () => {
    window.dispatchEvent(new CustomEvent<FloorSelection>("floor-studio-selection", { detail: selection }));
    scrollToQuote();
    setNotice(s.used);
  };

  const requestSample = () => {
    window.dispatchEvent(new CustomEvent<FloorSelection>("floor-studio-sample", { detail: selection }));
    scrollToQuote();
    setNotice(s.sampleSet);
  };

  const share = async () => {
    const url = buildShareUrl();
    const payload = { title: s.shareTitle, text: `${blendName} · ${finishName} / ${sheenName}`, url };
    try {
      if (typeof navigator.share === "function") {
        await navigator.share(payload);
        setNotice(s.shared);
        return;
      }
    } catch { /* user cancelled */ }
    try {
      await navigator.clipboard.writeText(url);
      setNotice(s.copied);
    } catch {
      setNotice(s.copyThis(url));
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
    setNotice(s.playing);
    installRaf.current = requestAnimationFrame(tick);
  }, [s]);

  const toggleFirstPerson = () => {
    setFirstPerson(prev => {
      const next = !prev;
      if (next) { setYaw(0); setElevation(45); setNotice(s.walking); }
      else { setYaw(23); setElevation(39); setZoom(10); setNotice(""); }
      return next;
    });
  };

  return <section id="floor-studio" className="floor-studio-section" data-pour="1 1.6 .5">
    <div className="container">
      <div className="section-heading studio-heading"><div><span className="eyebrow">{s.eyebrow}</span><h2>{s.title[0]}<br /><em>{s.title[1]}</em></h2></div><p>{s.intro[0]} <br />{s.intro[1]}</p></div>
      <div className="floor-studio-shell">
        <div className="studio-preview-column">
          <div className="studio-preview-top">
            <div className="studio-mode-tabs" role="tablist" aria-label={s.modes}>
              <button role="tab" aria-selected={mode === "room"} className={mode === "room" ? "selected" : ""} onClick={() => setMode("room")}><Cuboid size={13} />{s.room}</button>
              <button role="tab" aria-selected={mode === "photo"} className={mode === "photo" ? "selected" : ""} onClick={() => setMode("photo")}><Camera size={13} />{s.photo}</button>
            </div>
            {mode === "room" && <div className="studio-preview-top-actions">
              <button onClick={toggleFirstPerson} className={firstPerson ? "studio-pill selected" : "studio-pill"} aria-pressed={firstPerson}><Footprints size={13} />{firstPerson ? s.overview : s.walk}</button>
              <button onClick={resetView} className="studio-reset-view"><RotateCcw size={13} />{s.reset}</button>
            </div>}
          </div>
          {mode === "room"
            ? <FloorRoom appearance={{ system, base: blend.base, accent: blend.accent, sheen: [0,.45,1][sheen], room, yaw, elevation, zoom, daylight, firstPerson, installProgress }} backdrop={palette.deep} exportRef={exportRef} onOrbit={(y,e)=>{setYaw(y);setElevation(e);}} />
            : <PhotoComposer appearance={{ system, base: blend.base, accent: blend.accent, sheen: [0,.45,1][sheen] }} finishLabel={`${blendName} · ${finishName} / ${sheenName}`} />}
          {mode === "room" && <div className="studio-preview-summary" aria-live="polite">
            <span><strong>{blendName}</strong><small>{finishName} / {sheenName} · {lightName}</small></span>
            <div className="studio-preview-actions">
              <button onClick={playInstall} aria-pressed={installProgress !== null} className={installProgress !== null ? "selected" : ""}>{installProgress !== null ? <Pause size={14} /> : <Play size={14} />}{installProgress !== null ? s.stop : s.play}</button>
              <button onClick={share} aria-label={s.shareLabel}><Share2 size={15} />{s.share}</button>
              <ArButton finish={{ system, base: blend.base, accent: blend.accent, sheen: [0,.45,1][sheen] }} label={`${blendName} · ${finishName}`} onNotice={setNotice} />
              <button onClick={()=>{if(exportRef.current){exportRef.current();setNotice(s.downloaded);}else setNotice(s.noExport);}}><Download size={16} />{s.save}</button>
            </div>
          </div>}
          {mode === "room" && <details className="studio-camera"><summary><SlidersHorizontal size={14} />{s.camera} <span>{s.cameraHint}</span></summary><div><label>{s.rotate} <output>{Math.round(yaw)}°</output><input type="range" min={-35} max={35} value={yaw} onChange={e=>setYaw(Number(e.target.value))} /></label><label>{s.height} <output>{Math.round(elevation)}°</output><input type="range" min={20} max={60} value={elevation} onChange={e=>setElevation(Number(e.target.value))} /></label><label>{s.zoom} <output>{Math.round((12-zoom)*20+20)}%</output><input type="range" min={8} max={12} step={.1} value={12-(zoom-8)} onChange={e=>setZoom(20-Number(e.target.value))} /></label></div></details>}
        </div>
        <div className="studio-controls">
          <fieldset><legend><span>01</span> {s.chooseFinish}</legend><div className="studio-system-options">{floorSystems.map((s,i)=><button key={s.id} className={i===system?"selected":""} aria-pressed={i===system} onClick={()=>{choose(i,0);setNotice("");}}>{c.systems[i].name}{i===system?<Check size={14}/>:<ArrowUpRight size={14}/>}</button>)}</div><p className="studio-description">{c.systems[system].description}</p></fieldset>
          <fieldset><legend><span>02</span> {s.chooseBlend}</legend><div className="studio-swatches">{finish.colors.map((col,i)=><button key={col.name} aria-pressed={color===i} className={color===i?"selected":""} onClick={()=>{choose(system,i);setNotice("");}}><span className={`studio-swatch swatch-${finish.id}`} style={{"--swatch-base":col.base,"--swatch-accent":col.accent} as CSSProperties}>{color===i&&<Check size={14}/>}</span><span>{c.systems[system].colors[i]}</span></button>)}</div>
            <p className="studio-wearing" aria-live="polite">{worn
              ? <>{s.wearing} <strong>{worn.name}</strong>. <button onClick={() => wear(null)}>{s.wearReset}</button></>
              : <>{s.wearHint}</>}</p>
          </fieldset>
          <fieldset>
            <legend><span>03</span> {s.scene}</legend>
            <label className="studio-room-label">{s.space}<select value={room} onChange={e=>setRoom(Number(e.target.value))}>{c.rooms.map((name,i)=><option value={i} key={name}>{name}</option>)}</select></label>
            <span className="studio-control-label">{s.sheen}</span>
            <div className="studio-segments">{c.sheens.map((name,i)=><button aria-pressed={sheen===i} className={sheen===i?"selected":""} onClick={()=>setSheen(i)} key={name}>{name}</button>)}</div>
            <span className="studio-control-label studio-daylight-label"><Sunrise size={12} />{s.lighting}<output>{lightName}</output></span>
            <input type="range" min={0} max={1} step={0.01} value={daylight} onChange={e=>setDaylight(Number(e.target.value))} className="studio-daylight-slider" aria-label={s.timeOfDay} />
            <div className="studio-daylight-stops">
              {c.lighting.map(label => <span key={label}>{label}</span>)}
            </div>
          </fieldset>
          {estimatorVisible && <fieldset className="studio-estimate">
            <legend><span>04</span> {s.estimate}</legend>
            <span className="studio-control-label studio-daylight-label">{s.area}<output>{area.toLocaleString("en-US")} {c.sqft}</output></span>
            <input type="range" min={100} max={3000} step={25} value={area} onChange={e=>setCustomArea(Number(e.target.value))} className="studio-daylight-slider" aria-label={s.areaLabel} />
            <p className="studio-estimate-figure" aria-live="polite"><strong>${priceLow.toLocaleString("en-US")} – ${priceHigh.toLocaleString("en-US")}</strong><small>{s.installed(finishName)}</small></p>
            <p className="studio-estimate-note">{!pricing.confirmed && <b>{s.samplePrices}</b>}{s.estimateNote}</p>
          </fieldset>}
          <button className="studio-use-design" onClick={useDesign}>{s.like} <ArrowUpRight size={18}/></button>
          <button className="studio-request-sample" onClick={requestSample}><Mail size={14} />{s.sample}</button>
          <p className="studio-notice" role="status">{notice}</p>
        </div>
      </div>
      <p className="studio-disclaimer">{s.disclaimer}</p>
    </div>
  </section>;
}
