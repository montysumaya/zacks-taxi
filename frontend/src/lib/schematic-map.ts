import type { GeoPoint } from "@/types";

/**
 * Schematic map of Lebanon for previews without a map provider. Simplified,
 * approximate outline and an equirectangular projection — illustrative only.
 */
export const SCHEMATIC = { width: 300, height: 320 } as const;
const BOUNDS = { minLat: 33.0, maxLat: 34.75, minLng: 35.05, maxLng: 36.7 };

const OUTLINE: Array<[number, number]> = [
  [33.09, 35.11], [33.27, 35.19], [33.56, 35.37], [33.73, 35.45], [33.9, 35.47], [33.98, 35.61],
  [34.12, 35.64], [34.25, 35.65], [34.33, 35.72], [34.45, 35.81], [34.63, 35.97], [34.69, 36.12],
  [34.63, 36.36], [34.53, 36.6], [34.4, 36.58], [34.2, 36.44], [33.95, 36.28], [33.83, 36.15],
  [33.68, 36.02], [33.5, 35.93], [33.3, 35.82], [33.27, 35.62], [33.1, 35.5],
];

export function project({ lat, lng }: GeoPoint) {
  const x = ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * SCHEMATIC.width;
  const y = SCHEMATIC.height - ((lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * SCHEMATIC.height;
  return { x, y };
}

export const outlinePoints = OUTLINE.map(([lat, lng]) => {
  const p = project({ lat, lng });
  return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
}).join(" ");
