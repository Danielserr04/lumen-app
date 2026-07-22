import type { PrismaClient, Transaction } from "@prisma/client";
import { rangoDePeriodo, estadoDePercent } from "../../lib/dinero.js";
import { calcularPresupuestosDerivados } from "../presupuestos/servicio.js";

export async function calcularResumenMensual(prisma: PrismaClient, userId: string, periodo: string) {
  const { inicio, fin } = rangoDePeriodo(periodo);
  const txs = await prisma.transaction.findMany({
    where: { user_id: userId, date: { gte: inicio, lt: fin }, deleted_at: null, transfer_id: null },
  });
  const ingresos = txs.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const gastos = Math.abs(txs.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0));
  const presupuestos = await prisma.budget.findMany({ where: { user_id: userId } });
  const presupuestoTotal = presupuestos.reduce((s, b) => s + b.limit_amount, 0);
  const disponible = presupuestoTotal - gastos;
  const porcentajeGastado = presupuestoTotal > 0 ? gastos / presupuestoTotal : 0;
  const estado = estadoDePercent(porcentajeGastado, 0.8);
  return { periodo, ingresos, gastos, presupuestoTotal, disponible, porcentajeGastado, estado };
}

export async function calcularGastoPorCategoria(prisma: PrismaClient, userId: string, periodo: string) {
  const { inicio, fin } = rangoDePeriodo(periodo);
  const txs = await prisma.transaction.findMany({
    where: { user_id: userId, date: { gte: inicio, lt: fin }, amount: { lt: 0 }, category_id: { not: null }, deleted_at: null },
    include: { category: true },
  });
  const totalGeneral = Math.abs(txs.reduce((s, t) => s + t.amount, 0));
  const porCategoria = new Map<string, { categoria: NonNullable<Transaction["category_id"]>; total: number; nombre: string; color: string }>();
  for (const tx of txs) {
    if (!tx.category) continue;
    const actual = porCategoria.get(tx.category.id) ?? { categoria: tx.category.id, total: 0, nombre: tx.category.name, color: tx.category.color };
    actual.total += Math.abs(tx.amount);
    porCategoria.set(tx.category.id, actual);
  }
  return Array.from(porCategoria.values())
    .map((c) => ({ category_id: c.categoria, name: c.nombre, color: c.color, total: c.total, porcentaje: totalGeneral > 0 ? c.total / totalGeneral : 0 }))
    .sort((a, b) => b.total - a.total);
}

export async function calcularCashflow(prisma: PrismaClient, userId: string, meses: number) {
  const ahora = new Date();
  const resultado = [];
  for (let i = meses - 1; i >= 0; i--) {
    const fecha = new Date(Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth() - i, 1));
    const periodo = fecha.toISOString().slice(0, 7);
    const resumen = await calcularResumenMensual(prisma, userId, periodo);
    resultado.push({ periodo, etiqueta: fecha.toLocaleDateString("es-ES", { month: "short", timeZone: "UTC" }), ingresos: resumen.ingresos, gastos: resumen.gastos });
  }
  return resultado;
}

export async function calcularTopComercios(prisma: PrismaClient, userId: string, periodo: string, limite: number) {
  const { inicio, fin } = rangoDePeriodo(periodo);
  const txs = await prisma.transaction.findMany({ where: { user_id: userId, date: { gte: inicio, lt: fin }, amount: { lt: 0 }, deleted_at: null } });
  const porComercio = new Map<string, { nombre: string; total: number; veces: number }>();
  for (const tx of txs) {
    const actual = porComercio.get(tx.name) ?? { nombre: tx.name, total: 0, veces: 0 };
    actual.total += Math.abs(tx.amount);
    actual.veces += 1;
    porComercio.set(tx.name, actual);
  }
  return Array.from(porComercio.values()).sort((a, b) => b.total - a.total).slice(0, limite);
}

export async function calcularMediaPorComercio(prisma: PrismaClient, userId: string, nombreComercio: string) {
  const txs = await prisma.transaction.findMany({ where: { user_id: userId, name: nombreComercio, amount: { lt: 0 }, deleted_at: null } });
  if (txs.length === 0) return { mediaPorMes: 0, visitasPorMes: 0, ticketMedio: 0 };
  const meses = new Set(txs.map((t) => t.date.toISOString().slice(0, 7))).size || 1;
  const total = Math.abs(txs.reduce((s, t) => s + t.amount, 0));
  return { mediaPorMes: Math.round(total / meses), visitasPorMes: Math.round(txs.length / meses), ticketMedio: Math.round(total / txs.length) };
}

export type VarianteInforme = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K";

/** Puerto directo de resolverVarianteInforme en src/lib/derivar.ts del frontend. */
export async function resolverVarianteInforme(prisma: PrismaClient, tx: Transaction, userId: string): Promise<VarianteInforme> {
  if (tx.transfer_id) return "E";
  if (tx.refund_of) return "G";
  if (tx.status === "pending") return "D";
  if (!tx.category_id) return "H";
  if (tx.installment_total) return "K";
  if (tx.amount_original && tx.currency_original && tx.currency_original !== tx.currency) return "I";
  const cuenta = await prisma.account.findUnique({ where: { id: tx.account_id } });
  if (cuenta?.type === "cash") return "J";
  if (tx.amount > 0) return "B";
  if (tx.is_recurring) return "C";
  const presupuestos = await calcularPresupuestosDerivados(prisma, userId, tx.date.toISOString().slice(0, 7));
  const presupuestoCategoria = presupuestos.find((b) => b.category_id === tx.category_id);
  if (presupuestoCategoria && presupuestoCategoria.state === "over") return "F";
  return "A";
}
