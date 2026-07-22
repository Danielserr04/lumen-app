import type { PrismaClient } from "@prisma/client";
import { rangoDePeriodo, estadoDePercent } from "../../lib/dinero.js";

export interface PresupuestoDerivado {
  id: string;
  user_id: string;
  category_id: string;
  limit_amount: number;
  period: string;
  alert_threshold: number;
  start_date: Date;
  spent: number;
  available: number;
  percent: number;
  state: "ok" | "warning" | "over";
}

/** Añade spent/available/percent/state a cada Budget, calculados sobre el periodo — §11.2. */
export async function calcularPresupuestosDerivados(prisma: PrismaClient, userId: string, periodo: string): Promise<PresupuestoDerivado[]> {
  const { inicio, fin } = rangoDePeriodo(periodo);
  const presupuestos = await prisma.budget.findMany({ where: { user_id: userId } });

  return Promise.all(
    presupuestos.map(async (presupuesto) => {
      const agregado = await prisma.transaction.aggregate({
        where: {
          user_id: userId,
          category_id: presupuesto.category_id,
          amount: { lt: 0 },
          date: { gte: inicio, lt: fin },
          deleted_at: null,
        },
        _sum: { amount: true },
      });
      const spent = Math.abs(agregado._sum.amount ?? 0);
      const percent = presupuesto.limit_amount > 0 ? spent / presupuesto.limit_amount : 0;
      return {
        ...presupuesto,
        spent,
        available: presupuesto.limit_amount - spent,
        percent,
        state: estadoDePercent(percent, presupuesto.alert_threshold),
      };
    }),
  );
}
