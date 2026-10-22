"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowDown, ArrowUpRight, Pause, Play, MoveUpRight } from "lucide-react";
import { PrismField } from "./PrismField";

const materials = [
  { name: "Metallic", code: "01", image: "/gallery/metallic-resin-4.jpg", title: "Silver in motion", description: "Depth. Movement. A little drama.", slug: "metallic-epoxy", tone: "violet" },
  { name: "Flake", code: "02", image: "/gallery/epoxy-flake-1.jpg", title: "Texture with purpose", description: "A refined take on the everyday.", slug: "epoxy-flake", tone: "cyan" },
  { name: "Concrete", code: "03", image: "/gallery/concrete-grinding.jpg", title: "Back to the surface", description: "The preparation behind the finish.", slug: "polished-concrete", tone: "amber" },
];

export function ExperienceHero() {
  const [material, setMaterial] = useState(0);
  const [paused, setPaused] = useState(false);
  const selected = materials[material];
  return <>
    <section className="experience-hero" aria-labelledby="experience-title" data-tone={selected.tone}>
      <div className="experience-grid" aria-hidden="true" />
      <div className="experience-art"><PrismField paused={paused} palette={material} /></div>
      <div className="container experience-heading">
        <div className="experience-eyebrow"><span className="signal-dot" />110% COATINGS <span className="eyebrow-divider">/</span> SURFACE SPECIALISTS</div>
        <h1 id="experience-title">Beyond<br /><span>ordinary</span><i>.</i></h1>
        <div className="experience-intro"><span className="intro-cross" aria-hidden="true">✳</span><p>Not just a new floor.<br />A whole new dimension.</p></div>
        <Link className="experience-cta" href="#quote"><span>Make your space a statement</span><ArrowUpRight size={22} /></Link>
      </div>
      <div className="art-coordinate" aria-hidden="true"><span>LIGHT / TEXTURE / SPACE</span><span>110 : SURFACE STUDIES</span></div>
      <button className="motion-control" aria-label={paused ? "Play light animation" : "Pause light animation"} aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? <Play size={12} /> : <Pause size={12} />}<span>{paused ? "PLAY" : "PAUSE"}</span></button>
      <div className="container experience-lower">
        <div className="material-controller"><span className="micro-label">CHOOSE YOUR EXPRESSION</span><div className="material-switches" aria-label="Explore material collections">{materials.map((item,i) => <button key={item.name} aria-pressed={material === i} onClick={() => setMaterial(i)} className={material === i ? "selected" : ""}><span>{item.code}</span>{item.name}<span className="material-dot" /></button>)}</div><p>Epoxy & concrete finishes<br />for spaces with a point of view.</p><a href="#finishes" className="experience-scroll"><ArrowDown size={15} /> SCROLL TO DISCOVER</a></div>
        <Link className="material-preview" href={"/finishes/"+selected.slug} aria-label={"Explore "+selected.name+" finishes"}><div className="material-preview-image"><Image key={selected.image} src={selected.image} alt={selected.name === "Concrete" ? "Original photograph of concrete preparation" : "Original "+selected.name.toLowerCase()+" floor coating photograph"} fill sizes="(max-width: 600px) 80vw, 320px" preload={material === 0} /><span className="preview-index">{selected.code} / 03</span></div><div className="material-preview-info"><span><small>{selected.name === "Concrete" ? "THE PREPARATION" : "THE REAL WORK"}</small><strong>{selected.title}</strong></span><ArrowUpRight size={22} /></div></Link>
        <div className="experience-note"><MoveUpRight size={30} /><p>Art in the idea.<br />Craft in every<br />square foot.</p><span>RESIDENTIAL<br />& COMMERCIAL</span></div>
      </div>
    </section>
    <section className="expression-band" aria-label="Our approach"><div className="container"><span className="band-index">01 — A DIFFERENT PERSPECTIVE</span><p>Some floors blend in.<br />Yours can <span>change everything.</span></p><div className="band-footer"><span className="spectral-asterisk" aria-hidden="true">✳</span><p>Texture you notice. Color you feel.<br />A finish that makes the entire space.</p><a href="#finishes" aria-label="Explore our finishes"><ArrowDown size={25} /></a></div></div></section>
  </>;
}
