// Colours for the poured-resin atmosphere behind every page. The brand pour is magenta/violet
// metallic; once a visitor picks a finish in the Floor Studio the whole site takes on that finish.
export type Palette = { deep: string; base: string; accent: string; glow: string };
export type Tones = { soft: string; em: string; glow: string };

export const brandPalette: Palette = { deep: "#070309", base: "#6a2f8c", accent: "#ee3a9c", glow: "#ffaee0" };
export const brandTones: Tones = { soft: "#d5afcb", em: "#c4adc9", glow: "#e7cde7" };

export const hexToRgb = (hex: string): [number, number, number] => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255) as [number, number, number];
const toHex = (rgb: number[]) => `#${rgb.map(v => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, "0")).join("")}`;
export const mixHex = (a: string, b: string, t: number) => {
  const x = hexToRgb(a), y = hexToRgb(b);
  return toHex(x.map((v, i) => v + (y[i] - v) * t));
};

export function finishPalette(base: string, accent: string): Palette {
  return { deep: mixHex(base, "#000000", .86), base: mixHex(base, "#000000", .15), accent: mixHex(base, accent, .7), glow: mixHex(accent, "#ffffff", .25) };
}

export function finishTones(base: string, accent: string): Tones {
  return { soft: mixHex(accent, "#ffffff", .2), em: mixHex(accent, base, .3), glow: mixHex(accent, "#ffffff", .4) };
}
