import type { FastifyInstance } from "fastify";
import { ErrorApi } from "../../lib/errores.js";

interface CrearCategoria {
  name: string;
  icon: string;
  color: string;
  tint?: string;
  kind: "expense" | "income";
}

export default async function rutasCategorias(fastify: FastifyInstance) {
  fastify.get("/categories", { preHandler: fastify.authenticate }, async (request) => {
    return fastify.prisma.category.findMany({
      where: { OR: [{ user_id: null }, { user_id: request.userId }] },
      orderBy: { sort_order: "asc" },
    });
  });

  fastify.post<{ Body: CrearCategoria }>("/categories", { preHandler: fastify.authenticate }, async (request) => {
    const { name, icon, color, tint, kind } = request.body;
    if (!name || !icon || !color || !kind) throw new ErrorApi(400, "Nombre, icono, color y tipo son obligatorios");
    return fastify.prisma.category.create({
      data: { user_id: request.userId, name, icon, color, tint: tint ?? "152,162,184", kind, is_system: false, sort_order: 99 },
    });
  });

  fastify.patch<{ Params: { id: string }; Body: Partial<CrearCategoria> }>(
    "/categories/:id",
    { preHandler: fastify.authenticate },
    async (request) => {
      const categoria = await fastify.prisma.category.findUnique({ where: { id: request.params.id } });
      if (!categoria || categoria.user_id !== request.userId) throw new ErrorApi(404, "Categoría no encontrada");
      if (categoria.is_system) throw new ErrorApi(403, "Las categorías de sistema no se pueden editar");
      return fastify.prisma.category.update({ where: { id: request.params.id }, data: request.body });
    },
  );

  fastify.delete<{ Params: { id: string } }>("/categories/:id", { preHandler: fastify.authenticate }, async (request) => {
    const categoria = await fastify.prisma.category.findUnique({ where: { id: request.params.id } });
    if (!categoria || categoria.user_id !== request.userId) throw new ErrorApi(404, "Categoría no encontrada");
    if (categoria.is_system) throw new ErrorApi(403, "Las categorías de sistema no se pueden editar");
    const tieneMovimientos = await fastify.prisma.transaction.count({ where: { category_id: categoria.id, deleted_at: null } });
    if (tieneMovimientos > 0) throw new ErrorApi(409, "La categoría tiene movimientos asociados; reasigna a Otros primero");
    await fastify.prisma.category.delete({ where: { id: categoria.id } });
    return { ok: true };
  });
}
