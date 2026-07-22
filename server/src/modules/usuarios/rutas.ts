import type { FastifyInstance } from "fastify";

interface CambiosMe {
  name?: string;
  avatar_url?: string | null;
  locale?: string;
  currency?: string;
  theme?: "dark" | "light";
  avisos_activos?: boolean;
}

export default async function rutasUsuarios(fastify: FastifyInstance) {
  fastify.get("/me", { preHandler: fastify.authenticate }, async (request) => {
    const usuario = await fastify.prisma.user.findUniqueOrThrow({ where: { id: request.userId } });
    return sinPassword(usuario);
  });

  fastify.patch<{ Body: CambiosMe }>("/me", { preHandler: fastify.authenticate }, async (request) => {
    const actualizado = await fastify.prisma.user.update({ where: { id: request.userId }, data: request.body });
    return sinPassword(actualizado);
  });
}

function sinPassword<T extends { password_hash: string }>(usuario: T) {
  const { password_hash, ...resto } = usuario;
  return resto;
}
