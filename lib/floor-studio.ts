export type FloorSystem = "metallic" | "flake" | "concrete";
export type FloorSelection = { system: FloorSystem; finish: string; color: string; sheen: string; room: string };
export const floorSystems = [
  { id: "metallic", name: "Metallic epoxy", description: "Flowing movement with a dimensional finish.", colors: [
    { name: "Silver smoke", base: "#454b55", accent: "#c1c6cc" },
    { name: "Champagne", base: "#766853", accent: "#e5d2aa" },
    { name: "Midnight blue", base: "#142b43", accent: "#879fb5" },
    { name: "Pearl", base: "#a9a9ae", accent: "#f2f0e8" },
  ] },
  { id: "flake", name: "Epoxy flake", description: "A textured blend of small decorative chips.", colors: [
    { name: "Salt & pepper", base: "#8c9195", accent: "#f2f0e9" },
    { name: "Sandstone", base: "#a28e76", accent: "#efe4cf" },
    { name: "Graphite", base: "#41454c", accent: "#a1a7ae" },
    { name: "Glacier", base: "#8095a5", accent: "#e3eaf0" },
  ] },
  { id: "concrete", name: "Polished concrete", description: "Natural-looking variation with a quieter character.", colors: [
    { name: "Natural gray", base: "#8a8c89", accent: "#b9bab6" },
    { name: "Warm stone", base: "#a49886", accent: "#c8beae" },
    { name: "Charcoal", base: "#4e5154", accent: "#808387" },
    { name: "Limestone", base: "#bbb7ab", accent: "#e0dccf" },
  ] },
] as const;
export const roomNames = ["Living space", "Garage", "Showroom", "Basement", "Patio"] as const;
export const sheenNames = ["Matte", "Satin", "Gloss"] as const;
export const lightingStops = [
  { label: "Overcast", bg: "#1b1e24", directional: "#c7d5e3", directionalIntensity: 0.9, ambient: "#9fb0c4", ambientIntensity: 0.75, hemi: "#dbe3ed", wallTint: "#d8d9db", keyLight: "#eef2f8", keyIntensity: 1.6 },
  { label: "Noon", bg: "#191620", directional: "#fff5e8", directionalIntensity: 1.9, ambient: "#f3ecd9", ambientIntensity: 0.55, hemi: "#eaf1f8", wallTint: "#e7e6e4", keyLight: "#ffffff", keyIntensity: 2.6 },
  { label: "Sunset", bg: "#1d1620", directional: "#ffb878", directionalIntensity: 1.4, ambient: "#f8c9a0", ambientIntensity: 0.6, hemi: "#ffd7a3", wallTint: "#e9d6bd", keyLight: "#ffd3a0", keyIntensity: 2.3 },
  { label: "Night", bg: "#0d0b11", directional: "#5b4a6c", directionalIntensity: 0.35, ambient: "#3f3752", ambientIntensity: 0.4, hemi: "#2a2432", wallTint: "#2f2b35", keyLight: "#fff2d4", keyIntensity: 1.6 },
] as const;
export type LightingColor = { r: number; g: number; b: number };
const hexToRgb = (hex: string): LightingColor => ({ r: parseInt(hex.slice(1, 3), 16) / 255, g: parseInt(hex.slice(3, 5), 16) / 255, b: parseInt(hex.slice(5, 7), 16) / 255 });
const rgbToHex = (c: LightingColor): string => `#${[c.r, c.g, c.b].map(v => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, "0")).join("")}`;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpColor = (a: LightingColor, b: LightingColor, t: number): LightingColor => ({ r: lerp(a.r, b.r, t), g: lerp(a.g, b.g, t), b: lerp(a.b, b.b, t) });
export type ResolvedLighting = { bg: string; directional: string; directionalIntensity: number; ambient: string; ambientIntensity: number; hemi: string; wallTint: string; keyLight: string; keyIntensity: number; stopLabel: string };
export function resolveLighting(daylight: number): ResolvedLighting {
  const clamped = Math.min(1, Math.max(0, daylight));
  const scaled = clamped * (lightingStops.length - 1);
  const lo = Math.floor(scaled);
  const hi = Math.min(lightingStops.length - 1, lo + 1);
  const t = scaled - lo;
  const a = lightingStops[lo];
  const b = lightingStops[hi];
  const mix = (keyA: string, keyB: string) => rgbToHex(lerpColor(hexToRgb(keyA), hexToRgb(keyB), t));
  const mixNum = (keyA: number, keyB: number) => lerp(keyA, keyB, t);
  return {
    bg: mix(a.bg, b.bg),
    directional: mix(a.directional, b.directional),
    directionalIntensity: mixNum(a.directionalIntensity, b.directionalIntensity),
    ambient: mix(a.ambient, b.ambient),
    ambientIntensity: mixNum(a.ambientIntensity, b.ambientIntensity),
    hemi: mix(a.hemi, b.hemi),
    wallTint: mix(a.wallTint, b.wallTint),
    keyLight: mix(a.keyLight, b.keyLight),
    keyIntensity: mixNum(a.keyIntensity, b.keyIntensity),
    stopLabel: t < 0.5 ? a.label : b.label,
  };
}
export function colorVector(hex: string): [number, number, number] {
  return [parseInt(hex.slice(1,3),16)/255, parseInt(hex.slice(3,5),16)/255, parseInt(hex.slice(5,7),16)/255];
}
export function selectionDescription(selection: FloorSelection) {
  return `${selection.finish} / ${selection.color} / ${selection.sheen} / ${selection.room}`;
}
export function isFloorSelection(value: unknown): value is FloorSelection {
  if (!value || typeof value !== "object") return false;
  const v = value as FloorSelection;
  const system = floorSystems.find(s => s.id === v.system && s.name === v.finish);
  return !!system && system.colors.some(c => c.name === v.color) && sheenNames.some(s => s === v.sheen) && roomNames.some(r => r === v.room);
}
