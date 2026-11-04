"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ArrowUpRight, ArrowRight, Menu, X, Plus, Check, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Logo } from "./Logo";
import { FlowExperience } from "./FlowExperience";
import { FloorStudio } from "./FloorStudio";
import { SampleDeck } from "./SampleDeck";
import { SqueegeeReveal } from "./SqueegeeReveal";
import { SiteAtmosphere } from "./SiteAtmosphere";
import { ScrollBar } from "./ScrollBar";
import { DirectContact, InstagramIcon } from "./DirectContact";
import { useCopy } from "./LangProvider";
import { LanguageSwitch } from "./LanguageSwitch";
import { isFloorSelection, selectionDescription, type FloorSelection } from "@/lib/floor-studio";
import { localePath, localized } from "@/lib/copy";
import { site } from "@/lib/site";
import { sizeBucket } from "@/lib/pricing";
function Button({ href, children, light = false }: {
    href: string;
    children: ReactNode;
    light?: boolean;
}) {
    return <Link href={href} className={`button ${light ? "button-light" : ""}`}>{children}<ArrowUpRight size={18}/></Link>;
}
export function Header() {
    const c = useCopy();
    const to = (href: string) => localePath(c.lang, href);
    const [open, setOpen] = useState(false);
    return <><header className="header"><div className="container nav-inner">
    <Link href={to("/")} aria-label={c.nav.home} className="brand"><Logo width={158} priority/></Link>
    <nav className="desktop-nav" aria-label={c.nav.main}><Link href={to("/#finishes")}>{c.nav.finishes}</Link><Link href={to("/work")}>{c.nav.work}</Link><Link href={to("/#floor-studio")}>{c.nav.studio}</Link><Link href={to("/#process")}>{c.nav.process}</Link><Link href={to("/#about")}>{c.nav.about}</Link><Link href={to("/")}>{c.nav.homeLink}</Link></nav>
    <div className="nav-actions"><LanguageSwitch /><Button href={to("/#quote")}>{c.nav.talk}</Button><button className="menu-button" aria-label={open ? c.nav.close : c.nav.open} aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button></div>
  </div>{open && <nav id="mobile-nav" className="mobile-nav" aria-label={c.nav.mobile} onKeyDown={(e) => { if (e.key === "Escape")
        setOpen(false); }}>{[[c.nav.finishes, "/#finishes"], [c.nav.work, "/work"], [c.nav.studio, "/#floor-studio"], [c.nav.process, "/#process"], [c.nav.about, "/#about"], [c.nav.plan, "/#quote"]].map(([label, href]) => <Link key={label} href={to(href)} onClick={() => setOpen(false)}>{label}<ArrowUpRight size={20}/></Link>)}</nav>}</header><ScrollBar /></>;
}
function Footer() {
    const c = useCopy();
    const to = (href: string) => localePath(c.lang, href);
    return <footer className="footer" data-pour=".4 1 .3 .9"><div className="container"><div className="footer-top"><Link href={to("/")} aria-label={c.nav.home}><Logo variant="light" width={210}/></Link><p>{c.footer.tagline[0]} <br />{c.footer.tagline[1]}</p><div><Link href={to("/#finishes")}>{c.footer.explore}</Link><Link href={to("/work")}>{c.footer.work}</Link><Link href={to("/#quote")}>{c.footer.plan} <ArrowUpRight size={15}/></Link><a href={site.phoneHref}>{c.contact.call(site.phoneDisplay)}</a><a href={site.smsHref} aria-label={c.contact.textLabel(site.phoneDisplay)}>{c.contact.text}</a><a href={site.instagramDm} target="_blank" rel="noopener"><InstagramIcon size={14}/> {c.contact.dm(site.instagramHandle)}</a><LanguageSwitch className="footer-lang" /></div></div><div className="footer-bottom"><span>© 2026 110% Coatings · <a className="footer-credit" href="https://azulwebdev.com" target="_blank" rel="noopener">{c.footer.credit}</a></span><span>{c.footer.kind}</span><a href="#main">{c.footer.top}</a></div></div></footer>;
}
function Shell({ children }: {
    children: ReactNode;
}) { return <SiteAtmosphere><Header /><main id="main">{children}</main><Footer /></SiteAtmosphere>; }
function FinishCards() {
  const c = useCopy();
  const { finishes } = localized(c);
  const [active, setActive] = useState(1);
  const selected = finishes[active];
  return (
    <section id="finishes" className="section container finishes-section" data-pour=".85 1.2 .6">
      <div className="section-heading"><div><span className="eyebrow">{c.library.eyebrow}</span><h2>{c.library.title[0]}<br /><em>{c.library.title[1]}</em></h2></div><p>{c.library.intro}</p></div>
      <div className="finish-explorer">
        <div className="sample-column"><SampleDeck active={active} onSelect={setActive} />
          <div className="finish-advice"><span className="advice-mark">110<em>%</em></span><p>{c.library.adviceQ}<br /><Link href="#floor-studio">{c.library.adviceLink} <ArrowRight size={14} /></Link></p></div>
        </div>
        <div className="finish-display" id="finish-display" role="tabpanel" aria-labelledby={"finish-tab-" + active}>
          <div className="finish-display-photo" key={selected.image}><Image src={selected.image} alt={active === 2 ? c.library.prepAlt : c.library.photoAlt(selected.name)} fill sizes="(max-width: 800px) 100vw, 60vw" />{active === 2 && <span className="image-label">{c.library.prepLabel}</span>}<span className="collection-tag">{c.library.collections[active]}</span></div>
          <div className="finish-display-copy"><p>{selected.description}</p><Link href={localePath(c.lang, "/finishes/" + selected.slug)} className="text-link">{c.library.explore} <ArrowUpRight size={18} /></Link></div>
        </div>
      </div>
    </section>
  );
}
type Project = {
    image: string;
    name: string;
    type: string;
    kind: string;
    note: string;
};
function PhotoDialog({ items, selected, close, move }: {
    items: readonly Project[];
    selected: number;
    close: () => void;
    move: (index: number) => void;
}) {
    const c = useCopy();
    const ref = useRef<HTMLDialogElement>(null);
    useEffect(() => { const dialog = ref.current; dialog?.showModal(); const previous = document.body.style.overflow; document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = previous; dialog?.close(); }; }, []);
    const item = items[selected];
    return <dialog ref={ref} className="photo-dialog" onCancel={close} onClick={(e) => { if (e.target === e.currentTarget)
        close(); }} onKeyDown={(e) => { if (e.key === "ArrowLeft")
        move((selected - 1 + items.length) % items.length); if (e.key === "ArrowRight")
        move((selected + 1) % items.length); }} aria-label={item.name}><div className="dialog-top"><span>{item.name} <small> / {item.type}</small></span><button onClick={close} aria-label={c.gallery.close} autoFocus><X /></button></div><div className="dialog-photo"><Image src={item.image} alt={`${item.name}: ${item.note}`} fill sizes="90vw" style={{ objectFit: "contain" }}/></div><div className="dialog-bottom"><p>{item.note}</p><div><button aria-label={c.gallery.prev} onClick={() => move((selected - 1 + items.length) % items.length)}><ChevronLeft /></button><span>{selected + 1} / {items.length}</span><button aria-label={c.gallery.next} onClick={() => move((selected + 1) % items.length)}><ChevronRight /></button></div></div></dialog>;
}
function Gallery({ full = false }: {
    full?: boolean;
}) {
    const c = useCopy();
    const { projects: items } = localized(c);
    // Filters by the English finish type; labels show in the page's language.
    const filters = [["", c.gallery.all], ["Epoxy flake", c.finishes[0].name], ["Metallic epoxy", c.finishes[1].name]];
    const [filter, setFilter] = useState("");
    const [selected, setSelected] = useState<number | null>(null);
    const filtered = items.filter((p) => !filter || p.kind === filter);
    const visible = full ? filtered : filtered.slice(0, 4);
    return <><div className="gallery-toolbar"><div className="filter-group" aria-label={c.gallery.filter}>{filters.map(([key, label]) => <button key={key} className={filter === key ? "active" : ""} aria-pressed={filter === key} onClick={() => { setFilter(key); setSelected(null); }}>{label}</button>)}</div><span className="gallery-count" aria-live="polite">{c.gallery.count(visible.length)}</span></div><div className="project-grid">{visible.map((p, i) => <button className="project" key={p.image} onClick={() => setSelected(i)} aria-label={c.gallery.view(p.name)}><div className="project-image"><Image src={p.image} alt={`${p.type}: ${p.name}`} fill sizes="(max-width: 650px) 100vw, 50vw"/><span className="project-open"><Plus size={21}/></span></div><div className="project-caption"><h3>{p.name}</h3><span>{p.type}<ArrowUpRight size={17}/></span></div></button>)}</div>{selected !== null && <PhotoDialog items={visible} selected={selected} close={() => setSelected(null)} move={setSelected}/>}</>;
}
function Process() { const c = useCopy(); return <section className="section container" id="process" data-pour=".35 .9 .36 .8"><div className="section-heading"><div><span className="eyebrow">{c.process.eyebrow}</span><h2>{c.process.title[0]}<br /><em>{c.process.title[1]}</em></h2></div><p>{c.process.intro[0]} <br />{c.process.intro[1]}</p></div><div className="process-grid">{c.steps.map(([title, text], i) => <article key={title}><div className="step-number">0{i + 1}</div><h3>{title}</h3><p>{text}</p></article>)}</div></section>; }
function About() { const c = useCopy(); return <section className="about-section" id="about" data-pour=".5 1 .42 .5"><div className="container about-grid"><div className="about-photo"><Image src="/gallery/concrete-grinding.jpg" alt={c.about.alt} fill sizes="(max-width: 800px) 100vw, 50vw"/><span className="image-label">{c.about.label}</span></div><div className="about-copy"><span className="eyebrow">{c.about.eyebrow}</span><h2>{c.about.title[0]}<br /><em>{c.about.title[1]}</em></h2>{c.about.body.map(p => <p key={p}>{p}</p>)}<div className="about-points">{c.about.points.map(point => <span key={point}><Check size={16}/> {point}</span>)}</div><Link className="text-link" href="#quote">{c.about.link} <ArrowUpRight size={18}/></Link></div></div></section>; }
function FAQ() { const c = useCopy(); return <div className="quote-faq"><span className="eyebrow">{c.faq.eyebrow}</span><h3>{c.faq.title}</h3><div className="faq-list">{c.questions.map(([q, a]) => <details key={q}><summary>{q}<Plus size={18}/></summary><p>{a}</p></details>)}</div></div>; }
export function Quote({ initial = "" }: {
    initial?: string;
}) {
    const c = useCopy();
    const { finishes } = localized(c);
    const [status, setStatus] = useState("");
    const [busy, setBusy] = useState(false);
    const [selectedFinish, setSelectedFinish] = useState(initial);
    const [studioSelection, setStudioSelection] = useState<FloorSelection | null>(null);
    const [sampleRequested, setSampleRequested] = useState(false);
    const [size, setSize] = useState("");
    const sizes = c.quote.sizes;
    useEffect(() => {
      const receive = (event: Event) => {
        const detail: unknown = (event as CustomEvent).detail;
        if (isFloorSelection(detail)) { setStudioSelection(detail); setSelectedFinish(detail.finish); if (detail.area) setSize(sizes[sizeBucket(detail.area)]); }
      };
      const sample = (event: Event) => {
        const detail: unknown = (event as CustomEvent).detail;
        if (isFloorSelection(detail)) { setStudioSelection(detail); setSelectedFinish(detail.finish); setSampleRequested(true); if (detail.area) setSize(sizes[sizeBucket(detail.area)]); }
      };
      window.addEventListener("floor-studio-selection", receive);
      window.addEventListener("floor-studio-sample", sample);
      return () => { window.removeEventListener("floor-studio-selection", receive); window.removeEventListener("floor-studio-sample", sample); };
    }, [sizes]);
    const connected = !site.formspreeEndpoint.includes("REPLACE_ME");
    const describe = (selection: FloorSelection) => selectionDescription(selection, c.sqft);
    async function submit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = e.currentTarget;
        const data = new FormData(form);
        setStatus("");
        if (!connected) {
            const text = c.quote.briefTitle + "\n\n" + Array.from(data.entries()).map(([key, value]) => `${key}: ${value}`).join("\n") + "\n\n" + c.quote.briefFooter + "\n";
            const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
            const a = document.createElement("a");
            a.href = url;
            a.download = c.quote.briefFile;
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            setStatus(c.quote.briefReady);
            return;
        }
        setBusy(true);
        try {
            const res = await fetch(site.formspreeEndpoint, { method: "POST", body: data, headers: { Accept: "application/json" } });
            if (!res.ok)
                throw new Error();
            setStatus(c.quote.sent);
            form.reset(); setSize(""); setSelectedFinish(initial); setStudioSelection(null); setSampleRequested(false);
        }
        catch {
            setStatus(c.quote.failed);
        }
        finally {
            setBusy(false);
        }
    }
    return <section className="quote-section" id="quote" data-pour=".55 1.05 .32 .85"><div className="container quote-grid"><div className="quote-copy"><span className="eyebrow">{c.quote.eyebrow}</span><h2>{c.quote.title[0]}<br /><span>{c.quote.title[1]}</span></h2><p>{c.quote.intro}</p><div className="quote-note"><ArrowRight size={22}/><span>{c.quote.note[0]} <br />{c.quote.note[1]}</span></div><DirectContact /></div><form className="quote-form" onSubmit={submit}><div className="form-heading"><h3>{c.quote.heading}</h3><span>{c.quote.step}</span></div><div className="form-grid">{studioSelection && <div className={`studio-form-choice${sampleRequested ? " studio-form-choice-sample" : ""}`}><Check size={16}/><span>{sampleRequested ? c.quote.sampleRequested : c.quote.studioChoice}<strong>{describe(studioSelection)}</strong></span><button type="button" aria-label={c.quote.removeChoice} onClick={()=>{setStudioSelection(null);setSampleRequested(false);}}><X size={15}/></button><input type="hidden" name="Floor studio selection" value={describe(studioSelection)}/>{sampleRequested && <input type="hidden" name="Request type" value="Free sample"/>}</div>}{c.lang === "es" && <input type="hidden" name="Language" value="Spanish"/>}<label>{c.quote.name}<input name="Name" autoComplete="name" placeholder={c.quote.namePh} required maxLength={120}/></label><label>{c.quote.email}<input type="email" name="Email" autoComplete="email" placeholder={c.quote.emailPh} required/></label><label>{c.quote.phone} <span className="optional">{c.quote.optional}</span><input type="tel" name="Phone" autoComplete="tel" placeholder={c.quote.phonePh}/></label><label>{c.quote.zip}<input name="ZIP code" autoComplete="postal-code" placeholder={c.quote.zipPh} pattern="[0-9]{5}(-[0-9]{4})?" required/></label><label>{c.quote.finish}<select name="Finish" value={selectedFinish} onChange={e=>{setSelectedFinish(e.target.value);setStudioSelection(null);}} required><option value="" disabled>{c.quote.finishPh}</option>{finishes.map((f) => <option key={f.slug} value={f.name}>{f.name}</option>)}<option>{c.quote.helpChoose}</option></select></label><label>{c.quote.size}<select name="Size" value={size} onChange={(e) => setSize(e.target.value)}><option value="">{c.quote.sizePh}</option>{sizes.map(s => <option key={s}>{s}</option>)}</select></label><label className="full-field">{c.quote.details}<textarea name="Project details" placeholder={c.quote.detailsPh} rows={3} maxLength={4000}/></label></div><button className="button form-submit" disabled={busy} type="submit">{busy ? c.quote.sending : connected ? c.quote.send : c.quote.save}{connected ? <ArrowUpRight size={18}/> : <Download size={18}/>}</button><p className="form-note">{connected ? c.quote.privacy : c.quote.closed(site.ownerShort)}</p><p className="form-status" role="status">{status}</p></form><FAQ /></div></section>;
}
function Transformation() {
  const c = useCopy();
  return <section className="section container squeegee-section" data-pour=".6 1 .55" aria-labelledby="squeegee-title">
    <div className="section-heading"><div><span className="eyebrow">{c.squeegee.eyebrow}</span><h2 id="squeegee-title">{c.squeegee.title[0]}<br /><em>{c.squeegee.title[1]}</em></h2></div><p>{c.squeegee.intro[0]} <br />{c.squeegee.intro[1]}</p></div>
    <SqueegeeReveal />
  </section>;
}
export function Home() { return <Shell><FlowExperience /><FinishCards /><FloorStudio /><Transformation /><Process /><About /><Quote /></Shell>; }
export function WorkPage() { return <Shell><WorkContent /><Quote /></Shell>; }
function WorkContent() {
    const c = useCopy();
    const w = c.workPage;
    return <><section className="container archive-intro"><span className="eyebrow">{w.eyebrow}</span><h1>{w.title[0]}<br /><span className="soft-text">{w.title[1]}</span></h1><p>{w.intro}</p></section><section className="container archive-gallery"><Gallery full/></section><section className="section container"><div className="section-heading"><div><span className="eyebrow">{w.compareEyebrow}</span><h2>{w.compareTitle}</h2></div><p>{w.compareIntro[0]} <br />{w.compareIntro[1]}</p></div><div className="comparison-grid">{[1, 2].map((n) => <figure key={n}><Image src={`/gallery/before-after-${n}.jpg`} alt={w.compareAlt[n - 1]} width={1200} height={n === 1 ? 1437 : 1200} sizes="(max-width: 650px) 100vw, 50vw"/><figcaption>{w.compareCaption[n - 1]}</figcaption></figure>)}</div></section></>;
}
export function FinishPage({ slug }: {
    slug: string;
}) {
    const c = useCopy();
    const finish = localized(c).finishes.find((f) => f.slug === slug)!;
    const f = c.finishPage;
    const prep = finish.slug === "polished-concrete";
    return <Shell><section className="container detail-hero"><div><Link href={localePath(c.lang, "/#finishes")} className="back-link">{f.back}</Link><span className="eyebrow">{finish.label}</span><h1>{finish.name}<span className="accent">.</span></h1><p className="detail-lede">{finish.description}</p><p>{finish.detail}</p><Button href="#quote">{f.plan(finish.name)}</Button><span className="finish-uses">{finish.uses}</span></div><div className="detail-photo"><Image src={finish.image} alt={prep ? f.prepAlt : f.photoAlt(finish.name)} fill preload sizes="(max-width: 800px) 100vw, 50vw"/>{prep && <span className="image-label">{c.library.prepLabel}</span>}</div></section><section className="section container"><div className="section-heading"><div><span className="eyebrow">{f.eyebrow}</span><h2>{prep ? f.slab : f.inspire}</h2></div></div><div className="detail-gallery">{finish.gallery.map((src, i) => <Link href={src} target="_blank" className="detail-gallery-image" key={src} aria-label={f.open(finish.name, i + 1)}><Image src={src} alt={f.galleryAlt(finish.name, prep, i + 1)} fill sizes="(max-width: 650px) 100vw, 33vw"/><span className="project-open"><ArrowUpRight size={20}/></span></Link>)}</div></section><FloorStudio initialSystem={finish.slug === "epoxy-flake" ? "flake" : prep ? "concrete" : "metallic"}/><Process /><Quote initial={finish.name}/></Shell>;
}
