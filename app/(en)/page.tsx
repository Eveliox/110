import { Suspense } from "react";
import { connection } from "next/server";
import { Home } from "@/components/Studio";
import { homeMetadata } from "@/lib/seo";

export const generateMetadata = ({ searchParams }: PageProps<"/">) => homeMetadata("en", searchParams);

// Marks the shared-link metadata as intentionally request-time; the page itself still prerenders.
async function Connection() { await connection(); return null; }

export default function HomePage() {
  return <><Home /><Suspense><Connection /></Suspense></>;
}
