import type { FastifyInstance } from "fastify";
import { ErrorApi } from "../../lib/errores.js";
import { registrarNotificacion } from "../notificaciones/servicio.js";

interface CrearCuenta {
  name: string;
  type: "checking" | "card" | "cash";
  bank_name?: string;
  mask?: string;
  balance?: number;
}

export default async function rutasCuentas(fastify: FastifyInstance) {
  fastify.get("/accounts", { preHandler: fastify.authenticate }, async (request) => {
    return fastify.prisma.account.findMany({ where: { user_id: request.userId }, orderBy: { created_at: "asc" } });
  });

  fastify.get<{ Params: { id: string } }>("/accounts/:id", { preHandler: fastify.authenticate }, async (request) => {
    const cuenta = await fastify.prisma.account.findUnique({ where: { id: request.params.id } });
    if (!cuenta || cuenta.user_id !== request.userId) throw new ErrorApi(404, "Cuenta no encontrada");
    return cuenta;
  });

  fastify.post<{ Body: CrearCuenta }>("/accounts", { preHandler: fastify.authenticate }, async (request) => {
    const { name, type, bank_name, mask, balance } = request.body;
    if (!name || !type) throw new ErrorApi(400, "Nombre y tipo son obligatorios");
    const cuenta = await fastify.prisma.account.create({
      data: { user_id: request.userId, name, type, bank_name: bank_name ?? null, mask: mask ?? null, balance: balance ?? 0, is_connected: type !== "cash" },
    });
    if (cuenta.type !== "cash") {
      await registrarNotificacion(fastify.prisma, {
        user_id: request.userId,
        type: "sync",
        severity: "info",
        title: `${cuenta.bank_name ?? cuenta.name} conectado`,
        body: `Ya puedes ver los movimientos de ${cuenta.bank_name ?? cuenta.name} en Lumen.`,
        action_type: "ver_analisis",
      });
    }
    return cuenta;
  });

  fastify.patch<{ Params: { id: string }; Body: Partial<CrearCuenta> }>(
    "/accounts/:id",
    { preHandler: fastify.authenticate },
    async (request) => {
      const cuenta = await fastify.prisma.account.findUnique({ where: { id: request.params.id } });
      if (!cuenta || cuenta.user_id !== request.userId) throw new ErrorApi(404, "Cuenta no encontrada");
      return fastify.prisma.account.update({ where: { id: cuenta.id }, data: request.body });
    },
  );

  fastify.delete<{ Params: { id: string } }>("/accounts/:id", { preHandler: fastify.authenticate }, async (request) => {
    const cuenta = await fastify.prisma.account.findUnique({ where: { id: request.params.id } });
    if (!cuenta || cuenta.user_id !== request.userId) throw new ErrorApi(404, "Cuenta no encontrada");
    const tieneMovimientos = await fastify.prisma.transaction.count({ where: { account_id: cuenta.id, deleted_at: null } });
    if (tieneMovimientos > 0) throw new ErrorApi(409, "La cuenta tiene movimientos asociados");
    await fastify.prisma.account.delete({ where: { id: cuenta.id } });
    return { ok: true };
  });

  fastify.post<{ Params: { id: string } }>("/accounts/:id/sync", { preHandler: fastify.authenticate }, async (request) => {
    const cuenta = await fastify.prisma.account.findUnique({ where: { id: request.params.id } });
    if (!cuenta || cuenta.user_id !== request.userId) throw new ErrorApi(404, "Cuenta no encontrada");
    const actualizada = await fastify.prisma.account.update({ where: { id: cuenta.id }, data: { last_sync_at: new Date() } });
    await registrarNotificacion(fastify.prisma, {
      user_id: request.userId,
      type: "sync",
      severity: "info",
      title: "Sincronización completada",
      body: `${actualizada.bank_name ?? actualizada.name} actualizado con tus últimos movimientos.`,
      action_type: "ver_analisis",
    });
    return actualizada;
  });
}
