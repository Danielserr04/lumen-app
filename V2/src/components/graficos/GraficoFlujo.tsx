import { useId } from "react";
import { trazarLineaSuave, puntoFinal } from "@/lib/trazarLinea";
import "./Graficos.css";

export interface PuntoFlujo {
  etiqueta: string;
  ingreso: number;
  gasto: number;
  balance: number;
}

const ANCHO = 400;
const ALTO = 190;
const BASE = 168; // línea de suelo de las barras
const ALTURA_BARRAS = 90; // las barras solo ocupan la franja inferior; la línea flota libre por encima

/**
 * Gráfico combinado de flujo: barras finas y atenuadas de ingresos/gastos como contexto
 * de fondo, con la línea de balance flotando encima a todo color — un único gráfico en
 * vez de repetir dos tarjetas casi iguales (barras + línea) una debajo de la otra.
 */
export function GraficoFlujo({ datos }: { datos: PuntoFlujo[] }) {
  const idBase = useId();
  const maxBarra = Math.max(...datos.map((d) => Math.max(d.ingreso, d.gasto)), 1);
  const pasoX = ANCHO / datos.length;
  const anchoBarra = Math.min(10, pasoX * 0.16);

  const balances = datos.map((d) => d.balance);
  const lineaPath = trazarLineaSuave(balances, ANCHO, ALTO, 14);
  const marcador = puntoFinal(balances, ANCHO, ALTO, 14);

  return (
    <div className="grafico-flujo">
      <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} className="grafico-flujo__svg" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`flujo-relleno-${idBase}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7C6CFF" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#7C6CFF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`flujo-trazo-${idBase}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7C6CFF" />
            <stop offset="100%" stopColor="#42D0F4" />
          </linearGradient>
        </defs>

        <line x1="0" y1={BASE} x2={ANCHO} y2={BASE} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

        {datos.map((d, i) => {
          const cx = pasoX * i + pasoX / 2;
          const hIngreso = (d.ingreso / maxBarra) * ALTURA_BARRAS;
          const hGasto = (d.gasto / maxBarra) * ALTURA_BARRAS;
          return (
            <g key={d.etiqueta}>
              <rect x={cx - anchoBarra - 1} y={BASE - hIngreso} width={anchoBarra} height={hIngreso} rx={1.5} fill="rgba(74,222,168,0.45)" />
              <rect x={cx + 1} y={BASE - hGasto} width={anchoBarra} height={hGasto} rx={1.5} fill="rgba(255,107,122,0.4)" />
            </g>
          );
        })}

        <path d={`${lineaPath} L${ANCHO},${ALTO} L0,${ALTO} Z`} fill={`url(#flujo-relleno-${idBase})`} />
        <path
          d={lineaPath}
          fill="none"
          stroke={`url(#flujo-trazo-${idBase})`}
          strokeWidth={3}
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 4px 10px rgba(124,108,255,0.5))" }}
        />
        <circle cx={marcador.x} cy={marcador.y} r={4.5} fill="#42D0F4" />
        <circle cx={marcador.x} cy={marcador.y} r={9} fill="rgba(66,208,244,0.2)" />
      </svg>
      <div className="grafico-flujo__etiquetas">
        {datos.map((d) => (
          <span key={d.etiqueta}>{d.etiqueta}</span>
        ))}
      </div>
    </div>
  );
}
