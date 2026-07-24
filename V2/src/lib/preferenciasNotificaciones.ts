/**
 * Preferencia "Avisos inteligentes" de Config (§5.12 "Notificaciones: toggles por tipo").
 * Se guarda en localStorage para que el toggle sobreviva a recargas, y la consulta el mock
 * de la API antes de generar cualquier notificación (§13.5) — así el toggle hace algo real
 * en vez de ser puramente visual.
 */
const CLAVE = "lumen_avisos_activos";

export function avisosActivos(): boolean {
  const guardado = localStorage.getItem(CLAVE);
  return guardado === null ? true : guardado === "1";
}

export function establecerAvisosActivos(activos: boolean): void {
  localStorage.setItem(CLAVE, activos ? "1" : "0");
}
