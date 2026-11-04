import type { FloorSystem } from "./floor-studio";

// Installed price per square foot (low, high) for each finish, before site-specific repairs.
// SAMPLE NUMBERS: replace them with your real ranges and set `confirmed: true`. Until then the
// estimator only appears in local development, never on the live site.
export const pricing = {
  confirmed: false,
  perSqFt: { metallic: [7, 12], flake: [4, 7], concrete: [3, 6] } as Record<FloorSystem, [number, number]>,
  minimumJob: 1500,
};

export const estimatorVisible = pricing.confirmed || process.env.NODE_ENV !== "production";

// A sensible starting area for each studio room (living, garage, showroom, basement, patio).
export const roomAreas = [400, 450, 1200, 600, 350];

const roundTo50 = (n: number) => Math.round(n / 50) * 50;
export function estimate(system: FloorSystem, area: number): [number, number] {
  const [low, high] = pricing.perSqFt[system];
  return [Math.max(pricing.minimumJob, roundTo50(low * area)), Math.max(pricing.minimumJob, roundTo50(high * area))];
}

// Matches the "Approximate size" options in the quote form.
export const sizeBucket = (area: number) => area < 500 ? "Under 500 sq ft" : area <= 1000 ? "500–1,000 sq ft" : area <= 2000 ? "1,000–2,000 sq ft" : "Over 2,000 sq ft";
