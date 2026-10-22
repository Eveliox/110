"use client";

import { useRef, useState, type CSSProperties } from "react";
import { ArrowUpRight, Check, Download, RotateCcw, SlidersHorizontal, Sun, Sunset } from "lucide-react";
import { FloorRoom } from "./FloorRoom";
import { floorSystems, roomNames, sheenNames, type FloorSystem, type FloorSelection } from "@/lib/floor-studio";

export function FloorStudio({ initialSystem = "metallic" }: { initialSystem?: FloorSystem }) {
  const [system, setSystem] = useState(Math.max(0, floorSystems.findIndex(s => s.id === initialSystem)));
  const [color, setColor] = useState(0);
  const [sheen, setSheen] = useState(2);
  const [room, setRoom] = useState(0);
  const [warm, setWarm] = useState(false);
  const [yaw, setYaw] = useState(23);
  const [elevation, setElevation] = useState(39);
  const [zoom, setZoom] = useState(10);
  const [notice, setNotice] = useState("");
  const exportRef = useRef<(() => void) | null>(null);
  const finish = floorSystems[system];
  const blend = finish.colors[color];
  const selection: FloorSelection = { system: finish.id, finish: finish.name, color: blend.name, sheen: sheenNames[sheen], room: roomNames[room] };
  const resetView = () => { setYaw(23); setElevation(39); setZoom(10); };
  const useDesign = () => {
    window.dispatchEvent(new CustomEvent<FloorSelection>("floor-studio-selection", { detail: selection }));
    document.getElementById("quote")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    setNotice("Your selected look has been added to the project form below.");
  };
  return <section id="floor-studio" className="floor-studio-section">
    <div className="container">
      <div className="section-heading studio-heading"><div><span className="eyebrow">NOT SURE WHAT TO CHOOSE?</span><h2>See the possibilities.<br /><em>Find your floor.</em></h2></div><p>Try a finish. Change the light. Look around.<br />A little inspiration before the real transformation.</p></div>
      <div className="floor-studio-shell">
        <div className="studio-preview-column">
          <div className="studio-preview-top"><span>110% / THE FLOOR STUDIO</span><button onClick={resetView}><RotateCcw size={13} />Reset view</button></div>
          <FloorRoom appearance={{ system, base: blend.base, accent: blend.accent, sheen: [0,.45,1][sheen], room, yaw, elevation, zoom, warm }} exportRef={exportRef} onOrbit={(y,e)=>{setYaw(y);setElevation(e);}} />
          <div className="studio-preview-summary" aria-live="polite"><span><strong>{blend.name}</strong><small>{finish.name} / {sheenNames[sheen]}</small></span><button onClick={()=>{if(exportRef.current){exportRef.current();setNotice("Your concept preview has been downloaded.");}else setNotice("Image saving needs 3D support in your browser. You can still use this design in your project brief.");}}><Download size={16} />Save preview</button></div>
          <details className="studio-camera"><summary><SlidersHorizontal size={14} />Camera controls <span>Adjust your perspective</span></summary><div><label>Rotate <output>{Math.round(yaw)}°</output><input type="range" min={-35} max={35} value={yaw} onChange={e=>setYaw(Number(e.target.value))} /></label><label>Height <output>{Math.round(elevation)}°</output><input type="range" min={20} max={60} value={elevation} onChange={e=>setElevation(Number(e.target.value))} /></label><label>Zoom <output>{Math.round((12-zoom)*20+20)}%</output><input type="range" min={8} max={12} step={.1} value={12-(zoom-8)} onChange={e=>setZoom(20-Number(e.target.value))} /></label></div></details>
        </div>
        <div className="studio-controls">
          <fieldset><legend><span>01</span> Choose a finish</legend><div className="studio-system-options">{floorSystems.map((s,i)=><button key={s.id} className={i===system?"selected":""} aria-pressed={i===system} onClick={()=>{setSystem(i);setColor(0);setNotice("");}}>{s.name}{i===system?<Check size={14}/>:<ArrowUpRight size={14}/>}</button>)}</div><p className="studio-description">{finish.description}</p></fieldset>
          <fieldset><legend><span>02</span> Explore a color blend</legend><div className="studio-swatches">{finish.colors.map((c,i)=><button key={c.name} aria-pressed={color===i} className={color===i?"selected":""} onClick={()=>{setColor(i);setNotice("");}}><span className={`studio-swatch swatch-${finish.id}`} style={{"--swatch-base":c.base,"--swatch-accent":c.accent} as CSSProperties}>{color===i&&<Check size={14}/>}</span><span>{c.name}</span></button>)}</div></fieldset>
          <fieldset><legend><span>03</span> Set the scene</legend><label className="studio-room-label">Space<select value={room} onChange={e=>setRoom(Number(e.target.value))}>{roomNames.map((name,i)=><option value={i} key={name}>{name}</option>)}</select></label><span className="studio-control-label">Sheen</span><div className="studio-segments">{sheenNames.map((name,i)=><button aria-pressed={sheen===i} className={sheen===i?"selected":""} onClick={()=>setSheen(i)} key={name}>{name}</button>)}</div><span className="studio-control-label">Lighting</span><div className="studio-segments"><button aria-pressed={!warm} className={!warm?"selected":""} onClick={()=>setWarm(false)}><Sun size={13}/>Daylight</button><button aria-pressed={warm} className={warm?"selected":""} onClick={()=>setWarm(true)}><Sunset size={13}/>Warm light</button></div></fieldset>
          <button className="studio-use-design" onClick={useDesign}>I like this look <ArrowUpRight size={18}/></button>
          <p className="studio-notice" role="status">{notice}</p>
        </div>
      </div>
      <p className="studio-disclaimer">A design concept, not an exact product sample. Patterns, color, sheen, and availability are confirmed with your project consultation.</p>
    </div>
  </section>;
}
