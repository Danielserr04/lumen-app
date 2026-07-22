import "./Campos.css";

interface PropsSlider {
  /** Valor 0–1. */
  valor: number;
  onCambiar: (valor: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

/** Slider glass (§4): pista 6px, relleno degradado violeta→índigo, thumb con sombra. */
export function Slider({ valor, onCambiar, min = 0, max = 1, step = 0.01 }: PropsSlider) {
  const porcentaje = ((valor - min) / (max - min)) * 100;
  return (
    <div className="control-slider">
      <div className="control-slider__relleno" style={{ width: `${porcentaje}%` }} />
      <div className="control-slider__thumb" style={{ left: `${porcentaje}%` }} />
      <input
        className="control-slider__input"
        type="range"
        min={min}
        max={max}
        step={step}
        value={valor}
        onChange={(e) => onCambiar(Number(e.target.value))}
        aria-label="Control deslizante"
      />
    </div>
  );
}
