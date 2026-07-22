/**
 * Convierte una serie de valores en un `path` SVG suavizado, para el viewBox 420×170
 * que usan los gráficos de línea de Lumen (§07 "Balance entre meses").
 */
export function trazarLineaSuave(valores: number[], ancho = 420, alto = 170, margenSuperior = 20): string {
  if (valores.length === 0) return "";
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const rango = max - min || 1;
  const alturaUtil = alto - margenSuperior - 10;

  const puntos = valores.map((v, i) => ({
    x: (i / (valores.length - 1)) * ancho,
    y: margenSuperior + alturaUtil - ((v - min) / rango) * alturaUtil,
  }));

  let d = `M${puntos[0].x},${puntos[0].y}`;
  for (let i = 0; i < puntos.length - 1; i++) {
    const actual = puntos[i];
    const siguiente = puntos[i + 1];
    const cx = (actual.x + siguiente.x) / 2;
    d += ` C${cx},${actual.y} ${cx},${siguiente.y} ${siguiente.x},${siguiente.y}`;
  }
  return d;
}

/** Posición (x, y) del último punto de la serie, para dibujar el marcador final. */
export function puntoFinal(valores: number[], ancho = 420, alto = 170, margenSuperior = 20): { x: number; y: number } {
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const rango = max - min || 1;
  const alturaUtil = alto - margenSuperior - 10;
  const i = valores.length - 1;
  return {
    x: ancho,
    y: margenSuperior + alturaUtil - ((valores[i] - min) / rango) * alturaUtil,
  };
}
