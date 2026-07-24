import * as PhosphorIcons from "@phosphor-icons/react";
import type { DefinicionCategoria } from "@/theme/tokens";
import "./ChipCategoria.css";

interface PropsChipCategoria {
  categoria: DefinicionCategoria;
  seleccionada?: boolean;
  onClick?: () => void;
  /** Tamaño del icono; por defecto 14px como en el prototipo. */
  tamanoIcono?: number;
}

/** Convierte "fork-knife" (nombre Phosphor kebab-case) a "ForkKnife" (export del paquete). */
function nombreComponenteIcono(nombreKebab: string): string {
  return nombreKebab
    .split("-")
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
    .join("");
}

/**
 * Chip seleccionable de categoría (§4): pill 999px con icono + texto, tintado con el
 * color de la categoría cuando está seleccionado.
 */
export function ChipCategoria({ categoria, seleccionada = false, onClick, tamanoIcono = 14 }: PropsChipCategoria) {
  const ComponenteIcono = (PhosphorIcons as unknown as Record<string, PhosphorIcons.Icon>)[
    nombreComponenteIcono(categoria.icono)
  ];

  return (
    <button
      type="button"
      className={`chip-categoria ${seleccionada ? "chip-categoria--seleccionada" : ""}`}
      style={
        seleccionada
          ? { background: `rgba(${categoria.tint},0.16)`, borderColor: `rgba(${categoria.tint},0.5)` }
          : undefined
      }
      onClick={onClick}
    >
      {ComponenteIcono && (
        <ComponenteIcono size={tamanoIcono} weight="light" color={seleccionada ? categoria.color : undefined} />
      )}
      <span style={seleccionada ? { color: categoria.color } : undefined}>{categoria.nombre}</span>
    </button>
  );
}
