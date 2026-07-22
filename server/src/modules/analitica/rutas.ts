import type { FastifyInstance } from "fastify";
import { ErrorApi } from "../../lib/errores.js";
import { periodoActual } from "../../lib/dinero.js";
import {
  calcularResumenMensual,
  calcularGastoPorCategoria,
  calcularCashflow,
  calcularTopComercios,
  calcularMediaPorComercio,
  resolverVarianteInforme,
} from "./servicio.js";

export default async function rutasAnalitica(fastify: FastifyInstance) {
  fastify.get<{ Querystring: { period?: string } }>("/summary", { preHandler: fastify.authenticate }, async (request) => {
    return calcularResumenMensual(fastify.prisma, request.userId, request.query.period ?? periodoActual());
  });

  fastify.get<{ Querystring: { period?: string } }>("/analytics/by-category", { preHandler: fastify.authenticate }, async (request) => {
    return calcularGastoPorCategoria(fastify.prisma, request.userId, request.query.period ?? periodoActual());
  });

  fastify.get<{ Querystring: { range?: string } }>("/analytics/cashflow", { preHandler: fastify.authenticate }, async (request) => {
    const meses = request.query.range ? parseInt(request.query.range) : 6;
    return calcularCashflow(fastify.prisma, request.userId, meses);
  });

  fastify.get<{ Querystring: { period?: string; limit?: string } }>(
    "/analytics/top-merchants",
    { preHandler: fastify.authenticate },
    async (request) => {
      return calcularTopComercios(fastify.prisma, request.userId, request.query.period ?? periodoActual(), Number(request.query.limit ?? 5));
    },
  );

  fastify.get("/analytics/recurring-upcoming", { preHandler: fastify.authenticate }, async (request) => {
    return fastify.prisma.recurring.findMany({ where: { user_id: request.userId, active: true }, orderBy: { next_charge_date: "asc" } });
  });

  fastify.get<{ Params: { id: string } }>("/reports/transaction/:id", { preHandler: fastify.authenticate }, async (request) => {
    const tx = await fastify.prisma.transaction.findUnique({ where: { id: request.params.id }, include: { category: true, account: true } });
    if (!tx || tx.user_id !== request.userId) throw new ErrorApi(404, "Movimiento no encontrado");

    const variante = await resolverVarianteInforme(fastify.prisma, tx, request.userId);
    const media = await calcularMediaPorComercio(fastify.prisma, request.userId, tx.name);
    const presupuesto = tx.category_id
      ? await fastify.prisma.budget.findFirst({ where: { user_id: request.userId, category_id: tx.category_id } })
      : null;

    return { transaction: tx, variante, media, presupuesto };
  });
}
