import type { PrismaClient } from "@prisma/client";
import { calcularProximoCargo } from "../modules/recurrentes/rutas.js";
import { registrarNotificacion } from "../modules/notificaciones/servicio.js";

/**
 * Job de recurrentes (§11.3): por cada Recurring activo con next_charge_date <= hoy,
 * genera una Transaction (is_recurring=true), avanza next_charge_date y notifica `sync`.
 * Se ejecuta con un setInterval al arrancar el servidor — sin infraestructura de colas,
 * suficiente para un MVP personal con un único usuario tipo.
 */
export async function ejecutarJobRecurrentes(prisma: PrismaClient) {
  const ahora = new Date();
  const pendientes = await prisma.recurring.findMany({ where: { active: true, next_charge_date: { lte: ahora } } });

  for (const recurrente of pendientes) {
    const tx = await prisma.transaction.create({
      data: {
        user_id: recurrente.user_id,
        account_id: recurrente.account_id,
        category_id: recurrente.category_id,
        amount: recurrente.amount,
        name: recurrente.name,
        date: recurrente.next_charge_date,
        status: "cleared",
        is_recurring: true,
        recurring_id: recurrente.id,
        installment_current: recurrente.installment_current,
        installment_total: recurrente.installment_total,
      },
    });

    await prisma.recurring.update({
      where: { id: recurrente.id },
      data: { next_charge_date: calcularProximoCargo(recurrente.next_charge_date, recurrente.frequency) },
    });

    await registrarNotificacion(prisma, {
      user_id: recurrente.user_id,
      type: "sync",
      severity: "info",
      title: `${recurrente.name} se ha cobrado`,
      body: `Cargo recurrente de ${(Math.abs(recurrente.amount) / 100).toFixed(2)} € generado.`,
      related_transaction_id: tx.id,
      action_type: "ver_movimiento",
      action_target_id: tx.id,
    });
  }

  return pendientes.length;
}
