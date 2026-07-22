import type { CSSProperties, ReactNode } from "react";
import "./TarjetaGlass.css";

interface PropsTarjetaGlass {
  children: ReactNode;
  /** Fondo degradado opcional (p.ej. tintado por categoría o estado). Si no se indica, usa el vidrio plano. */
  fondo?: string;
  /** Padding interior; por defecto el estándar de tarjeta (28px). */
  padding?: string;
  /** Añade la sombra profunda de tarjeta (§4). */
  conSombra?: boolean;
  /** Anima el degradado de fondo lentamente (gradFlow, 18s) — usar solo en tarjetas con degradado. */
  animada?: boolean;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}

/**
 * Tarjeta de vidrio base: fondo translúcido + blur + borde sutil, radio 8px.
 * Es el bloque constructivo de balance, movimientos, avisos, informes, formularios…
 */
export function TarjetaGlass({
  children,
  fondo,
  padding,
  conSombra = false,
  animada = false,
  className,
  style,
  onClick,
}: PropsTarjetaGlass) {
  return (
    <div
      className={`tarjeta-glass ${animada ? "clase-glass-animada" : ""} ${onClick ? "tarjeta-glass--pulsable" : ""} ${className ?? ""}`}
      style={{
        background: fondo,
        padding,
        boxShadow: conSombra ? "var(--sombra-tarjeta)" : undefined,
        ...style,
      }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}
