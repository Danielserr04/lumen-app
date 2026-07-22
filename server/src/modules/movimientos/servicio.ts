import type { PrismaClient } from "@prisma/client";
import { periodoDe, ordenEstadoPresupuesto } from "../../lib/dinero.js";
import { calcularPresupuestosDerivados } from "../presupuestos/servicio.js";
import { registrarNotificacion } from "../notificaciones/servicio.js";

/**
 * Recalcula el presupuesto de una categoría tras crear/editar/borrar un movimiento y
 * dispara una alerta budget_alert SOLO si el estado empeora respecto al de antes — mismo
 * criterio que dispararAlertaPresupuestoSiEmpeora en src/mocks/api.ts del frontend.
 */
export async function recalcularYAlertar(
  prisma: PrismaClient,
  userId: string,
  categoryId: string | null,
  fecha: Date,
  estadoAntes: "ok" | "warning" | "over" | null,
) {
  if (!categoryId) return;
  const periodo = periodoDe(fecha);
  const derivados = await calcularPresupuestosDerivados(prisma, userId, periodo);
  const derivado = derivados.find((b) => b.category_id === categoryId);
  if (!derivado) return;
  if (ordenEstadoPresupuesto(derivado.state) <= ordenEstadoPresupuesto(estadoAntes)) return;

  const categoria = await prisma.category.findUnique({ where: { id: categoryId } });
  const nombre = categoria?.name ?? "una categoría";

  if (derivado.state === "over") {
    await registrarNotificacion(prisma, {
      user_id: userId,
      type: "budget_alert",
      severity: "error",
      title: `Has superado tu presupuesto de ${nombre}`,
      body: `Llevas ${(derivado.spent / 100).toFixed(2)} € de ${(derivado.limit_amount / 100).toFixed(2)} € en ${nombre} este mes.`,
      action_type: "ver_presupuesto",
      action_target_id: categoryId,
    });
  } else if (derivado.state === "warning") {
    await registrarNotificacion(prisma, {
      user_id: userId,
      type: "budget_alert",
      severity: "warning",
      title: `Cerca del límite en ${nombre}`,
      body: `Vas por el ${Math.round(derivado.percent * 100)}% de tu presupuesto de ${nombre} este mes.`,
      action_type: "ver_movimientos_categoria",
      action_target_id: categoryId,
    });
  }
}

/** Estado actual del presupuesto de una categoría (o null si no tiene), para el "antes" del recálculo. */
export async function estadoPresupuestoDeCategoria(
  prisma: PrismaClient,
  userId: string,
  categoryId: string | null,
  fecha: Date,
): Promise<"ok" | "warning" | "over" | null> {
  if (!categoryId) return null;
  const derivados = await calcularPresupuestosDerivados(prisma, userId, periodoDe(fecha));
  return derivados.find((b) => b.category_id === categoryId)?.state ?? null;
}
