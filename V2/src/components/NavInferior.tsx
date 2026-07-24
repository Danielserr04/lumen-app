import { SquaresFour, Receipt, ArrowsClockwise, ChartLineUp, GearSix } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import "./NavInferior.css";

export interface PestanaNav {
  ruta: string;
  etiqueta: string;
  icono: Icon;
}

/** Las 5 pestañas de navegación de Lumen (§5), en orden. */
export const PESTANAS_NAV: PestanaNav[] = [
  { ruta: "/dashboard", etiqueta: "Dashboard", icono: SquaresFour },
  { ruta: "/movimientos", etiqueta: "Movimientos", icono: Receipt },
  { ruta: "/recurrentes", etiqueta: "Recurrentes", icono: ArrowsClockwise },
  { ruta: "/analisis", etiqueta: "Análisis", icono: ChartLineUp },
  { ruta: "/config", etiqueta: "Config", icono: GearSix },
];

interface PropsNavInferior {
  rutaActiva: string;
  onNavegar: (ruta: string) => void;
}

/** Navegación inferior móvil (§5/§06): ítem activo con icono fill y color de marca. */
export function NavInferior({ rutaActiva, onNavegar }: PropsNavInferior) {
  return (
    <nav className="nav-inferior">
      {PESTANAS_NAV.map((pestana) => {
        const activa = rutaActiva.startsWith(pestana.ruta);
        const Icono = pestana.icono;
        return (
          <button
            key={pestana.ruta}
            type="button"
            className="nav-inferior__item"
            onClick={() => onNavegar(pestana.ruta)}
          >
            <Icono size={21} weight={activa ? "fill" : "light"} color={activa ? "#8F86FF" : "#8B93A7"} />
            <span style={{ color: activa ? "#8F86FF" : "#8B93A7" }}>{pestana.etiqueta}</span>
          </button>
        );
      })}
    </nav>
  );
}
