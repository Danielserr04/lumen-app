import "./Esqueleto.css";

/** Bloque de carga con brillo animado (§5.9 estado de carga). Respeta prefers-reduced-motion. */
export function Esqueleto({ ancho = "100%", alto = 14, radio = 4 }: { ancho?: string | number; alto?: number; radio?: number }) {
  return <div className="esqueleto" style={{ width: ancho, height: alto, borderRadius: radio }} />;
}
