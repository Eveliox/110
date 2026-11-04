import type { Metadata } from "next";
import { copy, localePath, type Lang } from "./copy";
import { describeDesign, designQuery, readSharedDesign } from "./floor-card";
import { site } from "./site";

// Absolute base for canonical links, the sitemap and social preview images. Set NEXT_PUBLIC_SITE_URL to the live domain.
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

/** Canonical URL plus the hreflang pair, so search engines show each visitor the right language. */
export const alternates = (lang: Lang, path: string): Metadata["alternates"] => ({
  canonical: localePath(lang, path),
  languages: { en: path, es: localePath("es", path), "x-default": path },
});

export function rootMetadata(lang: Lang): Metadata {
  const c = copy[lang];
  return {
    metadataBase: new URL(siteUrl),
    title: c.meta.title,
    description: c.meta.description,
    icons: { icon: "/icon.svg" },
    alternates: alternates(lang, "/"),
    openGraph: { title: c.meta.title, description: c.meta.description, siteName: "110% Coatings", locale: lang === "es" ? "es_US" : "en_US", type: "website", images: [{ url: "/gallery/epoxy-flake-1.jpg" }] },
  };
}

/** The home page; a shared Floor Studio link previews as the sender's floor rather than the generic site card. */
export async function homeMetadata(lang: Lang, searchParams: Promise<Record<string, string | string[] | undefined>>): Promise<Metadata> {
  const design = readSharedDesign(await searchParams);
  if (!design) return {};
  const c = copy[lang];
  const { title, sheen, room } = describeDesign(design, lang);
  const description = c.card.shareDescription(sheen, room);
  const image = { url: `/floor-card?${designQuery(design)}${lang === "es" ? "&lang=es" : ""}`, width: 1200, height: 630, alt: title };
  return { title: `${title} · ${c.studio.shareTitle}`, description, openGraph: { title, description, images: [image] }, twitter: { card: "summary_large_image", title, description, images: [image] } };
}

/** The business as search engines read it: what it is, where it works, and how to reach it. */
export function businessJsonLd(lang: Lang) {
  const c = copy[lang];
  const data = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    name: site.name,
    url: siteUrl + localePath(lang, "/").replace(/^\/$/, ""),
    description: c.meta.description,
    telephone: site.phoneHref.replace("tel:", ""),
    image: `${siteUrl}/gallery/metallic-resin-4.jpg`,
    logo: `${siteUrl}/110-coatings-logo.png`,
    address: { "@type": "PostalAddress", addressLocality: site.city, addressRegion: site.region, addressCountry: "US" },
    areaServed: site.areasServed.map(name => ({ "@type": "Place", name })),
    sameAs: [site.socials.instagram],
    knowsLanguage: ["en", "es"],
    makesOffer: c.finishes.map(f => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: f.name, description: f.description } })),
  };
  // Escaped so the JSON can't close its own <script> tag.
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
