import type { ReactNode } from "react";
import { CaretRight } from "@phosphor-icons/react";
import "./Campos.css";

interface PropsFilaSeleccion {
  etiqueta: string;
  valor: string;
  onClick?: () => void;
  /** Icono al final (por defecto un caret si hay onClick). */
  iconoDerecha?: ReactNode;
}

/** Fila glass "Fecha", "Cuenta", "Periodo"…: label a la izquierda, valor a la derecha, abre selector. */
export function FilaSeleccion({ etiqueta, valor, onClick, iconoDerecha }: PropsFilaSeleccion) {
  return (
    <div className="fila-seleccion" onClick={onClick} role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined}>
      <span className="fila-seleccion__etiqueta">{etiqueta}</span>
      <span className="fila-seleccion__valor">
        {valor}
        {iconoDerecha ?? (onClick && <CaretRight size={14} color="var(--color-texto-dim)" />)}
      </span>
    </div>
  );
}
