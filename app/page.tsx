import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Home } from "@/components/Studio";
import { describeDesign, designQuery, readSharedDesign } from "@/lib/floor-card";

// A shared Floor Studio link previews as the sender's floor rather than the generic site card.
export async function generateMetadata({ searchParams }: PageProps<"/">): Promise<Metadata> {
  const design = readSharedDesign(await searchParams);
  if (!design) return {};
  const { title, sheen, room } = describeDesign(design);
  const description = `${sheen} finish for a ${room.toLowerCase()}. Open it in the 110% Coatings Floor Studio and look around in 3D.`;
  const image = { url: `/floor-card?${designQuery(design)}`, width: 1200, height: 630, alt: `${title} sample chip` };
  return { title: `${title} · 110% Coatings Floor Studio`, description, openGraph: { title, description, images: [image] }, twitter: { card: "summary_large_image", title, description, images: [image] } };
}

// Marks the shared-link metadata as intentionally request-time; the page itself still prerenders.
async function Connection() { await connection(); return null; }

export default function HomePage() {
  return <><Home /><Suspense><Connection /></Suspense></>;
}
