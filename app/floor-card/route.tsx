import { ImageResponse } from "next/og";
import { chipSvg, describeDesign, readSharedDesign } from "@/lib/floor-card";
import { finishPalette } from "@/lib/atmosphere";
import { copy } from "@/lib/copy";

// The link-preview image for a shared Floor Studio design: the chosen finish as a sample chip.
export async function GET(request: Request) {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const design = readSharedDesign(params) ?? { system: 0, color: 0, sheen: 2, room: 0 };
  const lang = params.lang === "es" ? "es" : "en";
  const c = copy[lang];
  const { blend, systemName, colorName, sheen, room } = describeDesign(design, lang);
  const palette = finishPalette(blend.base, blend.accent);
  const chip = `data:image/svg+xml;base64,${Buffer.from(chipSvg(design)).toString("base64")}`;

  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", padding: "0 80px", gap: 70, color: "#f4f1f5", backgroundColor: palette.deep, backgroundImage: `radial-gradient(circle at 18% 30%, ${palette.glow}55, transparent 55%), radial-gradient(circle at 90% 100%, ${palette.accent}55, transparent 60%)` }}>
      <div style={{ display: "flex", transform: "rotate(-4deg)", borderRadius: 10, boxShadow: "0 40px 60px rgba(0,0,0,.55), 0 4px 0 rgba(0,0,0,.6)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- rendered to PNG, not a page */}
        <img src={chip} width={440} height={440} alt="" style={{ borderRadius: 10 }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ fontSize: 20, letterSpacing: 5, opacity: .75 }}>{c.studio.exportTitle.replace(" / ", " · ")}</div>
        <div style={{ fontSize: 86, lineHeight: 1, letterSpacing: -3, marginTop: 34 }}>{colorName}</div>
        <div style={{ fontSize: 40, marginTop: 14, opacity: .85 }}>{`${systemName} · ${sheen}`}</div>
        <div style={{ fontSize: 26, marginTop: 40, opacity: .7 }}>{c.card.designedFor(room)}</div>
        <div style={{ display: "flex", marginTop: 46, fontSize: 24, padding: "14px 26px", border: "2px solid rgba(255,255,255,.5)", borderRadius: 40, alignSelf: "flex-start" }}>{c.card.see}</div>
      </div>
    </div>,
    { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=86400, immutable" } },
  );
}
