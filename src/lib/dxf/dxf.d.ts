declare module 'dxf' {
  export function parseString(content: string): unknown;
  export function denormalise(parsed: unknown): unknown[];
  export function entityToPolyline(entity: unknown): [number, number][];
  export function toSVG(parsed: unknown): string;
}
