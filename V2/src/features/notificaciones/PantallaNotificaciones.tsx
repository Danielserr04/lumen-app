import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "@phosphor-icons/react";
import { CabeceraPantalla } from "@/components/CabeceraPantalla";
import { TarjetaGlass } from "@/components/TarjetaGlass";
import { EtiquetaSeccion } from "@/components/EtiquetaSeccion";
import { EstadoVacio } from "@/components/EstadoVacio";
import { IconoConHalo } from "@/components/IconoConHalo";
import { agruparPorFecha, formatearTiempoRelativo } from "@/lib/formato";
import { apiNotificaciones } from "@/mocks/api";
import type { Notification } from "@/types/entidades";
import "./Notificaciones.css";

const ICONO_POR_TIPO: Record<Notification["type"], string> = {
  budget_alert: "warning",
  sync: "arrows-clockwise",
  insight: "lightbulb",
};
const COLOR_POR_TIPO: Record<Notification["type"], string> = {
  budget_alert: "#FFC24B",
  sync: "#42D0F4",
  insight: "#8F86FF",
};

/** Lista de notificaciones (§14.1): agrupadas por fecha, no leídas resaltadas, marcar todas leídas. */
export function PantallaNotificaciones() {
  const navigate = useNavigate();
  const [notificaciones, setNotificaciones] = useState<Notification[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    apiNotificaciones.listar().then((lista) => {
      setNotificaciones(lista);
      setCargando(false);
    });
  }, []);

  const grupos = useMemo(() => {
    const mapa = new Map<string, Notification[]>();
    for (const n of notificaciones) {
      const clave = agruparPorFecha(n.created_at);
      mapa.set(clave, [...(mapa.get(clave) ?? []), n]);
    }
    return Array.from(mapa.entries());
  }, [notificaciones]);

  async function marcarTodasLeidas() {
    await apiNotificaciones.marcarTodasLeidas();
    setNotificaciones((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <div className="pantalla">
      <CabeceraPantalla
        titulo="Notificaciones"
        navegacion="volver"
        onNavegar={() => navigate(-1)}
        accionDerecha={
          <span className="formulario-movimiento__guardar-texto" onClick={marcarTodasLeidas}>
            Marcar leídas
          </span>
        }
      />

      {!cargando && notificaciones.length === 0 && (
        <EstadoVacio icono={Bell} titulo="No tienes notificaciones" descripcion="Aquí verás avisos de presupuesto, sincronización e insights." />
      )}

      {grupos.map(([etiqueta, lista]) => (
        <div key={etiqueta} className="notificaciones-grupo">
          <EtiquetaSeccion>{etiqueta}</EtiquetaSeccion>
          <TarjetaGlass padding="4px 6px">
            {lista.map((n, i) => (
              <div key={n.id}>
                <div
                  className={`notificaciones-fila ${!n.read ? "notificaciones-fila--no-leida" : ""}`}
                  onClick={() => navigate(`/notificaciones/${n.id}`)}
                >
                  <IconoConHalo icono={ICONO_POR_TIPO[n.type]} color={COLOR_POR_TIPO[n.type]} tamano={38} radio={10} tamanoIcono={18} />
                  <div className="notificaciones-fila__texto">
                    <span className="notificaciones-fila__titulo">{n.title}</span>
                    <span className="notificaciones-fila__cuerpo">{n.body}</span>
                  </div>
                  <div className="notificaciones-fila__meta">
                    <span className="notificaciones-fila__hora">{formatearTiempoRelativo(n.created_at)}</span>
                    {!n.read && <span className="notificaciones-fila__punto" />}
                  </div>
                </div>
                {i < lista.length - 1 && <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "0 12px" }} />}
              </div>
            ))}
          </TarjetaGlass>
        </div>
      ))}
    </div>
  );
}
