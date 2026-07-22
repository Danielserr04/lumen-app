import "./ToggleSegmentado.css";

export interface OpcionToggle<T extends string> {
  valor: T;
  etiqueta: string;
  /** Tinte rgb (p.ej. "255,107,122" para gasto) usado cuando esta opción está activa. */
  tint: string;
}

interface PropsToggleSegmentado<T extends string> {
  /** 2 o más opciones — el ancho de cada segmento se reparte a partes iguales. */
  opciones: OpcionToggle<T>[];
  valor: T;
  onCambiar: (valor: T) => void;
}

/**
 * Toggle segmentado del §4: usado para Gasto/Ingreso en el formulario de movimiento
 * y para periodos. Cada opción lleva su propio tinte de color cuando está activa.
 */
export function ToggleSegmentado<T extends string>({ opciones, valor, onCambiar }: PropsToggleSegmentado<T>) {
  return (
    <div className="toggle-segmentado" role="tablist">
      {opciones.map((opcion) => {
        const activo = opcion.valor === valor;
        return (
          <button
            key={opcion.valor}
            type="button"
            role="tab"
            aria-selected={activo}
            className={`toggle-segmentado__opcion ${activo ? "toggle-segmentado__opcion--activa" : ""}`}
            style={
              activo
                ? {
                    background: `rgba(${opcion.tint},0.16)`,
                    borderColor: `rgba(${opcion.tint},0.4)`,
                    color: `rgb(${opcion.tint})`,
                  }
                : undefined
            }
            onClick={() => onCambiar(opcion.valor)}
          >
            {opcion.etiqueta}
          </button>
        );
      })}
    </div>
  );
}
