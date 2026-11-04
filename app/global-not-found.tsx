import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import "./globals.css";

// Unmatched URLs skip both root layouts, so this page carries its own document, in both languages.
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = { title: "Page not found · Página no encontrada | 110% Coatings", robots: { index: false } };

export default function GlobalNotFound() {
  return <html lang="en" className={inter.variable}>
    <body style={{ minHeight: "100vh", display: "grid", placeItems: "center", margin: 0, padding: 24, color: "#f1e9f4", background: "radial-gradient(ellipse at 30% 20%, #6a2f8c80, transparent 60%), radial-gradient(ellipse at 80% 90%, #ee3a9c40, transparent 55%), #070309", fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
      <main style={{ maxWidth: 560 }}>
        <p style={{ font: "11px ui-monospace, monospace", letterSpacing: ".16em", color: "#d5afcb" }}>110% COATINGS · 404</p>
        <h1 style={{ fontSize: "clamp(40px, 8vw, 64px)", fontWeight: 400, letterSpacing: "-.05em", lineHeight: 1.05, margin: "18px 0 0" }}>This floor isn’t here.</h1>
        <p lang="es" style={{ fontSize: "clamp(24px, 4vw, 32px)", letterSpacing: "-.03em", color: "#d5afcb", margin: "10px 0 0" }}>Esta página no existe.</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 36 }}>
          <Link href="/" style={{ padding: "13px 20px", borderRadius: 30, background: "#e7cde7", color: "#1b1220", fontSize: 14, fontWeight: 500 }}>Back to the home page</Link>
          <Link href="/es" lang="es" style={{ padding: "13px 20px", borderRadius: 30, border: "1px solid #ffffff4d", color: "#f1e9f4", fontSize: 14 }}>Volver al inicio</Link>
        </div>
      </main>
    </body>
  </html>;
}
