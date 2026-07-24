import { hexARgba, aclararHex } from "@/lib/color";
import "./TarjetaAviso.css";
import { iconoPorNombre } from "@/lib/iconos";

interface PropsTarjetaAviso {
  /** Nombre de icono Phosphor en kebab-case (p.ej. "warning", "calendar-blank", "piggy-bank"). */
  icono: string;
  /** Color base: tiñe el borde, el fondo, la caja del icono y (aclarado) el título. */
  color: string;
  titulo: string;
  cuerpo: string;
  onClick?: () => void;
}

/**
 * Tarjeta de aviso (§4 "04 · Tarjeta de aviso"): caja de icono con borde propio,
 * título en una versión clara del color y cuerpo en gris suave. Usada para avisos
 * de presupuesto, cargos próximos y logros — cualquier alerta destacada fuera de
 * la lista compacta de notificaciones (§14.1, que usa `FilaMovimiento`/filas propias).
 */
export function TarjetaAviso({ icono, color, titulo, cuerpo, onClick }: PropsTarjetaAviso) {
  const ComponenteIcono = iconoPorNombre(icono);
  return (
    <div
      className={`tarjeta-aviso ${onClick ? "tarjeta-aviso--pulsable" : ""}`}
      style={{ borderColor: hexARgba(color, 0.3), background: `linear-gradient(135deg, ${hexARgba(color, 0.1)}, rgba(255,255,255,0.02) 60%)` }}
      onClick={onClick}
    >
      <div className="tarjeta-aviso__icono" style={{ background: hexARgba(color, 0.14), borderColor: hexARgba(color, 0.4), color }}>
        {ComponenteIcono && <ComponenteIcono size={20} weight="light" />}
      </div>
      <div className="tarjeta-aviso__texto">
        <span className="tarjeta-aviso__titulo" style={{ color: aclararHex(color) }}>
          {titulo}
        </span>
        <span className="tarjeta-aviso__cuerpo">{cuerpo}</span>
      </div>
    </div>
  );
}
