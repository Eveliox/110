import type { Metadata } from "next";
import { WorkPage } from "@/components/Studio";
import { copy } from "@/lib/copy";
import { alternates } from "@/lib/seo";

export const metadata: Metadata = { title: copy.en.meta.workTitle, description: copy.en.meta.workDescription, alternates: alternates("en", "/work") };
export default function Page() { return <WorkPage />; }
