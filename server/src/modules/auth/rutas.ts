import type { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { ErrorApi } from "../../lib/errores.js";

export default async function rutasAuth(fastify: FastifyInstance) {
  fastify.post<{ Body: { email: string; password: string; name: string } }>("/auth/signup", async (request) => {
    const { email, password, name } = request.body;
    if (!email || !password || !name) throw new ErrorApi(400, "Email, contraseña y nombre son obligatorios");
    if (password.length < 8) throw new ErrorApi(400, "La contraseña debe tener al menos 8 caracteres");

    const yaExiste = await fastify.prisma.user.findUnique({ where: { email } });
    if (yaExiste) throw new ErrorApi(409, "Ya existe una cuenta con ese email");

    const password_hash = await bcrypt.hash(password, 10);
    const usuario = await fastify.prisma.user.create({ data: { email, name, password_hash } });

    // Cuenta en efectivo por defecto para que la app no arranque vacía. Las categorías de
    // sistema son globales (user_id null) y se siembran una única vez con `prisma db seed`
    // — no se crean aquí para no duplicarlas en cada registro.
    await fastify.prisma.account.create({ data: { user_id: usuario.id, name: "Efectivo", type: "cash", balance: 0, is_connected: false } });

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
