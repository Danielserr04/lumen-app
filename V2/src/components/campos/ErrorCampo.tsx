import { WarningCircle } from "@phosphor-icons/react";
import "./Campos.css";

/** Mensaje de validación inline (§4/§13.2): rojo, icono de aviso, 11px. */
export function ErrorCampo({ mensaje }: { mensaje: string }) {
  return (
    <span className="error-campo">
      <WarningCircle size={13} />
      {mensaje}
    </span>
  );
}
