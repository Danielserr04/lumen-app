import type { IdCategoria } from "@/theme/tokens";

/**
 * Traduce el id de categoría de `theme/tokens.ts` (usado por los chips de selección,
 * fijos y tipados) al id de la categoría de sistema en el mock (`cat-comida`, etc.).
 * Único punto de mantenimiento: si se añade una categoría nueva a `theme/tokens.ts` y
 * a `mocks/data/categorias.ts`, se registra aquí una sola vez.
 */
export const MAPA_ID_CATEGORIA_MOCK: Record<IdCategoria, string> = {
  comida: "cat-comida",
  transporte: "cat-transporte",
  ocio: "cat-ocio",
  suscripciones: "cat-suscripciones",
  salud: "cat-salud",
  tabaco: "cat-tabaco",
  otros: "cat-otros",
};
