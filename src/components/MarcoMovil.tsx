import type { CSSProperties, ReactNode } from "react";
import { CellSignalFull, WifiHigh, BatteryFull } from "@phosphor-icons/react";
import "./MarcoMovil.css";

interface PropsMarcoMovil {
  children: ReactNode;
  /** Color del blob decorativo de fondo (rgba). Por defecto índigo. */
  colorBlob?: string;
  /** Posición del blob: arriba-izquierda (por defecto) o arriba-derecha. */
  blobDerecha?: boolean;
  /** Oculta la barra de estado (9:41 + iconos) — útil en pantallas embebidas. */
  sinBarraEstado?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Marco de dispositivo móvil 390×844 con esquinas redondeadas (44px), sombra profunda
 * y un blob radial decorativo de fondo — réplica del marco usado en todo el prototipo
 * (secciones 09–12, 15–17 del HTML).
 */
export function MarcoMovil({
  children,
  colorBlob = "rgba(124,108,255,0.18)",
  blobDerecha = false,
  sinBarraEstado = false,
  className,
  style,
}: PropsMarcoMovil) {
  return (
    <div className={`marco-movil ${className ?? ""}`} style={style}>
      <div
        className="marco-movil__blob"
        style={{
          background: `radial-gradient(circle, ${colorBlob}, transparent 65%)`,
          ...(blobDerecha ? { top: "-120px", right: "-40px" } : { top: "-120px", left: "-40px" }),
        }}
      />
      {!sinBarraEstado && (
        <div className="marco-movil__barra-estado">
          <span>9:41</span>
          <div className="marco-movil__iconos-estado">
            <CellSignalFull size={13} weight="fill" color="#EDEFF5" />
            <WifiHigh size={13} weight="fill" color="#EDEFF5" />
            <BatteryFull size={16} weight="fill" color="#EDEFF5" />
          </div>
        </div>
      )}
      <div className="marco-movil__contenido">{children}</div>
    </div>
  );
}
