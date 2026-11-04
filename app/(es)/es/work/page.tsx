import type { Metadata } from "next";
import { WorkPage } from "@/components/Studio";
import { copy } from "@/lib/copy";
import { alternates } from "@/lib/seo";

export const metadata: Metadata = { title: copy.es.meta.workTitle, description: copy.es.meta.workDescription, alternates: alternates("es", "/work") };
export default function Page() { return <WorkPage />; }
