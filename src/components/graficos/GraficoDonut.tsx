import "./Graficos.css";

export interface SegmentoDonut {
  color: string;
  /** Porcentaje 0–100. La suma no tiene que ser exactamente 100. */
  porcentaje: number;
}

interface PropsGraficoDonut {
  segmentos: SegmentoDonut[];
  centroTitulo: string;
  centroSubtitulo: string;
  tamano?: number;
}

/**
 * Donut de gasto por categoría (§07/§10 del prototipo): anillo de arcos con halo exterior
 * fino, centro flotante con la cifra total. No interactivo — solo lectura.
 */
export function GraficoDonut({ segmentos, centroTitulo, centroSubtitulo, tamano = 170 }: PropsGraficoDonut) {
  const centro = tamano / 2;
  const radio = tamano * 0.4;
  const radioHalo = tamano * 0.45;
  let acumulado = 0;

  return (
    <div className="grafico-donut" style={{ width: tamano, height: tamano }}>
      <svg viewBox={`0 0 ${tamano} ${tamano}`} className="grafico-donut__svg">
        <g transform={`rotate(-90 ${centro} ${centro})`} fill="none" strokeWidth={tamano * 0.094} strokeLinecap="butt">
          <circle cx={centro} cy={centro} r={radio} stroke="rgba(255,255,255,0.05)" pathLength={100} strokeDasharray="100 0" />
          {segmentos.map((segmento, i) => {
            const dashOffset = -acumulado;
            acumulado += segmento.porcentaje;
            return (
              <circle
                key={i}
                cx={centro}
                cy={centro}
                r={radio}
                stroke={segmento.color}
                pathLength={100}
                strokeDasharray={`${segmento.porcentaje} ${100 - segmento.porcentaje}`}
                strokeDashoffset={dashOffset}
              />
            );
          })}
        </g>
        <g transform={`rotate(-90 ${centro} ${centro})`} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={1.2}>
          {(() => {
            let acc = 0;
            return segmentos.map((segmento, i) => {
              const dashOffset = -acc;
              acc += segmento.porcentaje;
              return (
                <circle
                  key={i}
                  cx={centro}
                  cy={centro}
                  r={radioHalo}
                  strokeDasharray={`${segmento.porcentaje} ${100 - segmento.porcentaje}`}
                  strokeDashoffset={dashOffset}
                />
              );
            });
          })()}
        </g>
      </svg>
      <div className="grafico-donut__centro">
        <span className="grafico-donut__centro-titulo">{centroTitulo}</span>
        <span className="grafico-donut__centro-subtitulo">{centroSubtitulo}</span>
      </div>
    </div>
  );
}
