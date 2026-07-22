import type { FastifyInstance } from "fastify";
import { ErrorApi } from "../../lib/errores.js";
import { periodoActual } from "../../lib/dinero.js";
import { calcularPresupuestosDerivados } from "./servicio.js";

interface CrearPresupuesto {
  category_id: string;
  limit_amount: number;
  period?: string;
  alert_threshold?: number;
}

export default async function rutasPresupuestos(fastify: FastifyInstance) {
  fastify.get<{ Querystring: { period?: string } }>("/budgets", { preHandler: fastify.authenticate }, async (request) => {
    const periodo = request.query.period ?? periodoActual();
    return calcularPresupuestosDerivados(fastify.prisma, request.userId, periodo);
  });

  fastify.post<{ Body: CrearPresupuesto }>("/budgets", { preHandler: fastify.authenticate }, async (request) => {
    const { category_id, limit_amount, period, alert_threshold } = request.body;
    if (!category_id || !limit_amount) throw new ErrorApi(400, "Categoría e importe límite son obligatorios");
    const yaExiste = await fastify.prisma.budget.findFirst({ where: { user_id: request.userId, category_id, period: period ?? "monthly" } });
    if (yaExiste) throw new ErrorApi(409, "Ya existe un presupuesto activo para esta categoría");
    return fastify.prisma.budget.create({
      data: {
        user_id: request.userId,
        category_id,
        limit_amount,
        period: period ?? "monthly",
        alert_threshold: alert_threshold ?? 0.8,
        start_date: new Date(),
      },
    });
  });

  fastify.patch<{ Params: { id: string }; Body: Partial<CrearPresupuesto> }>(
    "/budgets/:id",
    { preHandler: fastify.authenticate },
    async (request) => {
      const presupuesto = await fastify.prisma.budget.findUnique({ where: { id: request.params.id } });
      if (!presupuesto || presupuesto.user_id !== request.userId) throw new ErrorApi(404, "Presupuesto no encontrado");
      return fastify.prisma.budget.update({ where: { id: presupuesto.id }, data: request.body });
    },
  );

  fastify.delete<{ Params: { id: string } }>("/budgets/:id", { preHandler: fastify.authenticate }, async (request) => {
    const presupuesto = await fastify.prisma.budget.findUnique({ where: { id: request.params.id } });
    if (!presupuesto || presupuesto.user_id !== request.userId) throw new ErrorApi(404, "Presupuesto no encontrado");
    await fastify.prisma.budget.delete({ where: { id: presupuesto.id } });
    return { ok: true };
  });
}
