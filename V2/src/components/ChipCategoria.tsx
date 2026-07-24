import type { DefinicionCategoria } from "@/theme/tokens";
import "./ChipCategoria.css";
import { iconoPorNombre } from "@/lib/iconos";

interface PropsChipCategoria {
  categoria: DefinicionCategoria;
  seleccionada?: boolean;
  onClick?: () => void;
  /** Tamaño del icono; por defecto 14px como en el prototipo. */
  tamanoIcono?: number;
}

/**
 * Chip seleccionable de categoría (§4): pill 999px con icono + texto, tintado con el
 * color de la categoría cuando está seleccionado.
 */
export function ChipCategoria({ categoria, seleccionada = false, onClick, tamanoIcono = 14 }: PropsChipCategoria) {
  const ComponenteIcono = iconoPorNombre(categoria.icono);

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
