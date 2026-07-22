import type { FastifyInstance } from "fastify";
import type { Prisma } from "@prisma/client";
import { ErrorApi } from "../../lib/errores.js";
import { recalcularYAlertar, estadoPresupuestoDeCategoria } from "./servicio.js";

interface CrearMovimiento {
  account_id: string;
  category_id?: string | null;
  amount: number;
  name: string;
  date?: string;
  method?: string | null;
  note?: string | null;
  status?: "cleared" | "pending";
}

interface FiltrosMovimientos {
  from?: string;
  to?: string;
  category_id?: string;
  account_id?: string;
  type?: "expense" | "income";
  status?: "cleared" | "pending";
  q?: string;
  is_recurring?: string;
  cursor?: string;
  take?: string;
}

export default async function rutasMovimientos(fastify: FastifyInstance) {
  fastify.get<{ Querystring: FiltrosMovimientos }>("/transactions", { preHandler: fastify.authenticate }, async (request) => {
    const f = request.query;
    const where: Prisma.TransactionWhereInput = { user_id: request.userId, deleted_at: null };
    if (f.from || f.to) where.date = { ...(f.from ? { gte: new Date(f.from) } : {}), ...(f.to ? { lte: new Date(f.to) } : {}) };
    if (f.category_id) where.category_id = f.category_id;
    if (f.account_id) where.account_id = f.account_id;
    if (f.type === "expense") where.amount = { lt: 0 };
    if (f.type === "income") where.amount = { gt: 0 };
    if (f.status) where.status = f.status;
    if (f.is_recurring !== undefined) where.is_recurring = f.is_recurring === "true";
    if (f.q) where.OR = [{ name: { contains: f.q, mode: "insensitive" } }, { note: { contains: f.q, mode: "insensitive" } }];

    const take = f.take ? Number(f.take) : 50;
    return fastify.prisma.transaction.findMany({
      where,
      orderBy: { date: "desc" },
      take,
      ...(f.cursor ? { cursor: { id: f.cursor }, skip: 1 } : {}),
    });
  });

  fastify.get<{ Params: { id: string } }>("/transactions/:id", { preHandler: fastify.authenticate }, async (request) => {
    const tx = await fastify.prisma.transaction.findUnique({ where: { id: request.params.id } });
    if (!tx || tx.user_id !== request.userId) throw new ErrorApi(404, "Movimiento no encontrado");
    return tx;
  });

  fastify.post<{ Body: CrearMovimiento }>("/transactions", { preHandler: fastify.authenticate }, async (request) => {
    const { account_id, category_id, amount, name, date, method, note, status } = request.body;
    if (!account_id || !name) throw new ErrorApi(400, "Cuenta y nombre son obligatorios");
    if (!amount) throw new ErrorApi(400, "El importe no puede ser 0 €");

    const fecha = date ? new Date(date) : new Date();
    const estadoAntes = await estadoPresupuestoDeCategoria(fastify.prisma, request.userId, category_id ?? null, fecha);

    const tx = await fastify.prisma.transaction.create({
      data: {
        user_id: request.userId,
        account_id,
        category_id: category_id ?? null,
        amount,
        name,
        date: fecha,
        method: method ?? null,
        note: note ?? null,
        status: status ?? "cleared",
      },
    });

    if (amount < 0) await recalcularYAlertar(fastify.prisma, request.userId, category_id ?? null, fecha, estadoAntes);
    return tx;
  });

  fastify.patch<{ Params: { id: string }; Body: Partial<CrearMovimiento> }>(
    "/transactions/:id",
    { preHandler: fastify.authenticate },
    async (request) => {
      const original = await fastify.prisma.transaction.findUnique({ where: { id: request.params.id } });
      if (!original || original.user_id !== request.userId) throw new ErrorApi(404, "Movimiento no encontrado");
      if (request.body.amount === 0) throw new ErrorApi(400, "El importe no puede ser 0 €");

      const estadoAntesOriginal = await estadoPresupuestoDeCategoria(fastify.prisma, request.userId, original.category_id, original.date);

      const { date, ...resto } = request.body;
      const actualizado = await fastify.prisma.transaction.update({
        where: { id: original.id },
        data: { ...resto, ...(date ? { date: new Date(date) } : {}) },
      });

      // Recalcula la categoría de antes (por si se quitó/cambió) y la de después.
      if (original.category_id && original.category_id !== actualizado.category_id) {
        await recalcularYAlertar(fastify.prisma, request.userId, original.category_id, original.date, estadoAntesOriginal);
      }
      if (actualizado.amount < 0) {
        const estadoAntesNueva = original.category_id === actualizado.category_id ? estadoAntesOriginal : null;
        await recalcularYAlertar(fastify.prisma, request.userId, actualizado.category_id, actualizado.date, estadoAntesNueva);
      }
      return actualizado;
    },
  );

  fastify.delete<{ Params: { id: string } }>("/transactions/:id", { preHandler: fastify.authenticate }, async (request) => {
    const tx = await fastify.prisma.transaction.findUnique({ where: { id: request.params.id } });
    if (!tx || tx.user_id !== request.userId) throw new ErrorApi(404, "Movimiento no encontrado");
    await fastify.prisma.transaction.update({ where: { id: tx.id }, data: { deleted_at: new Date() } });
    return { ok: true };
  });

  fastify.post<{ Params: { id: string } }>("/transactions/:id/duplicate", { preHandler: fastify.authenticate }, async (request) => {
    const original = await fastify.prisma.transaction.findUnique({ where: { id: request.params.id } });
    if (!original || original.user_id !== request.userId) throw new ErrorApi(404, "Movimiento no encontrado");
    const { id, created_at, ...datos } = original;
    return fastify.prisma.transaction.create({ data: { ...datos, date: new Date() } });
  });
}
