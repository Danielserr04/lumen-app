import { Lightbulb, CheckCircle, Warning } from "@phosphor-icons/react";
import "./Campos.css";

type VarianteInsight = "info" | "exito" | "aviso";

interface PropsCajaInsight {
  texto: string;
  variante?: VarianteInsight;
}

const ICONO_POR_VARIANTE = { info: Lightbulb, exito: CheckCircle, aviso: Warning } as const;
const COLOR_POR_VARIANTE: Record<VarianteInsight, string> = {
  info: "#42D0F4",
  exito: "#4ADEA8",
  aviso: "#FFC24B",
};

/** Caja de insight/ayuda (bombilla índigo por defecto, check verde en éxito, warning en aviso). */
export function CajaInsight({ texto, variante = "info" }: PropsCajaInsight) {
  const Icono = ICONO_POR_VARIANTE[variante];
  const clase =
    variante === "exito" ? "caja-insight--exito" : variante === "aviso" ? "caja-insight--aviso" : "";
  return (
    <div className={`caja-insight ${clase}`}>
      <Icono size={18} weight="light" color={COLOR_POR_VARIANTE[variante]} />
      <span className="caja-insight__texto">{texto}</span>
    </div>
  );
}
