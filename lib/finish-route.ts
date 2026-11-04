import type { Metadata } from "next";
import { copy, localized, type Lang } from "./copy";
import { finishes } from "./design";
import { alternates } from "./seo";

// Shared by the English and Spanish /finishes/[slug] pages.
export const finishParams = () => finishes.map(({ slug }) => ({ slug }));

export async function finishMetadata(lang: Lang, params: Promise<{ slug: string }>): Promise<Metadata> {
  const { slug } = await params;
  const c = copy[lang];
  const finish = localized(c).finishes.find((item) => item.slug === slug);
  if (!finish) return { title: c.meta.notFound };
  return { title: c.meta.finishTitle(finish.name), description: finish.description, alternates: alternates(lang, `/finishes/${slug}`) };
}

export const isFinish = (slug: string) => finishes.some((item) => item.slug === slug);
