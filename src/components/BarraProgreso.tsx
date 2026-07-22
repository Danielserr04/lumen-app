import "./BarraProgreso.css";

interface PropsBarraProgreso {
  /** Fracción 0–1 de avance. Se recorta a [0,1] visualmente pero puede superar el 100% de negocio (caso F). */
  fraccion: number;
  /** Degradado CSS del relleno; por defecto el degradado primario índigo→cian. */
  degradado?: string;
  altura?: number;
}

/** Barra de progreso fina (4px por defecto) usada en balance, presupuestos y financiación. */
export function BarraProgreso({ fraccion, degradado = "var(--degradado-primario-barra)", altura = 4 }: PropsBarraProgreso) {
  const ancho = Math.max(0, Math.min(1, fraccion)) * 100;
  return (
    <div className="barra-progreso" style={{ height: altura }}>
      <div className="barra-progreso__relleno" style={{ width: `${ancho}%`, background: degradado }} />
    </div>
  );
}
