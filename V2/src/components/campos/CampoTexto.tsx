import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import "./Campos.css";

interface PropsCampoTexto extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

/** Campo de texto de una línea con el estilo glass estándar (§4). */
export function CampoTexto({ error, className, ...resto }: PropsCampoTexto) {
  return <input className={`campo-texto ${error ? "campo-texto--error" : ""} ${className ?? ""}`} {...resto} />;
}

interface PropsAreaTexto extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

/** Textarea con el mismo estilo, usada para notas opcionales. */
export function AreaTexto({ error, className, ...resto }: PropsAreaTexto) {
  return <textarea className={`campo-texto ${error ? "campo-texto--error" : ""} ${className ?? ""}`} rows={2} {...resto} />;
}
