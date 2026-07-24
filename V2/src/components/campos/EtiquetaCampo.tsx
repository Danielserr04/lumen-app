import "./Campos.css";

/** Label uppercase encima de un campo de formulario, con soporte de sufijo "(opcional)". */
export function EtiquetaCampo({ children, opcional = false }: { children: string; opcional?: boolean }) {
  return (
    <span className="etiqueta-campo">
      {children} {opcional && <span className="etiqueta-campo__opcional">(opcional)</span>}
    </span>
  );
}
