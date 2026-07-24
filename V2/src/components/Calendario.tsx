import { useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import "./Calendario.css";

const DIAS_SEMANA = ["L", "M", "X", "J", "V", "S", "D"];
const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

function alInicioDelDia(fecha: Date): Date {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
}

function esMismoDia(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function enRango(dia: Date, inicio: Date | null, fin: Date | null): boolean {
  if (!inicio || !fin) return false;
  return dia > inicio && dia < fin;
}

interface PropsCalendario {
  mesVisible: Date;
  onCambiarMes: (fecha: Date) => void;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  onSeleccionarDia: (dia: Date) => void;
}

/**
 * Calendario mensual con estética glass de Lumen: grid de días, día de hoy marcado,
 * selección de rango (inicio/fin) resaltada con el degradado primario.
 */
export function Calendario({ mesVisible, onCambiarMes, fechaInicio, fechaFin, onSeleccionarDia }: PropsCalendario) {
  const hoy = alInicioDelDia(new Date());
  const anio = mesVisible.getFullYear();
  const mes = mesVisible.getMonth();

  const primerDiaSemana = (new Date(anio, mes, 1).getDay() + 6) % 7; // lunes = 0
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();

  // Siempre 6 semanas (42 celdas) aunque el mes tenga 4/5/6 filas reales: así la
  // cabecera con los botones de mes no salta de sitio al cambiar de mes (28-31 días).
  const celdas: (Date | null)[] = [
    ...Array.from({ length: primerDiaSemana }, () => null),
    ...Array.from({ length: diasEnMes }, (_, i) => new Date(anio, mes, i + 1)),
  ];
  while (celdas.length < 42) celdas.push(null);

  return (
    <div className="calendario">
      <div className="calendario__cabecera">
        <button type="button" className="calendario__nav" onClick={() => onCambiarMes(new Date(anio, mes - 1, 1))} aria-label="Mes anterior">
          <CaretLeft size={16} color="#A9B0C0" />
        </button>
        <span className="calendario__mes">
          {MESES[mes]} {anio}
        </span>
        <button type="button" className="calendario__nav" onClick={() => onCambiarMes(new Date(anio, mes + 1, 1))} aria-label="Mes siguiente">
          <CaretRight size={16} color="#A9B0C0" />
        </button>
      </div>

      <div className="calendario__semana">
        {DIAS_SEMANA.map((d) => (
          <span key={d} className="calendario__dia-semana">
            {d}
          </span>
        ))}
      </div>

      <div className="calendario__grid">
        {celdas.map((dia, i) => {
          if (!dia) return <span key={`vacio-${i}`} />;
          const esInicio = esMismoDia(dia, fechaInicio);
          const esFin = esMismoDia(dia, fechaFin);
          const esHoy = esMismoDia(dia, hoy);
          const dentroDeRango = enRango(dia, fechaInicio, fechaFin);
          return (
            <button
              key={dia.toISOString()}
              type="button"
              className={[
                "calendario__dia",
                (esInicio || esFin) && "calendario__dia--seleccionado",
                dentroDeRango && "calendario__dia--rango",
                esHoy && !esInicio && !esFin && "calendario__dia--hoy",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onSeleccionarDia(dia)}
            >
              {dia.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Estado de selección de rango de fechas, reutilizable por cualquier pantalla con filtro de fechas. */
export function usarRangoFechas(inicial?: { inicio: Date | null; fin: Date | null }) {
  const [fechaInicio, setFechaInicio] = useState<Date | null>(inicial?.inicio ?? null);
  const [fechaFin, setFechaFin] = useState<Date | null>(inicial?.fin ?? null);

  function seleccionarDia(dia: Date) {
    if (!fechaInicio || (fechaInicio && fechaFin)) {
      setFechaInicio(dia);
      setFechaFin(null);
      return;
    }
    if (dia < fechaInicio) {
      setFechaFin(fechaInicio);
      setFechaInicio(dia);
    } else {
      setFechaFin(dia);
    }
  }

  function limpiar() {
    setFechaInicio(null);
    setFechaFin(null);
  }

  return { fechaInicio, fechaFin, seleccionarDia, limpiar };
}
