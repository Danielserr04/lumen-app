import { IconoConHalo } from "./IconoConHalo";
import { PildoraEstado } from "./PildoraEstado";
import { formatearImporteConSigno, formatearFechaMovimiento } from "@/lib/formato";
import "./FilaMovimiento.css";

export interface CategoriaVisual {
  nombre: string;
  icono: string;
  color: string;
}

interface PropsFilaMovimiento {
  nombre: string;
  /** Subtítulo ya compuesto (p.ej. "Comida · 17 jul 14:32 · Visa ·· 4821") o se genera desde categoría+fecha. */
  subtitulo?: string;
  fechaIso: string;
  /** Importe con signo, en céntimos. */
  amount: number;
  /** Categoría ya resuelta (nombre/icono/color) — null = sin categorizar (caso H). */
  categoria: CategoriaVisual | null;
  /** Icono Phosphor específico (p.ej. "shopping-cart"); si no se indica, usa el de la categoría. */
  icono?: string;
  estado?: { texto: string; severidad: "ok" | "warning" | "error" | "neutro" | "info" };
  onClick?: () => void;
  /** Tamaño compacto (36px) para listas dentro de tarjetas, vs. 44px de lista completa. */
  compacta?: boolean;
}

/**
 * Fila de movimiento (§5.2): chip de icono con halo · nombre + subtítulo · importe
 * firmado (verde/rojo) · pill de estado opcional. Sin barra lateral de color.
 */
export function FilaMovimiento({
  nombre,
  subtitulo,
  fechaIso,
  amount,
  categoria,
  icono,
  estado,
  onClick,
  compacta = false,
}: PropsFilaMovimiento) {
  const colorIcono = categoria?.color ?? "#98A2B8";
  const nombreIcono = icono ?? categoria?.icono ?? "dots-three-circle";
  const sub = subtitulo ?? `${categoria?.nombre ?? "Sin categorizar"} · ${formatearFechaMovimiento(fechaIso)}`;

  return (
    <div className={`fila-movimiento ${onClick ? "fila-movimiento--pulsable" : ""}`} onClick={onClick}>
      <IconoConHalo icono={nombreIcono} color={colorIcono} tamano={compacta ? 36 : 44} radio={compacta ? 10 : 4} />
      <div className="fila-movimiento__texto">
        <span className="fila-movimiento__nombre">{nombre}</span>
        <span className="fila-movimiento__subtitulo">{sub}</span>
      </div>
      {estado && <PildoraEstado texto={estado.texto} severidad={estado.severidad} />}
      <span
        className="fila-movimiento__importe"
        style={{ color: amount < 0 ? "var(--color-gasto)" : amount > 0 ? "var(--color-ingreso)" : "var(--color-texto-muted)" }}
      >
        {formatearImporteConSigno(amount)}
      </span>
    </div>
  );
}
