/**
 * Punto de entrada de la API consumido por todas las pantallas. Vivió aquí como mock en
 * memoria durante la construcción del frontend; ahora reexporta el cliente HTTP real
 * (src/lib/httpApi.ts) que habla con el backend (server/, Fastify+Prisma+Postgres) — mismo
 * contrato, cambia solo la implementación por debajo, como estaba previsto desde el inicio
 * (ver cabecera de src/types/entidades.ts).
 */
export * from "@/lib/httpApi";
