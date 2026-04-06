export const MM_PER_INCH = 25.4;
export const MM_PER_FOOT = 304.8;

export const sqMmToSqIn = (mm2: number) => mm2 / (MM_PER_INCH ** 2);
export const sqMmToSqFt = (mm2: number) => mm2 / (MM_PER_FOOT ** 2);
export const mmToIn = (mm: number) => mm / MM_PER_INCH;
export const mmToFt = (mm: number) => mm / MM_PER_FOOT;

/**
 * Round a currency value to 2 decimal places without floating-point drift.
 * Adding Number.EPSILON before multiplying corrects cases like 1.005 → 1.01
 * that would otherwise floor to 1.00 due to binary representation.
 */
export function round2(x: number): number {
  return Math.round((x + Number.EPSILON) * 100) / 100;
}
