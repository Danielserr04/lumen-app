import { useId } from "react";
import "./Campos.css";

interface PropsImporteInput {
  /** Texto ya formateado del importe, p.ej. "42,80 €" — el formulario controla el parseo. */
  valorTexto: string;
  onCambiar: (texto: string) => void;
  pista?: string;
}

/** Input hero de importe (44–52px), usado como campo protagonista de "Añadir movimiento". */
export function ImporteInput({ valorTexto, onCambiar, pista = "Toca para editar el importe" }: PropsImporteInput) {
  const id = useId();
  return (
    <div className="importe-input">
      <input
        id={id}
        className="importe-input__campo"
        inputMode="decimal"
        value={valorTexto}
        onChange={(e) => onCambiar(e.target.value)}
        aria-label="Importe"
      />
      <span className="importe-input__pista">{pista}</span>
    </div>
  );
}
