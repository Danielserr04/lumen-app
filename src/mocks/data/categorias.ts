import type { Category } from "@/types/entidades";
import { categorias as defTokens } from "@/theme/tokens";

/** Las 7 categorías de sistema (§4 + Tabaco añadida a petición del usuario), `is_system: true` y `user_id: null`. */
export const categoriasSistema: Category[] = [
  { id: "cat-comida", user_id: null, name: defTokens.comida.nombre, icon: defTokens.comida.icono, color: defTokens.comida.color, tint: defTokens.comida.tint, kind: "expense", is_system: true, sort_order: 1 },
  { id: "cat-transporte", user_id: null, name: defTokens.transporte.nombre, icon: defTokens.transporte.icono, color: defTokens.transporte.color, tint: defTokens.transporte.tint, kind: "expense", is_system: true, sort_order: 2 },
  { id: "cat-ocio", user_id: null, name: defTokens.ocio.nombre, icon: defTokens.ocio.icono, color: defTokens.ocio.color, tint: defTokens.ocio.tint, kind: "expense", is_system: true, sort_order: 3 },
  { id: "cat-suscripciones", user_id: null, name: defTokens.suscripciones.nombre, icon: defTokens.suscripciones.icono, color: defTokens.suscripciones.color, tint: defTokens.suscripciones.tint, kind: "expense", is_system: true, sort_order: 4 },
  { id: "cat-salud", user_id: null, name: defTokens.salud.nombre, icon: defTokens.salud.icono, color: defTokens.salud.color, tint: defTokens.salud.tint, kind: "expense", is_system: true, sort_order: 5 },
  { id: "cat-tabaco", user_id: null, name: defTokens.tabaco.nombre, icon: defTokens.tabaco.icono, color: defTokens.tabaco.color, tint: defTokens.tabaco.tint, kind: "expense", is_system: true, sort_order: 6 },
  { id: "cat-otros", user_id: null, name: defTokens.otros.nombre, icon: defTokens.otros.icono, color: defTokens.otros.color, tint: defTokens.otros.tint, kind: "expense", is_system: true, sort_order: 7 },
  { id: "cat-ingreso", user_id: null, name: "Ingreso", icon: "hand-coins", color: "#4ADEA8", tint: "74,222,168", kind: "income", is_system: true, sort_order: 8 },
];
