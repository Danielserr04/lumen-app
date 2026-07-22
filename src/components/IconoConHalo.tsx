import * as PhosphorIcons from "@phosphor-icons/react";
import type { ReactNode } from "react";
import "./IconoConHalo.css";

interface PropsIconoConHalo {
  /** Nombre de icono Phosphor en kebab-case (p.ej. "fork-knife"), o un nodo custom (p.ej. logo de banco). */
  icono: string | ReactNode;
  /** Color base para icono, fondo (12% alpha) y borde (30% alpha). */
  color: string;
  tamano?: number;
  tamanoIcono?: number;
  radio?: number;
}

function nombreComponenteIcono(nombreKebab: string): string {
  return nombreKebab
    .split("-")
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
    .join("");
}

function hexARgb(hex: string): string {
  const limpio = hex.replace("#", "");
  const bigint = parseInt(limpio, 16);
  return `${(bigint >> 16) & 255},${(bigint >> 8) & 255},${bigint & 255}`;
}

/**
 * Chip cuadrado con halo de color (§5.2 fila de movimiento, §5.4 hero de informe):
 * fondo tintado 12%, borde tintado 30%, icono Phosphor centrado.
 */
export function IconoConHalo({ icono, color, tamano = 44, tamanoIcono = 22, radio = 4 }: PropsIconoConHalo) {
  const rgb = color.startsWith("#") ? hexARgb(color) : color;
  const contenido =
    typeof icono === "string"
      ? (() => {
          const ComponenteIcono = (PhosphorIcons as unknown as Record<string, PhosphorIcons.Icon>)[
            nombreComponenteIcono(icono)
          ];
          return ComponenteIcono ? <ComponenteIcono size={tamanoIcono} weight="light" color={color} /> : null;
        })()
      : icono;

  return (
    <div
      className="icono-con-halo"
      style={{
        width: tamano,
        height: tamano,
        borderRadius: radio,
        background: `rgba(${rgb},0.12)`,
        border: `1px solid rgba(${rgb},0.3)`,
        color,
      }}
    >
      {contenido}
    </div>
  );
}
