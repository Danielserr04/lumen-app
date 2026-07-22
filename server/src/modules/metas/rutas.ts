import type { FastifyInstance } from "fastify";
import { ErrorApi } from "../../lib/errores.js";
import { registrarNotificacion } from "../notificaciones/servicio.js";

interface CrearMeta {
  name: string;
  target_amount: number;
  deadline?: string | null;
  color: string;
  icon: string;
}

export default async function rutasMetas(fastify: FastifyInstance) {
  fastify.get("/goals", { preHandler: fastify.authenticate }, async (request) => {
    return fastify.prisma.savingsGoal.findMany({ where: { user_id: request.userId }, orderBy: { created_at: "desc" } });
  });

  fastify.post<{ Body: CrearMeta }>("/goals", { preHandler: fastify.authenticate }, async (request) => {
    const { name, target_amount, deadline, color, icon } = request.body;
    if (!name || !target_amount || !color || !icon) throw new ErrorApi(400, "Nombre, importe objetivo, color e icono son obligatorios");
    return fastify.prisma.savingsGoal.create({
      data: { user_id: request.userId, name, target_amount, current_amount: 0, deadline: deadline ? new Date(deadline) : null, color, icon },
    });
  });

  fastify.patch<{ Params: { id: string }; Body: Partial<CrearMeta> }>("/goals/:id", { preHandler: fastify.authenticate }, async (request) => {
    const meta = await fastify.prisma.savingsGoal.findUnique({ where: { id: request.params.id } });
    if (!meta || meta.user_id !== request.userId) throw new ErrorApi(404, "Meta no encontrada");
    const { deadline, ...resto } = request.body;
    return fastify.prisma.savingsGoal.update({
      where: { id: meta.id },
      data: { ...resto, ...(deadline !== undefined ? { deadline: deadline ? new Date(deadline) : null } : {}) },
    });
  });

  fastify.delete<{ Params: { id: string } }>("/goals/:id", { preHandler: fastify.authenticate }, async (request) => {
    const meta = await fastify.prisma.savingsGoal.findUnique({ where: { id: request.params.id } });
    if (!meta || meta.user_id !== request.userId) throw new ErrorApi(404, "Meta no encontrada");
    await fastify.prisma.savingsGoal.delete({ where: { id: meta.id } });
    return { ok: true };
  });

  fastify.post<{ Params: { id: string }; Body: { amount: number } }>(
    "/goals/:id/contribute",
    { preHandler: fastify.authenticate },
    async (request) => {
      const meta = await fastify.prisma.savingsGoal.findUnique({ where: { id: request.params.id } });
      if (!meta || meta.user_id !== request.userId) throw new ErrorApi(404, "Meta no encontrada");
      const importe = request.body.amount;
      const actualizada = await fastify.prisma.savingsGoal.update({
        where: { id: meta.id },
        data: { current_amount: meta.current_amount + importe },
      });
      // Notifica solo al cruzar el 100%, no en cada aportación posterior (§11.6).
      if (meta.current_amount < meta.target_amount && actualizada.current_amount >= actualizada.target_amount) {
        await registrarNotificacion(fastify.prisma, {
          user_id: request.userId,
          type: "insight",
          severity: "info",
          title: "Objetivo de ahorro cumplido",
          body: `Has alcanzado tu meta "${actualizada.name}".`,
          action_type: "ver_meta",
          action_target_id: actualizada.id,
        });
      }
      return actualizada;
    },
  );
}
