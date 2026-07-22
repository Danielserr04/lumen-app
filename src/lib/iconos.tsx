/**
 * Wrapper fino sobre @phosphor-icons/react para mantener el trazo fino ("light")
 * por defecto y "fill" para el ítem activo, tal como pide el §4 del handoff.
 */
import type { Icon, IconWeight } from "@phosphor-icons/react";

export interface PropsIcono {
  icono: Icon;
  tamano?: number;
  color?: string;
  peso?: IconWeight;
  className?: string;
}

/** Icono estándar de Lumen: peso `light` salvo que se indique lo contrario. */
export function IconoLumen({ icono: Componente, tamano = 20, color, peso = "light", className }: PropsIcono) {
  return <Componente size={tamano} color={color} weight={peso} className={className} />;
}
