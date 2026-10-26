"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ArrowUpRight, ArrowRight, ArrowDown, Menu, X, Plus, Check, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Logo } from "./Logo";
import { FlowExperience } from "./FlowExperience";
import { FloorStudio } from "./FloorStudio";
import { SiteAtmosphere } from "./SiteAtmosphere";
import { isFloorSelection, selectionDescription, type FloorSelection } from "@/lib/floor-studio";
import { finishes, projects, steps, questions, type Finish } from "@/lib/design";
import { site } from "@/lib/site";
function Button({ href, children, light = false }: {
    href: string;
    children: ReactNode;
    light?: boolean;
}) {
    return <Link href={href} className={`button ${light ? "button-light" : ""}`}>{children}<ArrowUpRight size={18}/></Link>;
}
export function Header() {
    const [open, setOpen] = useState(false);
    return <header className="header"><div className="container nav-inner">
    <Link href="/" aria-label="110% Coatings home" className="brand"><Logo width={158} priority/></Link>
    <nav className="desktop-nav" aria-label="Main navigation"><Link href="/#finishes">Our finishes</Link><Link href="/work">Our work</Link><Link href="/#floor-studio">Floor studio</Link><Link href="/#process">The process</Link><Link href="/#about">About us</Link><Link href="/">Home</Link></nav>
    <div className="nav-actions"><Button href="/#quote">Let’s talk floors</Button><button className="menu-button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button></div>
  </div>{open && <nav id="mobile-nav" className="mobile-nav" aria-label="Mobile navigation" onKeyDown={(e) => { if (e.key === "Escape")
        setOpen(false); }}>{[["Our finishes", "/#finishes"], ["Our work", "/work"], ["Floor studio", "/#floor-studio"], ["The process", "/#process"], ["About us", "/#about"], ["Plan your project", "/#quote"]].map(([label, href]) => <Link key={label} href={href} onClick={() => setOpen(false)}>{label}<ArrowUpRight size={20}/></Link>)}</nav>}</header>;
}
function Footer() {
    return <footer className="footer"><div className="container"><div className="footer-top"><Link href="/" aria-label="110% Coatings home"><Logo variant="light" width={210}/></Link><p>A better floor.<br />A whole new feeling.</p><div><Link href="/#finishes">Explore finishes</Link><Link href="/work">See our work</Link><Link href="/#quote">Plan your project <ArrowUpRight size={15}/></Link></div></div><div className="footer-bottom"><span>© 2026 110% Coatings</span><span>Residential & commercial floor finishes</span><a href="#main">Back to top ↑</a></div></div></footer>;
}
function Shell({ children }: {
    children: ReactNode;
}) { return <SiteAtmosphere><Header /><main id="main">{children}</main><Footer /></SiteAtmosphere>; }
function FinishCards() {
  const [active, setActive] = useState(1);
  const selected = finishes[active];
  return (
    <section id="finishes" className="section container finishes-section">
      <div className="section-heading"><div><span className="eyebrow">02 / THE MATERIAL LIBRARY</span><h2>For spaces that<br /><em>deserve more.</em></h2></div><p>Your floor sets the tone for everything above it. Explore a finish that makes the space yours.</p></div>
      <div className="finish-explorer">
        <div className="finish-options" role="tablist" aria-label="Explore floor finishes">{finishes.map((f, i) => <button id={"finish-tab-" + i} role="tab" aria-selected={active === i} aria-controls="finish-display" tabIndex={active === i ? 0 : -1} onKeyDown={(e) => { if (["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"].includes(e.key)) { e.preventDefault(); const next = e.key === "Home" ? 0 : e.key === "End" ? finishes.length - 1 : (active + (e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1) + finishes.length) % finishes.length; setActive(next); document.getElementById("finish-tab-" + next)?.focus(); } }} key={f.slug} onClick={() => setActive(i)} className={active === i ? "active" : ""}><span className="finish-index">0{i + 1}</span><span><strong>{f.name}</strong><small>{f.label}</small></span><ArrowUpRight size={24} /></button>)}
          <div className="finish-advice"><span className="advice-mark">110<em>%</em></span><p>Not sure where to begin?<br /><Link href="#floor-studio">Try the floor studio. <ArrowRight size={14} /></Link></p></div>
        </div>
        <div className="finish-display" id="finish-display" role="tabpanel" aria-labelledby={"finish-tab-" + active}>
          <div className="finish-display-photo" key={selected.image}><Image src={selected.image} alt={active === 2 ? "Concrete surface preparation in progress" : selected.name + " floor coating"} fill sizes="(max-width: 800px) 100vw, 60vw" />{active === 2 && <span className="image-label">SURFACE PREPARATION IN PROGRESS</span>}<span className="collection-tag">THE {active === 1 ? "METALLIC" : active === 0 ? "FLAKE" : "CONCRETE"} COLLECTION</span></div>
          <div className="finish-display-copy"><p>{selected.description}</p><Link href={"/finishes/" + selected.slug} className="text-link">Explore finish <ArrowUpRight size={18} /></Link></div>
        </div>
      </div>
    </section>
  );
}
type Project = {
    image: string;
    name: string;
    type: string;
    note: string;
};
function PhotoDialog({ items, selected, close, move }: {
    items: readonly Project[];
    selected: number;
    close: () => void;
    move: (index: number) => void;
}) {
    const ref = useRef<HTMLDialogElement>(null);
    useEffect(() => { const dialog = ref.current; dialog?.showModal(); const previous = document.body.style.overflow; document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = previous; dialog?.close(); }; }, []);
    const item = items[selected];
    return <dialog ref={ref} className="photo-dialog" onCancel={close} onClick={(e) => { if (e.target === e.currentTarget)
        close(); }} onKeyDown={(e) => { if (e.key === "ArrowLeft")
        move((selected - 1 + items.length) % items.length); if (e.key === "ArrowRight")
        move((selected + 1) % items.length); }} aria-label={item.name}><div className="dialog-top"><span>{item.name} <small> / {item.type}</small></span><button onClick={close} aria-label="Close photograph" autoFocus><X /></button></div><div className="dialog-photo"><Image src={item.image} alt={`${item.name}: ${item.note}`} fill sizes="90vw" style={{ objectFit: "contain" }}/></div><div className="dialog-bottom"><p>{item.note}</p><div><button aria-label="Previous photograph" onClick={() => move((selected - 1 + items.length) % items.length)}><ChevronLeft /></button><span>{selected + 1} / {items.length}</span><button aria-label="Next photograph" onClick={() => move((selected + 1) % items.length)}><ChevronRight /></button></div></div></dialog>;
}
function Gallery({ full = false, items = projects }: {
    full?: boolean;
    items?: readonly Project[];
}) {
    const [filter, setFilter] = useState("All finishes");
    const [selected, setSelected] = useState<number | null>(null);
    const filtered = items.filter((p) => filter === "All finishes" || p.type === filter);
    const visible = full ? filtered : filtered.slice(0, 4);
    return <><div className="gallery-toolbar"><div className="filter-group" aria-label="Filter projects">{["All finishes", "Epoxy flake", "Metallic epoxy"].map((f) => <button key={f} className={filter === f ? "active" : ""} aria-pressed={filter === f} onClick={() => { setFilter(f); setSelected(null); }}>{f}</button>)}</div><span className="gallery-count" aria-live="polite">{visible.length} projects</span></div><div className="project-grid">{visible.map((p, i) => <button className="project" key={p.image} onClick={() => setSelected(i)} aria-label={`View ${p.name}`}><div className="project-image"><Image src={p.image} alt={`${p.type}: ${p.name}`} fill sizes="(max-width: 650px) 100vw, 50vw"/><span className="project-open"><Plus size={21}/></span></div><div className="project-caption"><h3>{p.name}</h3><span>{p.type}<ArrowUpRight size={17}/></span></div></button>)}</div>{selected !== null && <PhotoDialog items={visible} selected={selected} close={() => setSelected(null)} move={setSelected}/>}</>;
}
function Process() { return <section className="section container" id="process"><div className="section-heading"><div><span className="eyebrow">04 / BEHIND THE SURFACE</span><h2>Exceptional is<br /><em>in the details.</em></h2></div><p>A considered process.<br />From your first idea to the final walkthrough.</p></div><div className="process-grid">{steps.map(([title, text], i) => <article key={title}><div className="step-number">0{i + 1}<ArrowRight size={20}/></div><h3>{title}</h3><p>{text}</p></article>)}</div></section>; }
function About() { return <section className="about-section" id="about"><div className="container about-grid"><div className="about-photo"><Image src="/gallery/concrete-grinding.jpg" alt="Concrete grinding equipment preparing the surface before coating" fill sizes="(max-width: 800px) 100vw, 50vw"/><span className="image-label">THE WORK BENEATH THE FINISH</span></div><div className="about-copy"><span className="eyebrow">The 110% approach</span><h2>Beauty on the surface.<br /><em>Precision beneath it.</em></h2><p>A beautiful floor is the result of more than a color choice. It starts with understanding the space, preparing the surface and giving the small details the attention they deserve.</p><p>That’s the thinking behind 110% Coatings. Thoughtful finishes for homes, garages and places of business.</p><div className="about-points"><span><Check size={16}/> A finish that fits your space</span><span><Check size={16}/> Care from preparation to completion</span></div><Link className="text-link" href="#quote">Tell us what you have in mind <ArrowUpRight size={18}/></Link></div></div></section>; }
function FAQ() { return <section className="section container faq-section"><div><span className="eyebrow">A little clarity</span><h2>Before we<br /><em>begin.</em></h2></div><div className="faq-list">{questions.map(([q, a]) => <details key={q}><summary>{q}<Plus size={18}/></summary><p>{a}</p></details>)}</div></section>; }
export function Quote({ initial = "" }: {
    initial?: string;
}) {
    const [status, setStatus] = useState("");
    const [busy, setBusy] = useState(false);
    const [selectedFinish, setSelectedFinish] = useState(initial);
    const [studioSelection, setStudioSelection] = useState<FloorSelection | null>(null);
    const [sampleRequested, setSampleRequested] = useState(false);
    useEffect(() => {
      const receive = (event: Event) => {
        const detail: unknown = (event as CustomEvent).detail;
        if (isFloorSelection(detail)) { setStudioSelection(detail); setSelectedFinish(detail.finish); }
      };
      const sample = (event: Event) => {
        const detail: unknown = (event as CustomEvent).detail;
        if (isFloorSelection(detail)) { setStudioSelection(detail); setSelectedFinish(detail.finish); setSampleRequested(true); }
      };
      window.addEventListener("floor-studio-selection", receive);
      window.addEventListener("floor-studio-sample", sample);
      return () => { window.removeEventListener("floor-studio-selection", receive); window.removeEventListener("floor-studio-sample", sample); };
    }, []);
    const connected = !site.formspreeEndpoint.includes("REPLACE_ME");
    async function submit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = e.currentTarget;
        const data = new FormData(form);
        setStatus("");
        if (!connected) {
            const text = "110% COATINGS — PROJECT BRIEF\n\n" + Array.from(data.entries()).map(([key, value]) => `${key}: ${value}`).join("\n") + "\n\nThis brief has been saved to your device. It has not been submitted.\n";
            const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
            const a = document.createElement("a");
            a.href = url;
            a.download = "110-coatings-project-brief.txt";
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            setStatus("Your project brief is ready. It was saved to your device, not submitted.");
            return;
        }
        setBusy(true);
        try {
            const res = await fetch(site.formspreeEndpoint, { method: "POST", body: data, headers: { Accept: "application/json" } });
            if (!res.ok)
                throw new Error();
            setStatus("Thank you. Your project details have been sent.");
            form.reset(); setSelectedFinish(initial); setStudioSelection(null); setSampleRequested(false);
        }
        catch {
            setStatus("Your request could not be sent. Your details are still here so you can try again.");
        }
        finally {
            setBusy(false);
        }
    }
    return <section className="quote-section" id="quote"><div className="container quote-grid"><div className="quote-copy"><span className="eyebrow">Your space. Your next step.</span><h2>Your space.<br /><span>Reimagined.</span></h2><p>Have a space in mind? Tell us a little about it. Let’s find the right finish for your next chapter.</p><div className="quote-note"><ArrowDown size={22}/><span>Start with the basics.<br />We’ll take it from there.</span></div></div><form className="quote-form" onSubmit={submit}><div className="form-heading"><h3>Let’s talk about your project.</h3><span>01 / THE DETAILS</span></div><div className="form-grid">{studioSelection && <div className={`studio-form-choice${sampleRequested ? " studio-form-choice-sample" : ""}`}><Check size={16}/><span>{sampleRequested ? "Free 4×4 sample requested" : "Your floor studio selection"}<strong>{selectionDescription(studioSelection)}</strong></span><button type="button" aria-label="Remove floor studio selection" onClick={()=>{setStudioSelection(null);setSampleRequested(false);}}><X size={15}/></button><input type="hidden" name="Floor studio selection" value={selectionDescription(studioSelection)}/>{sampleRequested && <input type="hidden" name="Request type" value="Free sample"/>}</div>}<label>Your name<input name="Name" autoComplete="name" placeholder="First and last name" required maxLength={120}/></label><label>Email address<input type="email" name="Email" autoComplete="email" placeholder="you@example.com" required/></label><label>Phone <span className="optional">(optional)</span><input type="tel" name="Phone" autoComplete="tel" placeholder="Your phone number"/></label><label>Project ZIP code<input name="ZIP code" autoComplete="postal-code" placeholder="e.g. 32801" pattern="[0-9]{5}(-[0-9]{4})?" required/></label><label>Finish you’re considering<select name="Finish" value={selectedFinish} onChange={e=>{setSelectedFinish(e.target.value);setStudioSelection(null);}} required><option value="" disabled>Select a finish</option>{finishes.map((f) => <option key={f.slug} value={f.name}>{f.name}</option>)}<option>Help me choose</option></select></label><label>Approximate size<select name="Size" defaultValue=""><option value="">Not sure yet</option><option>Under 500 sq ft</option><option>500–1,000 sq ft</option><option>1,000–2,000 sq ft</option><option>Over 2,000 sq ft</option></select></label><label className="full-field">A little about your space<textarea name="Project details" placeholder="A garage refresh? A new showroom? Tell us what you’re thinking." rows={3} maxLength={4000}/></label></div><button className="button form-submit" disabled={busy} type="submit">{busy ? "Sending…" : connected ? "Request a conversation" : "Save my project brief"}{connected ? <ArrowUpRight size={18}/> : <Download size={18}/>}</button><p className="form-note">{connected ? "Your details will only be used to discuss your project." : "Online inquiries are not open yet. Save your details as a project brief; nothing is submitted."}</p><p className="form-status" role="status">{status}</p></form></div></section>;
}
export function Home() { return <Shell><FlowExperience /><FinishCards /><FloorStudio /><Process /><About /><FAQ /><Quote /></Shell>; }
export function WorkPage() { return <Shell><section className="container archive-intro"><span className="eyebrow">The project collection</span><h1>Real spaces.<br /><span className="soft-text">Remarkable floors.</span></h1><p>Explore the textures, movement and details in our original job photographs.</p></section><section className="container archive-gallery"><Gallery full/></section><section className="section container"><div className="section-heading"><div><span className="eyebrow">A change in perspective</span><h2>Before meets after.</h2></div><p>The original project comparisons.<br />Same space. A different feeling.</p></div><div className="comparison-grid">{[1, 2].map((n) => <figure key={n}><Image src={`/gallery/before-after-${n}.jpg`} alt={`Original stacked before and after comparison of ${n === 1 ? "a garage flake floor" : "a blue metallic floor"}`} width={1200} height={n === 1 ? 1437 : 1200} sizes="(max-width: 650px) 100vw, 50vw"/><figcaption>{n === 1 ? "Garage transformation / Epoxy flake" : "Surface transformation / Metallic epoxy"}</figcaption></figure>)}</div></section><Quote /></Shell>; }
export function FinishPage({ finish }: {
    finish: Finish;
}) { return <Shell><section className="container detail-hero"><div><Link href="/#finishes" className="back-link">← All finishes</Link><span className="eyebrow">{finish.label}</span><h1>{finish.name}<span className="accent">.</span></h1><p className="detail-lede">{finish.description}</p><p>{finish.detail}</p><Button href="#quote">Plan a {finish.name.toLowerCase()} floor</Button><span className="finish-uses">{finish.uses}</span></div><div className="detail-photo"><Image src={finish.image} alt={finish.slug === "polished-concrete" ? "Concrete grinding and surface preparation" : `${finish.name} original project photograph`} fill preload sizes="(max-width: 800px) 100vw, 50vw"/>{finish.slug === "polished-concrete" && <span className="image-label">SURFACE PREPARATION IN PROGRESS</span>}</div></section><section className="section container"><div className="section-heading"><div><span className="eyebrow">The details, up close</span><h2>{finish.slug === "polished-concrete" ? "It starts with the slab." : "Find your inspiration."}</h2></div></div><div className="detail-gallery">{finish.gallery.map((src, i) => <Link href={src} target="_blank" className="detail-gallery-image" key={src} aria-label={`Open original ${finish.name} photo ${i + 1}`}><Image src={src} alt={`${finish.name} ${finish.slug === "polished-concrete" ? "preparation" : "finish"}, photograph ${i + 1}`} fill sizes="(max-width: 650px) 100vw, 33vw"/><span className="project-open"><ArrowUpRight size={20}/></span></Link>)}</div></section><FloorStudio initialSystem={finish.slug === "epoxy-flake" ? "flake" : finish.slug === "polished-concrete" ? "concrete" : "metallic"}/><Process /><FAQ /><Quote initial={finish.name}/></Shell>; }
