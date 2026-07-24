import { useId } from "react";
import { trazarLineaSuave } from "@/lib/trazarLinea";
import "./Graficos.css";

interface PropsSparkline {
  valores: number[];
  color: string;
}

/** Mini gráfico de fondo (§09 mini-cards Ingresos/Gastos): línea suave a 0.22 de opacidad, decorativa. */
export function Sparkline({ valores, color }: PropsSparkline) {
  const id = useId();
  const path = trazarLineaSuave(valores, 200, 70, 8);
  return (
    <svg viewBox="0 0 200 70" preserveAspectRatio="none" className="sparkline">
      <defs>
        <linearGradient id={`sparkline-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.5" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L200,70 L0,70 Z`} fill={`url(#sparkline-${id})`} />
      <path d={path} fill="none" stroke={color} strokeWidth={2} />
    </svg>
  );
}
