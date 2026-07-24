/**
 * Serie histórica mensual (Feb–Jul) usada por el gráfico "Balance entre meses" del
 * Dashboard y por la pestaña Análisis. Los últimos meses no tienen transacciones
 * individuales en el mock (solo julio las tiene, §7), así que este histórico se
 * modela como agregados directos — es lo mismo que devolvería `/analytics/cashflow`.
 * Importes en céntimos enteros.
 */
export interface PuntoHistorico {
  mes: string; // "2026-02"
  etiqueta: string; // "Feb"
  ingresos: number;
  gastos: number;
  balanceDisponible: number;
}

export const historicoMensual: PuntoHistorico[] = [
  { mes: "2026-02", etiqueta: "Feb", ingresos: 185000, gastos: 129000, balanceDisponible: 108800 },
  { mes: "2026-03", etiqueta: "Mar", ingresos: 185000, gastos: 173800, balanceDisponible: 96200 },
  { mes: "2026-04", etiqueta: "Abr", ingresos: 185000, gastos: 129500, balanceDisponible: 121400 },
  { mes: "2026-05", etiqueta: "May", ingresos: 210000, gastos: 197400, balanceDisponible: 89600 },
  { mes: "2026-06", etiqueta: "Jun", ingresos: 185000, gastos: 112700, balanceDisponible: 148300 },
  { mes: "2026-07", etiqueta: "Jul", ingresos: 187500, gastos: 71550, balanceDisponible: 128450 },
];
