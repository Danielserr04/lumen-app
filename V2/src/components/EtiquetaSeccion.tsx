import "./EtiquetaSeccion.css";

/** Etiqueta de sección uppercase, tenue, usada como separador de listas ("HOY", "AYER"…). */
export function EtiquetaSeccion({ children }: { children: string }) {
  return <span className="etiqueta-seccion">{children}</span>;
}
