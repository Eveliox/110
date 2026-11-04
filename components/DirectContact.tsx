"use client";

import { MessageSquareText, Phone } from "lucide-react";
import { useCopy } from "./LangProvider";
import { site } from "@/lib/site";

/** The Instagram glyph (lucide no longer ships brand icons). */
export function InstagramIcon({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.3" cy="6.7" r=".6" fill="currentColor" stroke="none" />
  </svg>;
}

/** For visitors who would rather talk than fill in a form: call, text, or DM on Instagram. */
export function DirectContact() {
  const c = useCopy().contact;
  return <div className="direct-contact">
    <p>{c.lead(site.ownerShort)}</p>
    <div>
      <a href={site.phoneHref} className="direct-call"><Phone size={16} />{c.call(site.phoneDisplay)}</a>
      <a href={site.smsHref} className="direct-text" aria-label={c.textLabel(site.phoneDisplay)}><MessageSquareText size={16} />{c.text}</a>
      <a href={site.instagramDm} className="direct-dm" target="_blank" rel="noopener" aria-label={c.dmLabel(site.instagramHandle)}><InstagramIcon />{c.dm(site.instagramHandle)}</a>
    </div>
  </div>;
}
