import "./Graficos.css";

export interface BarraSimple {
  etiqueta: string;
  /** Altura 0–1. */
  valor: number;
  destacada?: boolean;
}

/** Serie única de barras (§08/§10: "Tu gasto aquí · 6 meses"), la última columna resaltada. */
export function GraficoBarrasSimple({
  datos,
  color,
  colorDestacado = "#7C6CFF",
  altura = 120,
}: {
  datos: BarraSimple[];
  color: string;
  colorDestacado?: string;
  altura?: number;
}) {
  return (
    <div className="grafico-barras-simple" style={{ height: altura + 24 }}>
      {datos.map((d) => {
        const c = d.destacada ? colorDestacado : color;
        return (
          <div className="grafico-barras-simple__columna" key={d.etiqueta}>
            <div
              className="grafico-barras-simple__barra"
              style={{
                height: `${d.valor * 100}%`,
                background: `linear-gradient(180deg, ${hexAlpha(c, 0.26)}, ${hexAlpha(c, 0.04)})`,
                borderColor: hexAlpha(c, 0.75),
              }}
            />
            <span style={{ color: d.destacada ? colorDestacado : "var(--color-texto-muted)" }}>{d.etiqueta}</span>
          </div>
        );
      })}
    </div>
  );
}

function hexAlpha(hex: string, alpha: number): string {
  const limpio = hex.replace("#", "");
  const bigint = parseInt(limpio, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}
