import "./Graficos.css";

export interface ParBarras {
  etiqueta: string;
  /** Altura 0–1 de la barra de ingresos. */
  ingreso: number;
  /** Altura 0–1 de la barra de gastos. */
  gasto: number;
  /** Marca la última columna (se resalta en índigo, como "Jul" en el prototipo). */
  destacada?: boolean;
}

/** Gráfico de barras pareadas ingresos/gastos por mes (§07 del prototipo), decorativo/referencia. */
export function GraficoBarras({ datos, altura = 150 }: { datos: ParBarras[]; altura?: number }) {
  return (
    <div className="grafico-barras" style={{ height: altura + 26 }}>
      {datos.map((d) => (
        <div className="grafico-barras__columna" key={d.etiqueta}>
          <div className="grafico-barras__par" style={{ height: altura }}>
            <div
              className="grafico-barras__barra grafico-barras__barra--ingreso"
              style={{ height: `${d.ingreso * 100}%` }}
            />
            <div
              className="grafico-barras__barra grafico-barras__barra--gasto"
              style={{ height: `${d.gasto * 100}%` }}
            />
          </div>
          <span className={d.destacada ? "grafico-barras__etiqueta--destacada" : "grafico-barras__etiqueta"}>
            {d.etiqueta}
          </span>
        </div>
      ))}
    </div>
  );
}
