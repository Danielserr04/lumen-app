import { MagnifyingGlass } from "@phosphor-icons/react";
import "./Campos.css";

interface PropsCampoBusqueda {
  valor: string;
  onCambiar: (valor: string) => void;
  placeholder?: string;
}

/** Buscador glass con lupa a la izquierda; el borde se tiñe de índigo al tener foco/texto. */
export function CampoBusqueda({ valor, onCambiar, placeholder = "Buscar movimiento…" }: PropsCampoBusqueda) {
  const activo = valor.length > 0;
  return (
    <div className={`campo-busqueda ${activo ? "campo-busqueda--activo" : ""}`}>
      <MagnifyingGlass size={16} color={activo ? "var(--color-primario-link-hover)" : "var(--color-texto-dim)"} />
      <input
        className="campo-busqueda__input"
        value={valor}
        onChange={(e) => onCambiar(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
