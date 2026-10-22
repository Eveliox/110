"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowDown, ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useAtmosphere } from "./SiteAtmosphere";
import { projects } from "@/lib/design";

export function FlowExperience() {
  const { paused, toggle } = useAtmosphere();
  const [index, setIndex] = useState(0);
  const project = projects[index];
  const move = (direction: number) => setIndex((current) => (current + direction + projects.length) % projects.length);
  return <div className="flow-opening">
    <section className="flow-hero" aria-labelledby="flow-heading">
      <div className="flow-hero-meta"><span>110% COATINGS</span><span>CRAFT / COLOR / CONCRETE</span></div>
      <div className="flow-headline">
        <span className="flow-overline">A DIFFERENT KIND OF FLOOR COMPANY</span>
        <h1 id="flow-heading">We create surfaces<br />that change the<br /><span>way you feel.</span></h1>
        <Link className="flow-pill" href="#quote">Start your transformation <ArrowUpRight size={15} /></Link>
      </div>
      <div className="container flow-hero-footer"><button className="flow-motion" onClick={toggle} aria-label={paused ? "Play atmosphere animation" : "Pause atmosphere animation"} aria-pressed={paused}>{paused ? <Play size={13} /> : <Pause size={13} />}</button><p>Made for your space.<br /><span>Built around your vision.</span></p><p>Design-led finishes.<br /><span>Detail-driven application.</span></p><p>Residential, commercial,<br /><span>and anything but ordinary.</span></p><a href="#work" className="flow-scroll" aria-label="Explore selected work"><ArrowDown size={28} /></a></div>
    </section>
    <section className="flow-showcase" id="work" aria-labelledby="flow-project-title">
      <div className="container flow-project-stage">
        <div className="flow-project-description"><span className="flow-overline">SELECTED WORK / {String(index + 1).padStart(2, "0")}</span><h2 id="flow-project-title">{project.name}</h2><p>{project.type}<span />ORIGINAL PROJECT PHOTOGRAPH</p></div>
        <Link href={project.type === "Epoxy flake" ? "/finishes/epoxy-flake" : "/finishes/metallic-epoxy"} className="flow-project-image" aria-label={`Explore ${project.name}: ${project.type}`}><Image key={project.image} src={project.image} alt={`${project.name}. ${project.note}`} fill sizes="(max-width: 650px) 90vw, 68vw" /><span className="flow-image-link"><ArrowUpRight size={22} /></span></Link>
        <div className="flow-project-bottom"><span className="flow-project-note" aria-live="polite">{project.note}</span><div className="flow-carousel-controls"><button onClick={() => move(-1)} aria-label="Previous project"><ChevronLeft size={18} /></button><span>{String(index + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</span><button onClick={() => move(1)} aria-label="Next project"><ChevronRight size={18} /></button></div></div>
        <Link href="/work" className="flow-pill flow-all-work">Discover all projects <ArrowUpRight size={14} /></Link>
      </div>
    </section>
  </div>;
}
