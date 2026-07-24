import type { Icon } from "@phosphor-icons/react";
import { Boton } from "./Boton";
import "./EstadoVacio.css";

interface PropsEstadoVacio {
  icono: Icon;
  titulo: string;
  descripcion: string;
  colorIcono?: string;
  accion?: { texto: string; onClick: () => void; icono?: Icon };
}

/** Estado vacío (§5.9): icono en caja glass tintada, título, descripción y CTA opcional. */
export function EstadoVacio({ icono: Icono, titulo, descripcion, colorIcono = "#8F86FF", accion }: PropsEstadoVacio) {
  const IconoAccion = accion?.icono;
  return (
    <div className="estado-vacio">
      <div className="estado-vacio__icono" style={{ borderColor: `${colorIcono}40`, background: `${colorIcono}14`, color: colorIcono }}>
        <Icono size={36} weight="light" />
      </div>
      <div className="estado-vacio__texto">
        <span className="estado-vacio__titulo">{titulo}</span>
        <span className="estado-vacio__descripcion">{descripcion}</span>
      </div>
      {accion && (
        <Boton variante="primario" tamano="medio" onClick={accion.onClick} icono={IconoAccion && <IconoAccion size={15} />}>
          {accion.texto}
        </Boton>
      )}
    </div>
  );
}
