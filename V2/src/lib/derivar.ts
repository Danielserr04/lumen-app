/**
 * Formas de los valores derivados (§8 "no se almacenan" + §15 endpoints de analítica).
 *
 * Este módulo llegó a calcularlos aquí, en el navegador, sobre los datos mock. Ya no: los
 * calcula el backend (AnaliticaService), así que solo quedan los tipos que describen lo que
 * devuelve cada endpoint de `apiAnalitica`. Ojo al mantenerlos, porque van en español y en
 * camelCase: el backend los serializa así a propósito (ver el @JsonNaming de AnaliticaService
 * y el ContratoJsonTest que lo blinda), mientras que las entidades del §8 van en snake_case.
 */
import type { Category } from "@/types/entidades";

/** §15 GET /summary?period=YYYY-MM */
export interface ResumenMensual {
  periodo: string;
  ingresos: number;
  gastos: number;
  presupuestoTotal: number;
  disponible: number;
  porcentajeGastado: number;
  estado: "ok" | "warning" | "over";
}

/** §15 GET /analytics/by-category — para el donut de Análisis/Dashboard. */
export interface GastoPorCategoria {
  categoria: Category;
  total: number;
  porcentaje: number;
}

/** §15 GET /analytics/top-merchants — sección "Dónde gastas más" de Análisis. */
export interface ComercioFrecuente {
  nombre: string;
  total: number;
  veces: number;
}

/**
 * §15 GET /analytics/insights. Cada uno lleva icono y color propios para pintarse como
 * tarjeta de aviso (§4 "04 · Tarjeta de aviso"), no como texto plano.
 */
export interface InsightAnalisis {
  titulo: string;
  cuerpo: string;
  icono: string;
  color: string;
}

/**
 * Identificador de la variante A–K del informe de movimiento (§5.4), derivado de los campos
 * de la transacción — no se hardcodean 11 pantallas, sino una plantilla más esta lógica, que
 * hoy resuelve el backend en AnaliticaService.resolverVariante.
 */
export type VarianteInforme = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K";
