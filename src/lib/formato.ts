/**
 * Utilidades de formato en español (es-ES) para Lumen.
 * Los importes de dominio siempre viajan en CÉNTIMOS ENTEROS (nunca floats) — §8 del handoff.
 */

const formateadorEuros = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Convierte céntimos (p.ej. 428080 → 4.280,80 €) a texto con formato español,
 * sin signo. Usar `formatearImporteConSigno` cuando se quiera mostrar +/-.
 */
export function formatearEuros(centimos: number): string {
  return formateadorEuros.format(centimos / 100);
}

/**
 * Formatea un importe con signo explícito según su valor: "+1.850,00 €" o "−42,80 €".
 * Usa el signo menos tipográfico (−) como en el prototipo, no un guion normal.
 */
export function formatearImporteConSigno(centimos: number): string {
  const texto = formateadorEuros.format(Math.abs(centimos) / 100);
  if (centimos < 0) return `−${texto}`;
  if (centimos > 0) return `+${texto}`;
  return texto;
}

/** Redondea centimos a euros con 0 decimales, para importes "grandes" tipo "2.000 €". */
export function formatearEurosSinDecimales(centimos: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(centimos / 100);
}

const MESES_ABREV = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

const MESES_COMPLETOS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

function esMismoDia(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function diaAnterior(fecha: Date): Date {
  const copia = new Date(fecha);
  copia.setDate(copia.getDate() - 1);
  return copia;
}

function dosDigitos(n: number): string {
  return n.toString().padStart(2, "0");
}

function formatearHora(fecha: Date): string {
  return `${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}`;
}

/**
 * Fecha corta de fila de movimiento: "Hoy · 14:32", "Ayer · 09:15", "17 jul · 14:32".
 */
export function formatearFechaMovimiento(fechaIso: string, ahora: Date = new Date()): string {
  const fecha = new Date(fechaIso);
  if (esMismoDia(fecha, ahora)) return `Hoy · ${formatearHora(fecha)}`;
  if (esMismoDia(fecha, diaAnterior(ahora))) return `Ayer · ${formatearHora(fecha)}`;
  return `${fecha.getDate()} ${MESES_ABREV[fecha.getMonth()]} · ${formatearHora(fecha)}`;
}

/** Fecha larga para cabeceras de informe: "Hoy, 17 de julio · 14:32". */
export function formatearFechaLarga(fechaIso: string, ahora: Date = new Date()): string {
  const fecha = new Date(fechaIso);
  const prefijo = esMismoDia(fecha, ahora)
    ? "Hoy, "
    : esMismoDia(fecha, diaAnterior(ahora))
      ? "Ayer, "
      : "";
  return `${prefijo}${fecha.getDate()} de ${MESES_COMPLETOS[fecha.getMonth()]} · ${formatearHora(fecha)}`;
}

/** Mes y año en mayúscula inicial, como el título de la tarjeta de balance: "Julio 2026". */
export function formatearMesAnio(fecha: Date = new Date()): string {
  const mes = MESES_COMPLETOS[fecha.getMonth()];
  return `${mes.charAt(0).toUpperCase()}${mes.slice(1)} ${fecha.getFullYear()}`;
}

/** Hora relativa para notificaciones: "hace 2 h", "hace 5 min", "hace 3 d". */
export function formatearTiempoRelativo(fechaIso: string, ahora: Date = new Date()): string {
  const fecha = new Date(fechaIso);
  const segundos = Math.max(0, Math.floor((ahora.getTime() - fecha.getTime()) / 1000));
  if (segundos < 60) return "ahora mismo";
  const minutos = Math.floor(segundos / 60);
  if (minutos < 60) return `hace ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  return `hace ${dias} d`;
}

/** Agrupa por "Hoy" / "Ayer" / "Esta semana" / "Anteriores" — usado en listas y notificaciones. */
export function agruparPorFecha(fechaIso: string, ahora: Date = new Date()): string {
  const fecha = new Date(fechaIso);
  if (esMismoDia(fecha, ahora)) return "Hoy";
  if (esMismoDia(fecha, diaAnterior(ahora))) return "Ayer";
  const diffDias = Math.floor((ahora.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDias < 7) return "Esta semana";
  return "Anteriores";
}

/** Porcentaje entero para barras de progreso: 0.362 → "36%". */
export function formatearPorcentaje(fraccion: number): string {
  return `${Math.round(fraccion * 100)}%`;
}
