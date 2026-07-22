import type { FastifyInstance } from "fastify";
import { ErrorApi } from "../../lib/errores.js";

interface CrearRecurrente {
  name: string;
  amount: number;
  category_id: string;
  account_id: string;
  frequency: "monthly" | "weekly" | "yearly";
  start_date: string;
  next_charge_date?: string;
}

function calcularProximoCargo(inicio: Date, frecuencia: string): Date {
  const fecha = new Date(inicio);
  if (frecuencia === "weekly") fecha.setDate(fecha.getDate() + 7);
  else if (frecuencia === "yearly") fecha.setFullYear(fecha.getFullYear() + 1);
  else fecha.setMonth(fecha.getMonth() + 1);
  return fecha;
}

export default async function rutasRecurrentes(fastify: FastifyInstance) {
  fastify.get("/recurrings", { preHandler: fastify.authenticate }, async (request) => {
    return fastify.prisma.recurring.findMany({ where: { user_id: request.userId }, orderBy: { next_charge_date: "asc" } });
  });

  fastify.post<{ Body: CrearRecurrente }>("/recurrings", { preHandler: fastify.authenticate }, async (request) => {
    const { name, amount, category_id, account_id, frequency, start_date, next_charge_date } = request.body;
    if (!name || !amount || !category_id || !account_id || !frequency || !start_date) {
      throw new ErrorApi(400, "Nombre, importe, categoría, cuenta, frecuencia y fecha de inicio son obligatorios");
    }
    const inicio = new Date(start_date);
    return fastify.prisma.recurring.create({
      data: {
        user_id: request.userId,
        name,
        amount,
        category_id,
        account_id,
        frequency,
        start_date: inicio,
        next_charge_date: next_charge_date ? new Date(next_charge_date) : calcularProximoCargo(inicio, frequency),
      },
    });
  });

  fastify.patch<{ Params: { id: string }; Body: Partial<CrearRecurrente> }>(
    "/recurrings/:id",
    { preHandler: fastify.authenticate },
    async (request) => {
      const recurrente = await fastify.prisma.recurring.findUnique({ where: { id: request.params.id } });
      if (!recurrente || recurrente.user_id !== request.userId) throw new ErrorApi(404, "Recurrente no encontrado");
      const { start_date, next_charge_date, ...resto } = request.body;
      return fastify.prisma.recurring.update({
        where: { id: recurrente.id },
        data: {
          ...resto,
          ...(start_date ? { start_date: new Date(start_date) } : {}),
          ...(next_charge_date ? { next_charge_date: new Date(next_charge_date) } : {}),
        },
      });
    },
  );

  fastify.delete<{ Params: { id: string } }>("/recurrings/:id", { preHandler: fastify.authenticate }, async (request) => {
    const recurrente = await fastify.prisma.recurring.findUnique({ where: { id: request.params.id } });
    if (!recurrente || recurrente.user_id !== request.userId) throw new ErrorApi(404, "Recurrente no encontrado");
    await fastify.prisma.recurring.delete({ where: { id: recurrente.id } });
    return { ok: true };
  });

  fastify.post<{ Params: { id: string } }>("/recurrings/:id/pause", { preHandler: fastify.authenticate }, async (request) => {
    const recurrente = await fastify.prisma.recurring.findUnique({ where: { id: request.params.id } });
    if (!recurrente || recurrente.user_id !== request.userId) throw new ErrorApi(404, "Recurrente no encontrado");
    return fastify.prisma.recurring.update({ where: { id: recurrente.id }, data: { active: !recurrente.active } });
  });
}

export { calcularProximoCargo };
