/**
 * Wrapper fino sobre @phosphor-icons/react para mantener el trazo fino ("light")
 * por defecto y "fill" para el ítem activo, tal como pide el §4 del handoff.
 *
 * Aquí vive además el registro de iconos por nombre. Existe por una razón concreta: los
 * iconos llegan como cadena kebab-case desde el backend (`category.icon`, el `icono` de un
 * insight…), así que hay que resolverlos en tiempo de ejecución. Antes eso se hacía con
 * `import * as PhosphorIcons` y un acceso por clave, lo que obligaba al bundler a incluir
 * la librería ENTERA — varios miles de iconos, ~4,5 MB de los 5,3 MB del bundle. Con el mapa
 * explícito solo entra lo que se usa de verdad.
 *
 * Si añades un icono nuevo a `theme/tokens.ts`, a la semilla del backend o a una lista de
 * selección, regístralo aquí también o saldrá el de reserva.
 */
import {
  AirplaneTilt, ArrowDownLeft, ArrowUpRight, ArrowsClockwise, Baby, BookOpen, CalendarBlank,
  Car, ChartPieSlice, Cigarette, Confetti, CreditCard, DeviceMobile, DotsThree, DotsThreeCircle,
  ForkKnife, GasPump, Gift, GraduationCap, HandCoins, Heart, Heartbeat, HouseLine, Laptop,
  PawPrint, PiggyBank, Popcorn, Repeat, Storefront, TShirt, Ticket, Warning,
} from "@phosphor-icons/react";
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

/** Nombre kebab-case (el del contrato) → componente. */
const REGISTRO: Record<string, Icon> = {
  "airplane-tilt": AirplaneTilt,
  "arrow-down-left": ArrowDownLeft,
  "arrow-up-right": ArrowUpRight,
  "arrows-clockwise": ArrowsClockwise,
  baby: Baby,
  "book-open": BookOpen,
  "calendar-blank": CalendarBlank,
  car: Car,
  "chart-pie-slice": ChartPieSlice,
  cigarette: Cigarette,
  confetti: Confetti,
  "credit-card": CreditCard,
  "device-mobile": DeviceMobile,
  "dots-three": DotsThree,
  "dots-three-circle": DotsThreeCircle,
  "fork-knife": ForkKnife,
  "gas-pump": GasPump,
  gift: Gift,
  "graduation-cap": GraduationCap,
  "hand-coins": HandCoins,
  heart: Heart,
  heartbeat: Heartbeat,
  "house-line": HouseLine,
  laptop: Laptop,
  "paw-print": PawPrint,
  "piggy-bank": PiggyBank,
  popcorn: Popcorn,
  repeat: Repeat,
  storefront: Storefront,
  "t-shirt": TShirt,
  ticket: Ticket,
  warning: Warning,
};

/** Icono de reserva: el mismo de la categoría "Otros", para no dejar un hueco vacío. */
export const ICONO_POR_DEFECTO: Icon = DotsThreeCircle;

/** Resuelve un icono por su nombre del contrato. Nunca devuelve undefined. */
export function iconoPorNombre(nombre: string | null | undefined): Icon {
  if (!nombre) return ICONO_POR_DEFECTO;
  return REGISTRO[nombre] ?? ICONO_POR_DEFECTO;
}
