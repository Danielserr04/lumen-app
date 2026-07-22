import Fastify from "fastify";
import cors from "@fastify/cors";
import prismaPlugin from "./plugins/prisma.js";
import authPlugin from "./plugins/auth.js";
import { ErrorApi } from "./lib/errores.js";

import rutasAuth from "./modules/auth/rutas.js";
import rutasUsuarios from "./modules/usuarios/rutas.js";
import rutasCategorias from "./modules/categorias/rutas.js";
import rutasCuentas from "./modules/cuentas/rutas.js";
import rutasMovimientos from "./modules/movimientos/rutas.js";
import rutasPresupuestos from "./modules/presupuestos/rutas.js";
import rutasRecurrentes from "./modules/recurrentes/rutas.js";
import rutasMetas from "./modules/metas/rutas.js";
import rutasNotificaciones from "./modules/notificaciones/rutas.js";
import rutasAnalitica from "./modules/analitica/rutas.js";

export async function construirApp() {
  const fastify = Fastify({ logger: true });

  await fastify.register(cors, { origin: process.env.CORS_ORIGIN?.split(",") ?? true });
  await fastify.register(prismaPlugin);
  await fastify.register(authPlugin);

  await fastify.register(rutasAuth);
  await fastify.register(rutasUsuarios);
  await fastify.register(rutasCategorias);
  await fastify.register(rutasCuentas);
  await fastify.register(rutasMovimientos);
  await fastify.register(rutasPresupuestos);
  await fastify.register(rutasRecurrentes);
  await fastify.register(rutasMetas);
  await fastify.register(rutasNotificaciones);
  await fastify.register(rutasAnalitica);

  fastify.get("/health", async () => ({ ok: true }));

  fastify.setErrorHandler((error, _request, reply) => {
    if (error instanceof ErrorApi) {
      reply.status(error.codigo).send({ error: error.message });
      return;
    }
    fastify.log.error(error);
    reply.status(500).send({ error: "Error interno del servidor" });
  });

  return fastify;
}
