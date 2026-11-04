"use client";

import { createContext, useContext, type ReactNode } from "react";
import { copy, type Lang } from "@/lib/copy";

const LangContext = createContext<Lang>("en");

/** Set once per root layout: English pages at /, Spanish under /es. */
export function LangProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
export const useCopy = () => copy[useContext(LangContext)];
