"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, MessageSquareText, Phone } from "lucide-react";
import { Logo } from "./Logo";
import { InstagramIcon } from "./DirectContact";
import { useCopy } from "./LangProvider";
import { LanguageSwitch } from "./LanguageSwitch";
import { localePath } from "@/lib/copy";
import { site } from "@/lib/site";

/** A slim bar that slides in when the visitor scrolls back up, so the menu and a way to get in touch are never far away. */
export function ScrollBar() {
  const c = useCopy();
  const to = (href: string) => localePath(c.lang, href);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    let last = window.scrollY, frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      if (Math.abs(y - last) < 8) return;
      // Past the hero, and heading back up.
      setShown(y > window.innerHeight * .8 && y < last);
      last = y;
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(frame); };
  }, []);
  return <div className="scroll-bar" data-shown={shown} inert={!shown}>
    <div className="container scroll-bar-inner">
      <Link href={to("/")} aria-label={c.nav.home} className="scroll-bar-brand"><Logo width={92} /></Link>
      <nav aria-label={c.bar.quick}><Link href={to("/#finishes")}>{c.bar.finishes}</Link><Link href={to("/#floor-studio")}>{c.bar.studio}</Link><Link href={to("/work")}>{c.bar.work}</Link><Link href={to("/#process")}>{c.bar.process}</Link><LanguageSwitch className="scroll-bar-lang" /></nav>
      <div className="scroll-bar-actions">
        <a href={site.phoneHref} className="scroll-bar-call" aria-label={c.contact.call(site.phoneDisplay)}><Phone size={15} /><span>{site.phoneDisplay}</span></a>
        <a href={site.smsHref} className="scroll-bar-dm" aria-label={c.contact.textLabel(site.phoneDisplay)} title={c.contact.textLabel(site.phoneDisplay)}><MessageSquareText size={15} /></a>
        <a href={site.instagramDm} className="scroll-bar-dm" target="_blank" rel="noopener" aria-label={c.contact.dmLabel(site.instagramHandle)} title={c.bar.dmTitle}><InstagramIcon size={15} /></a>
        <Link href={to("/#quote")} className="scroll-bar-quote"><span className="label-full">{c.bar.quote}</span><span className="label-short">{c.bar.quoteShort}</span> <ArrowUpRight size={15} /></Link>
      </div>
    </div>
  </div>;
}
