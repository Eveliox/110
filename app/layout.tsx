import type { Metadata } from "next";
import { Inter, Archivo } from "next/font/google";
import "./globals.css";
import "./luxury.css";
import "./flow.css";
import "./floor-studio.css";
import "./pour.css";
import "./materials.css";
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin"], style: ["normal", "italic"], axes: ["wdth"], display: "swap" });
// Absolute base for social preview images. Set NEXT_PUBLIC_SITE_URL to the live domain.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");
export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: "110% Coatings | A better floor starts here",
    description: "Explore epoxy flake, metallic epoxy and concrete finishes for residential and commercial spaces. See the work. Plan your floor.",
    icons: { icon: "/icon.svg" },
    openGraph: { title: "110% Coatings", description: "A better floor starts here.", images: [{ url: "/gallery/epoxy-flake-1.jpg" }] },
};
export default function RootLayout({ children }: {
    children: React.ReactNode;
}) {
    return <html lang="en" className={`${inter.variable} ${archivo.variable}`}><body><a href="#main" className="skip-link">Skip to content</a>{children}</body></html>;
}
