import type { PrismaClient, TipoNotificacion, SeveridadNotificacion } from "@prisma/client";

interface DatosNotificacion {
  user_id: string;
  type: TipoNotificacion;
  title: string;
  body: string;
  related_transaction_id?: string | null;
  severity?: SeveridadNotificacion;
  action_type?: string | null;
  action_target_id?: string | null;
}

/**
 * Genera una notificación como efecto lateral de una acción (§13.5), igual que
 * registrarNotificacion en src/mocks/api.ts del frontend. Respeta la preferencia
 * "avisos activos" del usuario (§11.7 "PATCH /me ... prefs de notificación").
 */
export async function registrarNotificacion(prisma: PrismaClient, datos: DatosNotificacion) {
  const usuario = await prisma.user.findUnique({ where: { id: datos.user_id }, select: { avisos_activos: true } });
  if (!usuario?.avisos_activos) return null;
  return prisma.notification.create({
    data: {
      user_id: datos.user_id,
      type: datos.type,
      title: datos.title,
      body: datos.body,
      related_transaction_id: datos.related_transaction_id ?? null,
      severity: datos.severity ?? "info",
      action_type: datos.action_type ?? null,
      action_target_id: datos.action_target_id ?? null,
    },
  });
}
