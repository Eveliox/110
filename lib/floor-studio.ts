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
export const roomNames = ["Living space", "Garage", "Showroom"] as const;
export const sheenNames = ["Matte", "Satin", "Gloss"] as const;
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
