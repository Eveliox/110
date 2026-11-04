"use client";

import { usePathname } from "next/navigation";
import { useCopy } from "./LangProvider";
import { switchPath } from "@/lib/copy";

/** The same page in the other language. Each language has its own root layout, so this is a full page load. */
export function LanguageSwitch({ className = "lang-switch" }: { className?: string }) {
  const c = useCopy();
  const pathname = usePathname();
  return <a href={switchPath(pathname, c.nav.otherLang)} hrefLang={c.nav.otherLang} lang={c.nav.otherLang} className={className} aria-label={c.nav.otherLabel}>{c.nav.other}</a>;
}
