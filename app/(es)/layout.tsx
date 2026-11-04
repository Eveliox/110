import type { ReactNode } from "react";
import { RootDocument } from "../root-document";
import { rootMetadata } from "@/lib/seo";

// The Spanish site lives under /es with its own root layout, so the document itself is lang="es".
export const metadata = rootMetadata("es");

export default function RootLayout({ children }: { children: ReactNode }) {
  return <RootDocument lang="es">{children}</RootDocument>;
}
