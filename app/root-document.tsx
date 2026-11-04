import type { ReactNode } from "react";
import { Inter, Archivo } from "next/font/google";
import { LangProvider } from "@/components/LangProvider";
import { copy, type Lang } from "@/lib/copy";
import { businessJsonLd } from "@/lib/seo";
import "./globals.css";
import "./luxury.css";
import "./flow.css";
import "./floor-studio.css";
import "./pour.css";
import "./materials.css";
import "./refine.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin"], style: ["normal", "italic"], axes: ["wdth"], display: "swap" });

/** The document shared by the English (/) and Spanish (/es) root layouts. */
export function RootDocument({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <html lang={lang} className={`${inter.variable} ${archivo.variable}`}>
    <body>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: businessJsonLd(lang) }} />
      <a href="#main" className="skip-link">{copy[lang].nav.skip}</a>
      <LangProvider lang={lang}>{children}</LangProvider>
    </body>
  </html>;
}
