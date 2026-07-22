import type { FastifyInstance } from "fastify";
import { ErrorApi } from "../../lib/errores.js";

export default async function rutasNotificaciones(fastify: FastifyInstance) {
  fastify.get<{ Querystring: { read?: string } }>("/notifications", { preHandler: fastify.authenticate }, async (request) => {
    const soloNoLeidas = request.query.read === "false";
    return fastify.prisma.notification.findMany({
      where: { user_id: request.userId, ...(soloNoLeidas ? { read: false } : {}) },
      orderBy: { created_at: "desc" },
    });
  });

  fastify.get("/notifications/unread-count", { preHandler: fastify.authenticate }, async (request) => {
    const count = await fastify.prisma.notification.count({ where: { user_id: request.userId, read: false } });
    return { count };
  });

  fastify.get<{ Params: { id: string } }>("/notifications/:id", { preHandler: fastify.authenticate }, async (request) => {
    const n = await fastify.prisma.notification.findUnique({ where: { id: request.params.id } });
    if (!n || n.user_id !== request.userId) throw new ErrorApi(404, "Notificación no encontrada");
    return n;
  });

  fastify.patch<{ Params: { id: string } }>("/notifications/:id", { preHandler: fastify.authenticate }, async (request) => {
    const n = await fastify.prisma.notification.findUnique({ where: { id: request.params.id } });
    if (!n || n.user_id !== request.userId) throw new ErrorApi(404, "Notificación no encontrada");
    return fastify.prisma.notification.update({ where: { id: n.id }, data: { read: true } });
  });

  fastify.post("/notifications/read-all", { preHandler: fastify.authenticate }, async (request) => {
    await fastify.prisma.notification.updateMany({ where: { user_id: request.userId, read: false }, data: { read: true } });
    return { ok: true };
  });

  fastify.delete<{ Params: { id: string } }>("/notifications/:id", { preHandler: fastify.authenticate }, async (request) => {
    const n = await fastify.prisma.notification.findUnique({ where: { id: request.params.id } });
    if (!n || n.user_id !== request.userId) throw new ErrorApi(404, "Notificación no encontrada");
    await fastify.prisma.notification.delete({ where: { id: n.id } });
    return { ok: true };
  });
}
