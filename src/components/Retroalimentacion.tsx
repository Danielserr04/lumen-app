import type { ReactNode } from "react";
import { CheckCircle, WarningCircle, Info, ArrowCounterClockwise, Warning } from "@phosphor-icons/react";
import "./Retroalimentacion.css";

/* Componentes del §13: toasts efímeros, banners persistentes y modal de confirmación. */

export type TipoToast = "exito" | "error" | "info" | "deshacer";

const ICONO_TOAST = { exito: CheckCircle, error: WarningCircle, info: Info, deshacer: ArrowCounterClockwise };
const COLOR_TOAST: Record<TipoToast, string> = {
  exito: "var(--color-ingreso)",
  error: "var(--color-gasto)",
  info: "var(--color-primario-link)",
  deshacer: "var(--color-texto)",
};

interface PropsToast {
  tipo: TipoToast;
  mensaje: string;
  accion?: { texto: string; onClick: () => void };
}

/** Toast efímero (3–4s), esquina/inferior. La lógica de auto-cierre vive en el hook `useToasts`. */
export function Toast({ tipo, mensaje, accion }: PropsToast) {
  const Icono = ICONO_TOAST[tipo];
  return (
    <div className="toast" role="status">
      <Icono size={18} color={COLOR_TOAST[tipo]} weight={tipo === "exito" ? "fill" : "light"} />
      <span>{mensaje}</span>
      {accion && (
        <button type="button" className="toast__accion" onClick={accion.onClick}>
          {accion.texto}
        </button>
      )}
    </div>
  );
}

export type SeveridadBanner = "offline" | "aviso" | "error";
const ICONO_BANNER = { offline: WarningCircle, aviso: Warning, error: Warning };

interface PropsBanner {
  severidad: SeveridadBanner;
  texto: string;
  accion?: { texto: string; onClick: () => void };
}

/** Banner persistente de cabecera (§13.3): offline, cuenta desconectada, presupuesto superado. */
export function Banner({ severidad, texto, accion }: PropsBanner) {
  const Icono = ICONO_BANNER[severidad];
  return (
    <div className={`banner banner--${severidad}`}>
      <Icono size={16} />
      <span className="banner__texto">{texto}</span>
      {accion && (
        <button type="button" className="banner__accion" onClick={accion.onClick}>
          {accion.texto}
        </button>
      )}
    </div>
  );
}

interface PropsModalConfirmacion {
  titulo: string;
  cuerpo: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  destructivo?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

/** Modal de confirmación (§13.4): overlay glass, título + cuerpo + 2 botones. */
export function ModalConfirmacion({
  titulo,
  cuerpo,
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  destructivo = false,
  onConfirmar,
  onCancelar,
}: PropsModalConfirmacion) {
  return (
    <div className="modal-confirmacion__overlay" onClick={onCancelar}>
      <div className="modal-confirmacion" onClick={(e) => e.stopPropagation()}>
        <span className="modal-confirmacion__titulo">{titulo}</span>
        <span className="modal-confirmacion__cuerpo">{cuerpo}</span>
        <div className="modal-confirmacion__botones">
          <button type="button" className="boton boton--secundario boton--medio" onClick={onCancelar}>
            {textoCancelar}
          </button>
          <button
            type="button"
            className={`boton boton--medio ${destructivo ? "boton--destructivo" : "boton--primario"}`}
            onClick={onConfirmar}
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Overlay simple para hojas inferiores (bottom sheets) de filtros, selectores, etc. */
export function HojaInferior({ children, onCerrar }: { children: ReactNode; onCerrar: () => void }) {
  return (
    <div className="hoja-inferior__overlay" onClick={onCerrar}>
      <div className="hoja-inferior" onClick={(e) => e.stopPropagation()}>
        <div className="hoja-inferior__manija" />
        {children}
      </div>
    </div>
  );
}
