import fp from "fastify-plugin";
import jwt from "jsonwebtoken";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ErrorApi } from "../lib/errores.js";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    firmarToken: (userId: string) => string;
  }
  interface FastifyRequest {
    userId: string;
  }
}

/**
 * JWT firmado a mano con `jsonwebtoken` (no @fastify/jwt: su dependencia fast-jwt tiene
 * varias CVEs de validación de firma sin parche disponible en la rama compatible con
 * Fastify v4 — ver `npm audit` en server/). Sin refresh token, MVP personal (ver plan).
 * Todas las rutas protegidas usan el preHandler `fastify.authenticate`, que valida el
 * token y expone `request.userId` — las queries de cada módulo SIEMPRE filtran por ese id,
 * nunca por uno recibido del cliente.
 */
export default fp(async (fastify: FastifyInstance) => {
  const secreto = process.env.JWT_SECRET;
  if (!secreto) throw new Error("Falta JWT_SECRET en el entorno");

  fastify.decorate("firmarToken", (userId: string) => jwt.sign({ userId }, secreto, { expiresIn: "30d" }));

  fastify.decorate("authenticate", async (request: FastifyRequest) => {
    const cabecera = request.headers.authorization;
    if (!cabecera?.startsWith("Bearer ")) throw new ErrorApi(401, "Sesión no válida o caducada");
    try {
      const payload = jwt.verify(cabecera.slice(7), secreto) as { userId: string };
      request.userId = payload.userId;
    } catch {
      throw new ErrorApi(401, "Sesión no válida o caducada");
    }
  });
});
