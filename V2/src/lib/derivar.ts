/**
 * Valores derivados (§8 "no se almacenan" + §15 endpoints de analítica). Se calculan
 * aquí sobre los datos mock, igual que lo haría el backend real con una query/vista.
 */
import type { Transaction, Budget, BudgetDerivado, Account, Category } from "@/types/entidades";
import { movimientos } from "@/mocks/data/movimientos";
import { presupuestos } from "@/mocks/data/presupuestos";
import { categoriasSistema } from "@/mocks/data/categorias";
import { cuentas } from "@/mocks/data/cuentas";
import { formatearEuros } from "@/lib/formato";

export function mesDe(fechaIso: string): string {
  return fechaIso.slice(0, 7); // "2026-07"
}

/** Transacciones "reales" para cálculos de balance: excluye transferencias internas. */
function transaccionesDelMes(periodo: string): Transaction[] {
  return movimientos.filter((tx) => mesDe(tx.date) === periodo && !tx.transfer_id && !tx.deleted_at);
}

export interface ResumenMensual {
  periodo: string;
  ingresos: number;
  gastos: number;
  presupuestoTotal: number;
  disponible: number;
  porcentajeGastado: number;
  estado: "ok" | "warning" | "over";
}

/** §15 GET /summary?period=YYYY-MM */
export function calcularResumenMensual(periodo: string): ResumenMensual {
  const txs = transaccionesDelMes(periodo);
  const ingresos = txs.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const gastos = Math.abs(txs.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0));
  const presupuestoTotal = presupuestos.reduce((s, b) => s + b.limit_amount, 0);
  const disponible = presupuestoTotal - gastos;
  const porcentajeGastado = presupuestoTotal > 0 ? gastos / presupuestoTotal : 0;
  const estado: ResumenMensual["estado"] = porcentajeGastado >= 1 ? "over" : porcentajeGastado >= 0.8 ? "warning" : "ok";
  return { periodo, ingresos, gastos, presupuestoTotal, disponible, porcentajeGastado, estado };
}

/** §11.2 GET /budgets — añade spent/available/percent/state calculados sobre el periodo actual. */
export function calcularPresupuestosDerivados(periodo: string): BudgetDerivado[] {
  const txs = transaccionesDelMes(periodo);
  return presupuestos.map((presupuesto: Budget) => {
    const gastoCategoria = Math.abs(
      txs.filter((t) => t.category_id === presupuesto.category_id && t.amount < 0).reduce((s, t) => s + t.amount, 0),
    );
    const percent = presupuesto.limit_amount > 0 ? gastoCategoria / presupuesto.limit_amount : 0;
    const state: BudgetDerivado["state"] = percent >= 1 ? "over" : percent >= presupuesto.alert_threshold ? "warning" : "ok";
    return {
      ...presupuesto,
      spent: gastoCategoria,
      available: presupuesto.limit_amount - gastoCategoria,
      percent,
      state,
    };
  });
}

export interface GastoPorCategoria {
  categoria: Category;
  total: number;
  porcentaje: number;
}

/** §15 GET /analytics/by-category — para el donut de Análisis/Dashboard. */
export function calcularGastoPorCategoria(periodo: string): GastoPorCategoria[] {
  const txs = transaccionesDelMes(periodo).filter((t) => t.amount < 0 && t.category_id);
  const totalGeneral = Math.abs(txs.reduce((s, t) => s + t.amount, 0));
  const porCategoria = new Map<string, number>();
  for (const tx of txs) {
    porCategoria.set(tx.category_id!, (porCategoria.get(tx.category_id!) ?? 0) + Math.abs(tx.amount));
  }
  return categoriasSistema
    .filter((c) => c.kind === "expense" && porCategoria.has(c.id))
    .map((categoria) => {
      const total = porCategoria.get(categoria.id) ?? 0;
      return { categoria, total, porcentaje: totalGeneral > 0 ? total / totalGeneral : 0 };
    })
    .sort((a, b) => b.total - a.total);
}

/** Media histórica por comercio (usada en el informe de gasto normal — caso A). */
export function calcularMediaPorComercio(nombreComercio: string): { mediaPorMes: number; visitasPorMes: number; ticketMedio: number } {
  const txs = movimientos.filter((t) => t.name === nombreComercio && t.amount < 0);
  if (txs.length === 0) return { mediaPorMes: 0, visitasPorMes: 0, ticketMedio: 0 };
  const meses = new Set(txs.map((t) => mesDe(t.date))).size || 1;
  const total = Math.abs(txs.reduce((s, t) => s + t.amount, 0));
  return {
    mediaPorMes: Math.round(total / meses),
    visitasPorMes: Math.round(txs.length / meses),
    ticketMedio: Math.round(total / txs.length),
  };
}

export interface ComercioFrecuente {
  nombre: string;
  total: number;
  veces: number;
}

/** Top comercios por gasto en el periodo — para la sección "Dónde gastas más" de Análisis. */
export function calcularTopComercios(periodo: string, limite = 5): ComercioFrecuente[] {
  const txs = transaccionesDelMes(periodo).filter((t) => t.amount < 0);
  const porComercio = new Map<string, ComercioFrecuente>();
  for (const tx of txs) {
    const actual = porComercio.get(tx.name) ?? { nombre: tx.name, total: 0, veces: 0 };
    actual.total += Math.abs(tx.amount);
    actual.veces += 1;
    porComercio.set(tx.name, actual);
  }
  return Array.from(porComercio.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, limite);
}

export interface InsightAnalisis {
  titulo: string;
  cuerpo: string;
  icono: string;
  color: string;
}

/**
 * Insights automáticos de la pestaña Análisis: no son un dato del handoff, se generan
 * a partir del gasto por categoría, los presupuestos y el histórico — para que Análisis
 * cuente algo más que enseñar gráficos. Cada uno lleva icono/color propios para usarse
 * como tarjeta de aviso (§4 "04 · Tarjeta de aviso"), no como texto plano.
 */
export function generarInsightsAnalisis(periodo: string): InsightAnalisis[] {
  const insights: InsightAnalisis[] = [];
  const gastoPorCategoria = calcularGastoPorCategoria(periodo);
  const presupuestosDerivados = calcularPresupuestosDerivados(periodo);
  const topComercios = calcularTopComercios(periodo, 1);

  if (gastoPorCategoria[0]) {
    const top = gastoPorCategoria[0];
    insights.push({
      titulo: `${top.categoria.name} es tu categoría con más peso`,
      cuerpo: `Representa el ${Math.round(top.porcentaje * 100)}% de tu gasto total este mes.`,
      icono: "chart-pie-slice",
      color: top.categoria.color,
    });
  }

  const masAjustado = [...presupuestosDerivados].filter((b) => b.spent > 0).sort((a, b) => b.percent - a.percent)[0];
  if (masAjustado) {
    const cat = buscarCategoria(masAjustado.category_id);
    insights.push(
      masAjustado.state === "over"
        ? {
            titulo: `Has superado tu presupuesto de ${cat?.name ?? "una categoría"}`,
            cuerpo: `Llevas ${formatearEuros(masAjustado.spent)} de ${formatearEuros(masAjustado.limit_amount)} este mes.`,
            icono: "warning",
            color: "#FF6B7A",
          }
        : {
            titulo: `Tu presupuesto de ${cat?.name ?? "una categoría"} es el más ajustado`,
            cuerpo: `Llevas usado el ${Math.round(masAjustado.percent * 100)}% este mes.`,
            icono: "warning",
            color: "#FFC24B",
          },
    );
  }

  if (topComercios[0] && topComercios[0].veces > 1) {
    insights.push({
      titulo: `${topComercios[0].nombre} es tu comercio más frecuente`,
      cuerpo: `${topComercios[0].veces} visitas este mes · ${formatearEuros(topComercios[0].total)} en total.`,
      icono: "storefront",
      color: "#B78CFF",
    });
  }

  return insights;
}

export function buscarCuenta(id: string): Account | undefined {
  return cuentas.find((c) => c.id === id);
}

export function buscarCategoria(id: string | null): Category | undefined {
  if (!id) return undefined;
  return categoriasSistema.find((c) => c.id === id);
}

/**
 * Identificador de la variante A–K del informe de movimiento (§5.4), derivado de los
 * campos de la transacción — no se hardcodean 11 pantallas, una plantilla + esta lógica.
 */
export type VarianteInforme = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K";

export function resolverVarianteInforme(tx: Transaction, presupuestosDerivados: BudgetDerivado[]): VarianteInforme {
  if (tx.transfer_id) return "E";
  if (tx.refund_of) return "G";
  if (tx.status === "pending") return "D";
  if (!tx.category_id) return "H";
  if (tx.installment_total) return "K";
  if (tx.amount_original && tx.currency_original && tx.currency_original !== tx.currency) return "I";
  const cuenta = buscarCuenta(tx.account_id);
  if (cuenta?.type === "cash") return "J";
  if (tx.amount > 0) return "B";
  if (tx.is_recurring) return "C";
  const presupuestoCategoria = presupuestosDerivados.find((b) => b.category_id === tx.category_id);
  if (presupuestoCategoria && presupuestoCategoria.state === "over") return "F";
  return "A";
}
