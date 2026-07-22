import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./Boton.css";

export type VarianteBoton = "primario" | "secundario" | "terciario" | "ghost" | "destructivo" | "icono-redondo";
export type TamanoBoton = "grande" | "medio" | "pequeno";

interface PropsBoton extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  variante?: VarianteBoton;
  tamano?: TamanoBoton;
  children: ReactNode;
  anchoCompleto?: boolean;
  icono?: ReactNode;
  className?: string;
}

/**
 * Botón de Lumen con las 6 variantes del §4: primario (CTA con degradado), secundario
 * (glass), terciario (texto), ghost (fila de acción), destructivo y el icono redondo (FAB).
 */
export function Boton({
  variante = "primario",
  tamano = "grande",
  children,
  anchoCompleto = false,
  icono,
  className,
  ...resto
}: PropsBoton) {
  return (
    <button
      className={`boton boton--${variante} boton--${tamano} ${anchoCompleto ? "boton--ancho-completo" : ""} ${className ?? ""}`}
      {...resto}
    >
      {icono}
      {children}
    </button>
  );
}
