import type { Notification } from "@/types/entidades";
import type { TipoToast } from "@/components/Retroalimentacion";

/**
 * Traduce una Notification recién disparada (§13.5) al toast que la "hace saltar" al
 * instante (§13.1). La notificación ya quedó guardada en la lista/campana de todas
 * formas — esto es solo el aviso inmediato en el momento de la acción.
 */
function tipoToastDeNotificacion(n: Notification): TipoToast {
  if (n.type === "budget_alert") return n.severity === "error" ? "error" : "info";
  if (n.type === "insight") return "exito";
  return "info"; // sync
}

/** Muestra como toast cada notificación de la cola (usar tras crear/editar movimiento, conectar cuenta, aportar a una meta…). */
export function mostrarNotificacionesComoToast(mostrar: (tipo: TipoToast, mensaje: string) => void, notificaciones: Notification[]) {
  for (const n of notificaciones) {
    mostrar(tipoToastDeNotificacion(n), n.title);
  }
}
