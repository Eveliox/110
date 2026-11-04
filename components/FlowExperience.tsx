"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowDown, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useCopy } from "./LangProvider";
import { localePath, localized } from "@/lib/copy";

export function FlowExperience() {
  const c = useCopy();
  const { projects } = localized(c);
  const [index, setIndex] = useState(0);
  const project = projects[index];
  const move = (direction: number) => setIndex((current) => (current + direction + projects.length) % projects.length);
  return <div className="flow-opening">
    <section className="flow-hero" aria-labelledby="flow-heading" data-pour="0 1 1">
      <div className="flow-hero-meta"><span>{c.hero.meta[0]}</span><span>{c.hero.meta[1]}</span></div>
      <div className="flow-headline">
        <span className="flow-overline">{c.hero.overline}</span>
        <h1 id="flow-heading">{c.hero.title[0]}<br />{c.hero.title[1]}<br /><span>{c.hero.title[2]}</span></h1>
        <Link className="flow-pill" href="#quote">{c.hero.cta} <ArrowUpRight size={15} /></Link>
        <span className="flow-stir-hint" aria-hidden="true"><span className="hint-pointer">{c.hero.stirPointer}</span><span className="hint-touch">{c.hero.stirTouch}</span></span>
      </div>
      <div className="container flow-hero-footer">{c.hero.taglines.map(([line, soft]) => <p key={line}>{line}<br /><span>{soft}</span></p>)}<a href="#work" className="flow-scroll" aria-label={c.hero.scroll}><ArrowDown size={28} /></a></div>
    </section>
    <section className="flow-showcase" id="work" aria-labelledby="flow-project-title" data-pour=".55 1 .72">
      <div className="container flow-project-stage">
        <div className="flow-project-description"><span className="flow-overline">{c.showcase.overline} / {String(index + 1).padStart(2, "0")}</span><h2 id="flow-project-title">{project.name}</h2><p>{project.type}<span />{c.showcase.photo}</p></div>
        <Link href={localePath(c.lang, project.kind === "Epoxy flake" ? "/finishes/epoxy-flake" : "/finishes/metallic-epoxy")} className="flow-project-image" aria-label={c.showcase.explore(project.name, project.type)}><Image key={project.image} src={project.image} alt={`${project.name}. ${project.note}`} fill sizes="(max-width: 650px) 90vw, 68vw" /><span className="flow-image-link"><ArrowUpRight size={22} /></span></Link>
        <div className="flow-project-bottom"><span className="flow-project-note" aria-live="polite">{project.note}</span><div className="flow-carousel-controls"><button onClick={() => move(-1)} aria-label={c.showcase.prev}><ChevronLeft size={18} /></button><span>{String(index + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</span><button onClick={() => move(1)} aria-label={c.showcase.next}><ChevronRight size={18} /></button></div></div>
        <Link href={localePath(c.lang, "/work")} className="flow-pill flow-all-work">{c.showcase.all} <ArrowUpRight size={14} /></Link>
      </div>
    </section>
  </div>;
}
