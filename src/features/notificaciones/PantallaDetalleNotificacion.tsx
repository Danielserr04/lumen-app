import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BellSlash } from "@phosphor-icons/react";
import { CabeceraPantalla } from "@/components/CabeceraPantalla";
import { TarjetaGlass } from "@/components/TarjetaGlass";
import { IconoConHalo } from "@/components/IconoConHalo";
import { Boton } from "@/components/Boton";
import { formatearFechaLarga } from "@/lib/formato";
import { apiNotificaciones } from "@/mocks/api";
import type { Notification } from "@/types/entidades";
import "./Notificaciones.css";

const ICONO_POR_TIPO: Record<Notification["type"], string> = { budget_alert: "warning", sync: "arrows-clockwise", insight: "lightbulb" };
const COLOR_POR_TIPO: Record<Notification["type"], string> = { budget_alert: "#FFC24B", sync: "#42D0F4", insight: "#8F86FF" };
const TEXTO_ACCION: Record<NonNullable<Notification["action_type"]>, string> = {
  ver_presupuesto: "Ver presupuesto",
  ver_movimientos_categoria: "Ver movimientos de la categoría",
  ver_movimiento: "Ver movimiento",
  reintentar: "Reintentar",
  ver_analisis: "Ver análisis",
  ver_meta: "Ver meta",
};

/** Detalle de notificación (§14.2, sección 17 del prototipo): icono grande, cuerpo completo, acción contextual. */
export function PantallaDetalleNotificacion() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [notif, setNotif] = useState<Notification | null>(null);

  useEffect(() => {
    apiNotificaciones.obtener(id).then((n) => {
      setNotif(n);
      if (!n.read) apiNotificaciones.marcarLeida(id);
    });
  }, [id]);

  if (!notif) return <div className="pantalla" />;

  function ejecutarAccion() {
    if (!notif?.action_type) return;
    if (notif.action_type === "ver_movimiento" && notif.action_target_id) navigate(`/movimientos/${notif.action_target_id}`);
    else if (notif.action_type === "ver_movimientos_categoria") navigate("/movimientos");
    else if (notif.action_type === "ver_analisis") navigate("/analisis");
    else if (notif.action_type === "ver_meta") navigate("/config/metas");
    else if (notif.action_type === "ver_presupuesto") navigate("/presupuestos/nuevo");
  }

  return (
    <div className="pantalla">
      <div className="blob-decorativo" style={{ top: -120, left: -40, background: `radial-gradient(circle, ${COLOR_POR_TIPO[notif.type]}30, transparent 65%)` }} />
      <CabeceraPantalla titulo="Notificación" navegacion="cerrar" onNavegar={() => navigate(-1)} />

      <TarjetaGlass animada fondo={`linear-gradient(120deg, ${COLOR_POR_TIPO[notif.type]}33, rgba(255,127,196,0.10) 60%)`} conSombra className="detalle-notif__tarjeta">
        <div className="detalle-notif__cabecera">
          <IconoConHalo icono={ICONO_POR_TIPO[notif.type]} color={COLOR_POR_TIPO[notif.type]} tamano={46} radio={12} tamanoIcono={22} />
          <div className="detalle-notif__texto">
            <span className="detalle-notif__titulo">{notif.title}</span>
            <span className="detalle-notif__fecha">{formatearFechaLarga(notif.created_at)}</span>
          </div>
        </div>
        <span className="detalle-notif__cuerpo">{notif.body}</span>
      </TarjetaGlass>

      <div className="pantalla__cta-anclado detalle-notif__acciones">
        {notif.action_type && (
          <Boton variante="secundario" anchoCompleto onClick={ejecutarAccion}>
            {TEXTO_ACCION[notif.action_type]}
          </Boton>
        )}
        <Boton variante="ghost" anchoCompleto icono={<BellSlash size={15} />}>
          Silenciar avisos
        </Boton>
      </div>
    </div>
  );
}
