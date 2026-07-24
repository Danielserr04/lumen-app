/** Periodo mensual actual en formato "YYYY-MM", usado por §15 (resumen, analítica, presupuestos). */
export function periodoActual(fecha: Date = new Date()): string {
  return fecha.toISOString().slice(0, 7);
}
