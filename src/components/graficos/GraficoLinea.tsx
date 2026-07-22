import { useId } from "react";
import "./Graficos.css";

interface PropsGraficoLinea {
  /** Puntos ya normalizados a un viewBox de 420×170, generados con `trazarLineaSuave`. */
  puntosPath: string;
  etiquetas: string[];
  /** Posición del marcador final (último punto de la serie). */
  marcadorFinal?: { x: number; y: number };
}

/** Gráfico de línea con relleno degradado (§07 "Balance entre meses"). */
export function GraficoLinea({ puntosPath, etiquetas, marcadorFinal }: PropsGraficoLinea) {
  const idBase = useId();
  const idRelleno = `relleno-linea-${idBase}`;
  const idTrazo = `trazo-linea-${idBase}`;

  return (
    <div className="grafico-linea">
      <svg viewBox="0 0 420 170" className="grafico-linea__svg">
        <defs>
          <linearGradient id={idRelleno} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7C6CFF" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#7C6CFF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={idTrazo} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7C6CFF" />
            <stop offset="100%" stopColor="#42D0F4" />
          </linearGradient>
        </defs>
        <line x1="0" y1="42" x2="420" y2="42" stroke="rgba(255,255,255,0.05)" />
        <line x1="0" y1="84" x2="420" y2="84" stroke="rgba(255,255,255,0.05)" />
        <line x1="0" y1="126" x2="420" y2="126" stroke="rgba(255,255,255,0.05)" />
        <path d={`${puntosPath} L420,170 L0,170 Z`} fill={`url(#${idRelleno})`} />
        <path d={puntosPath} fill="none" stroke={`url(#${idTrazo})`} strokeWidth={2.5} strokeLinecap="round" />
        {marcadorFinal && (
          <>
            <circle cx={marcadorFinal.x} cy={marcadorFinal.y} r={10} fill="rgba(66,208,244,0.2)" />
            <circle cx={marcadorFinal.x} cy={marcadorFinal.y} r={5} fill="#42D0F4" />
          </>
        )}
      </svg>
      <div className="grafico-linea__etiquetas">
        {etiquetas.map((e) => (
          <span key={e}>{e}</span>
        ))}
      </div>
    </div>
  );
}
