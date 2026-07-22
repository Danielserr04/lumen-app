import type { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { ErrorApi } from "../../lib/errores.js";

const categoriasSistemaBase = [
  { name: "Comida", icon: "fork-knife", color: "#FFA35C", tint: "255,163,92", kind: "expense" as const, sort_order: 1 },
  { name: "Transporte", icon: "car", color: "#5CB3FF", tint: "92,179,255", kind: "expense" as const, sort_order: 2 },
  { name: "Ocio", icon: "confetti", color: "#B78CFF", tint: "183,140,255", kind: "expense" as const, sort_order: 3 },
  { name: "Suscripciones", icon: "repeat", color: "#FF7FC4", tint: "255,127,196", kind: "expense" as const, sort_order: 4 },
  { name: "Salud", icon: "heartbeat", color: "#4FD9D0", tint: "79,217,208", kind: "expense" as const, sort_order: 5 },
  { name: "Tabaco", icon: "cigarette", color: "#B08968", tint: "176,137,104", kind: "expense" as const, sort_order: 6 },
  { name: "Otros", icon: "dots-three", color: "#98A2B8", tint: "152,162,184", kind: "expense" as const, sort_order: 7 },
  { name: "Ingreso", icon: "hand-coins", color: "#4ADEA8", tint: "74,222,168", kind: "income" as const, sort_order: 8 },
];

export default async function rutasAuth(fastify: FastifyInstance) {
  fastify.post<{ Body: { email: string; password: string; name: string } }>("/auth/signup", async (request) => {
    const { email, password, name } = request.body;
    if (!email || !password || !name) throw new ErrorApi(400, "Email, contraseña y nombre son obligatorios");
    if (password.length < 8) throw new ErrorApi(400, "La contraseña debe tener al menos 8 caracteres");

    const yaExiste = await fastify.prisma.user.findUnique({ where: { email } });
    if (yaExiste) throw new ErrorApi(409, "Ya existe una cuenta con ese email");

    const password_hash = await bcrypt.hash(password, 10);
    const usuario = await fastify.prisma.user.create({ data: { email, name, password_hash } });

    // Cuenta en efectivo por defecto + categorías de sistema del usuario, para que la app
    // no arranque vacía (mismo criterio que los fixtures de src/mocks/data en el frontend).
    await fastify.prisma.account.create({ data: { user_id: usuario.id, name: "Efectivo", type: "cash", balance: 0, is_connected: false } });
    await fastify.prisma.category.createMany({ data: categoriasSistemaBase.map((c) => ({ ...c, user_id: null, is_system: true })), skipDuplicates: true });

    const token = fastify.firmarToken(usuario.id);
    return { user: sinPassword(usuario), token };
  });

  fastify.post<{ Body: { email: string; password: string } }>("/auth/login", async (request) => {
    const { email, password } = request.body;
    const usuario = await fastify.prisma.user.findUnique({ where: { email } });
    if (!usuario) throw new ErrorApi(401, "Email o contraseña incorrectos");
    const valido = await bcrypt.compare(password, usuario.password_hash);
    if (!valido) throw new ErrorApi(401, "Email o contraseña incorrectos");
    const token = fastify.firmarToken(usuario.id);
    return { user: sinPassword(usuario), token };
  });

  fastify.post("/auth/logout", async () => ({ ok: true }));

  fastify.post<{ Body: { email: string } }>("/auth/forgot-password", async () => {
    // Mock de envío de email — sin proveedor real en el MVP (mismo alcance que el frontend).
    return { ok: true };
  });

  fastify.post<{ Body: { token: string; password: string } }>("/auth/reset-password", async () => {
    return { ok: true };
  });
}

function sinPassword<T extends { password_hash: string }>(usuario: T) {
  const { password_hash, ...resto } = usuario;
  return resto;
}
