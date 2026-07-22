import "dotenv/config";
import { construirApp } from "./app.js";
import { ejecutarJobRecurrentes } from "./jobs/recurrentes.js";

const PUERTO = Number(process.env.PORT ?? 3001);
const INTERVALO_JOB_MS = 60 * 60 * 1000; // cada hora es sobrado para un MVP personal

async function main() {
  const fastify = await construirApp();

  setInterval(() => {
    ejecutarJobRecurrentes(fastify.prisma).catch((error) => fastify.log.error(error));
  }, INTERVALO_JOB_MS);
  await ejecutarJobRecurrentes(fastify.prisma).catch((error) => fastify.log.error(error));

  await fastify.listen({ port: PUERTO, host: "0.0.0.0" });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
