// One timeline drives the materials, tools and captions. Times are illustrative,
// not a promise about application or cure duration.
export const INSTALL_DURATION_MS = 14000;
export const installLabels = (system: number) => system === 2
  ? ["Prepare & grind", "Refine the surface", "Polish the concrete", "Seal & reveal"]
  : ["Prepare & grind", "Prime & base coat", system === 1 ? "Broadcast the flakes" : "Flow the metallic pigment", "Seal & reveal"];

export function installPhase(progress: number) {
  return Math.min(3, Math.floor(Math.max(0, progress) * 4));
}

export function installClock(progress: number) {
  const minutes = Math.round(7 * 60 + progress * 10 * 60);
  return `${Math.floor(minutes / 60) % 12 || 12}:${String(minutes % 60).padStart(2, "0")} ${minutes < 720 ? "AM" : "PM"}`;
}

export function smoothProgress(value: number) {
  const t = Math.min(1, Math.max(0, value));
  return t * t * (3 - 2 * t);
}
