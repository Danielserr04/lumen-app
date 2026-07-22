/** Utilidades de color compartidas: conversión hex→rgb y aclarado para textos tintados. */

export function hexARgb(hex: string): string {
  const limpio = hex.replace("#", "");
  const bigint = parseInt(limpio, 16);
  return `${(bigint >> 16) & 255},${(bigint >> 8) & 255},${bigint & 255}`;
}

export function hexARgba(hex: string, alpha: number): string {
  return `rgba(${hexARgb(hex)},${alpha})`;
}

/** Mezcla un color hex con blanco (0–1) — usado para el título de las tarjetas de aviso (§4 "04 · Tarjeta de aviso"). */
export function aclararHex(hex: string, cantidad = 0.35): string {
  const limpio = hex.replace("#", "");
  const bigint = parseInt(limpio, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  const mezclar = (canal: number) => Math.round(canal + (255 - canal) * cantidad);
  return `#${[mezclar(r), mezclar(g), mezclar(b)].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}
