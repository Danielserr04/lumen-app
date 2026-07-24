import type { ReactNode } from "react";
import { CaretLeft, X } from "@phosphor-icons/react";
import "./CabeceraPantalla.css";

interface PropsCabeceraPantalla {
  titulo: string;
  /** "volver" muestra caret-left, "cerrar" muestra x. Omitir si la pantalla es raíz de tab. */
  navegacion?: "volver" | "cerrar";
  onNavegar?: () => void;
  /** Acción de texto a la derecha (p.ej. "Guardar") o un nodo custom (p.ej. menú dots-three). */
  accionDerecha?: ReactNode;
  centrado?: boolean;
}

/** Cabecera estándar de pantalla de detalle/formulario (§4 "Estructura de pantalla de formulario"). */
export function CabeceraPantalla({ titulo, navegacion, onNavegar, accionDerecha, centrado = false }: PropsCabeceraPantalla) {
  return (
    <div className="cabecera-pantalla">
      {navegacion && (
        <button type="button" className="cabecera-pantalla__nav" onClick={onNavegar} aria-label={navegacion}>
          {navegacion === "volver" ? <CaretLeft size={22} color="#A9B0C0" /> : <X size={20} color="#A9B0C0" />}
        </button>
      )}
      <span className={`cabecera-pantalla__titulo ${centrado ? "cabecera-pantalla__titulo--centrado" : ""}`}>
        {titulo}
      </span>
      {accionDerecha}
    </div>
  );
}
