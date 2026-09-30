/** Width of a proportional bar as a CSS percentage. */
export const pct = (value: number, max: number) => `${max === 0 ? 0 : Math.round((value / max) * 100)}%`;

/**
 * Whole-number percentages of a total that always add up to 100
 * (the last segment absorbs the rounding).
 */
export function splitPercent(values: number[]): number[] {
  const total = values.reduce((a, b) => a + b, 0);
  if (total === 0) return values.map(() => 0);
  const rounded = values.slice(0, -1).map((v) => Math.round((v / total) * 100));
  return [...rounded, 100 - rounded.reduce((a, b) => a + b, 0)];
}
