import { useState } from "react";
import { Plus, X } from "@phosphor-icons/react";
import { hexARgba } from "@/lib/color";
import "./FabExpandible.css";
import { iconoPorNombre } from "@/lib/iconos";

export interface AccionFab {
  icono: string; // nombre Phosphor en kebab-case
  etiqueta: string;
  color: string; // hex — tiñe la píldora de esta acción
  onClick: () => void;
}

interface PropsFabExpandible {
  acciones: AccionFab[];
  /** Accesible cuando solo hay una acción: se ejecuta directo, sin abanico. */
  ariaLabel?: string;
  className?: string;
}

/**
 * FAB en abanico: en vez del "+" circular de toda la vida, al tocarlo despliega
 * las acciones concretas como píldoras (p.ej. Gasto/Ingreso, o Suscripción/
 * Financiación/Meta) con el icono girando de "+" a "×". Con una sola acción se
 * comporta como un botón normal (accesible, sin abrir el abanico).
 */
export function FabExpandible({ acciones, ariaLabel = "Añadir", className }: PropsFabExpandible) {
  const [abierto, setAbierto] = useState(false);

  if (acciones.length === 1) {
    return (
      <button type="button" className={`fab-expandible__disco ${className ?? ""}`} onClick={acciones[0].onClick} aria-label={ariaLabel}>
        <Plus size={24} weight="bold" />
      </button>
    );
  }

  return (
    <div className={`fab-expandible ${className ?? ""}`}>
      {abierto && <div className="fab-expandible__telon" onClick={() => setAbierto(false)} />}
      <div className={`fab-expandible__acciones ${abierto ? "fab-expandible__acciones--abierto" : ""}`}>
        {acciones.map((accion, i) => {
          const ComponenteIcono = iconoPorNombre(accion.icono);
          return (
            <button
              key={accion.etiqueta}
              type="button"
              className="fab-expandible__pildora"
              style={{
                transitionDelay: abierto ? `${i * 35}ms` : "0ms",
                borderColor: hexARgba(accion.color, 0.4),
                background: hexARgba(accion.color, 0.14),
                color: accion.color,
              }}
              onClick={() => {
                setAbierto(false);
                accion.onClick();
              }}
            >
              {ComponenteIcono && <ComponenteIcono size={16} weight="light" />}
              <span>{accion.etiqueta}</span>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        className={`fab-expandible__disco ${abierto ? "fab-expandible__disco--abierto" : ""}`}
        onClick={() => setAbierto((v) => !v)}
        aria-label={ariaLabel}
        aria-expanded={abierto}
      >
        <span className="fab-expandible__icono-mas"><Plus size={24} weight="bold" /></span>
        <span className="fab-expandible__icono-cerrar"><X size={24} weight="bold" /></span>
      </button>
    </div>
  );
}
