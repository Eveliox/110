import type { ReactNode } from "react";
import { RootDocument } from "../root-document";
import { rootMetadata } from "@/lib/seo";

export const metadata = rootMetadata("en");

export default function RootLayout({ children }: { children: ReactNode }) {
  return <RootDocument lang="en">{children}</RootDocument>;
}
