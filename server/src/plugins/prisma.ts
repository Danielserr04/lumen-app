import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

/** Decora fastify.prisma con una única instancia de PrismaClient para toda la app. */
export default fp(async (fastify: FastifyInstance) => {
  const prisma = new PrismaClient();
  await prisma.$connect();
  fastify.decorate("prisma", prisma);
  fastify.addHook("onClose", async (instance) => {
    await instance.prisma.$disconnect();
  });
});
