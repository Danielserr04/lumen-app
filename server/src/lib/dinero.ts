/** Periodo mensual "YYYY-MM" de una fecha — mismo criterio que src/lib/periodo.ts del frontend. */
export function periodoDe(fecha: Date): string {
  return fecha.toISOString().slice(0, 7);
}

export function periodoActual(): string {
  return periodoDe(new Date());
}

/** Rango [inicio, fin) de un periodo "YYYY-MM" en UTC, para filtrar Transaction.date. */
export function rangoDePeriodo(periodo: string): { inicio: Date; fin: Date } {
  const [anio, mes] = periodo.split("-").map(Number);
  const inicio = new Date(Date.UTC(anio, mes - 1, 1));
  const fin = new Date(Date.UTC(anio, mes, 1));
  return { inicio, fin };
}

export function ordenEstadoPresupuesto(estado: "ok" | "warning" | "over" | null): number {
  return estado === "over" ? 2 : estado === "warning" ? 1 : 0;
}

export function estadoDePercent(percent: number, umbral: number): "ok" | "warning" | "over" {
  return percent >= 1 ? "over" : percent >= umbral ? "warning" : "ok";
}
