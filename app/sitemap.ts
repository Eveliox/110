import type { MetadataRoute } from "next";
import { localePath } from "@/lib/copy";
import { finishes } from "@/lib/design";
import { siteUrl } from "@/lib/seo";

// Every page in both languages, each pointing at its translation.
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", "/work", ...finishes.map(({ slug }) => `/finishes/${slug}`)];
  return paths.flatMap(path => {
    const languages = { en: siteUrl + path, es: siteUrl + localePath("es", path) };
    return [
      { url: languages.en, alternates: { languages }, changeFrequency: "monthly" as const, priority: path === "/" ? 1 : .7 },
      { url: languages.es, alternates: { languages }, changeFrequency: "monthly" as const, priority: path === "/" ? .9 : .6 },
    ];
  });
}
