/**
 * Tokens de diseño de Lumen, tipados para usarlos desde JS/TS (por ejemplo en SVG,
 * donde no se pueden usar variables CSS directamente en algunos atributos).
 * Deben coincidir exactamente con src/styles/tokens.css — §4 del handoff.
 */

export const color = {
  fondo: "#07080D",
  texto: "#EDEFF5",
  textoMuted: "#8B93A7",
  textoDim: "#5C6478",
  textoSoft: "#A9B0C0",

  primarioA: "#7C6CFF",
  primarioB: "#42D0F4",
  primarioLink: "#8F86FF",
  primarioLinkHover: "#B4ADFF",

  gasto: "#FF6B7A",
  gastoClaro: "#FF9AA5",
  ingreso: "#4ADEA8",
  aviso: "#FFC24B",
  avisoClaro: "#FFD98A",
} as const;

export const degradadoPrimario = "linear-gradient(135deg, #7C6CFF, #42D0F4)";
export const degradadoPrimarioBarra = "linear-gradient(90deg, #7C6CFF, #42D0F4)";

/** Identificador de categoría — usado como clave en `categorias` y en las entidades mock. */
export type IdCategoria =
  | "comida"
  | "transporte"
  | "ocio"
  | "suscripciones"
  | "salud"
  | "tabaco"
  | "otros";

export interface DefinicionCategoria {
  id: IdCategoria;
  nombre: string;
  /** Nombre de icono Phosphor (sin prefijo de peso). */
  icono: string;
  color: string;
  /** Componentes RGB para construir rgba(tint, alpha) en fondos/bordes tintados. */
  tint: string;
}

/** Las 6 categorías del sistema definidas en §4 del handoff, en el orden del prototipo. */
export const categorias: Record<IdCategoria, DefinicionCategoria> = {
  comida: { id: "comida", nombre: "Comida", icono: "fork-knife", color: "#FFA35C", tint: "255,163,92" },
  transporte: { id: "transporte", nombre: "Transporte", icono: "gas-pump", color: "#5CB3FF", tint: "92,179,255" },
  ocio: { id: "ocio", nombre: "Ocio", icono: "popcorn", color: "#B78CFF", tint: "183,140,255" },
  suscripciones: {
    id: "suscripciones",
    nombre: "Suscripciones",
    icono: "arrows-clockwise",
    color: "#FF7FC4",
    tint: "255,127,196",
  },
  salud: { id: "salud", nombre: "Salud", icono: "heartbeat", color: "#4FD9D0", tint: "79,217,208" },
  tabaco: { id: "tabaco", nombre: "Tabaco", icono: "cigarette", color: "#B08968", tint: "176,137,104" },
  otros: { id: "otros", nombre: "Otros", icono: "dots-three-circle", color: "#98A2B8", tint: "152,162,184" },
};

export const listaCategorias = Object.values(categorias);

/** Escala de espaciado (gap) del §4. */
export const espaciado = {
  sp1: 6,
  sp2: 8,
  sp3: 10,
  sp4: 14,
  sp5: 18,
  sp6: 24,
  sp7: 40,
  sp8: 64,
  sp9: 72,
} as const;

/** Radios "casi afilados" del §4. */
export const radio = {
  chip: 4,
  input: 10,
  tarjeta: 8,
  marcoMovil: 44,
  pill: 999,
} as const;

export const sombra = {
  tarjeta: "0 24px 60px rgba(0,0,0,0.4)",
  movil: "0 40px 90px rgba(0,0,0,0.6)",
  cta: "0 16px 36px rgba(124,108,255,0.35)",
} as const;
