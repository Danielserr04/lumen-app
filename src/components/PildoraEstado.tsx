import "./PildoraEstado.css";

export type SeveridadPildora = "ok" | "warning" | "error" | "neutro" | "info";

const COLOR_POR_SEVERIDAD: Record<SeveridadPildora, string> = {
  ok: "74,222,168", // income
  warning: "255,194,75", // aviso
  error: "255,107,122", // gasto
  neutro: "255,255,255",
  info: "124,108,255", // primario-a
};

interface PropsPildoraEstado {
  texto: string;
  severidad?: SeveridadPildora;
}

/** Pill de estado tintada (§5.1 "Vas bien" / "Cuidado" / "Te queda poco", §5.4 pendiente…). */
export function PildoraEstado({ texto, severidad = "neutro" }: PropsPildoraEstado) {
  const rgb = COLOR_POR_SEVERIDAD[severidad];
  return (
    <span
      className="pildora-estado"
      style={{
        color: severidad === "neutro" ? "var(--color-texto-soft)" : `rgb(${rgb})`,
        borderColor: `rgba(${rgb},${severidad === "neutro" ? 0.15 : 0.4})`,
        background: `rgba(${rgb},${severidad === "neutro" ? 0.05 : 0.08})`,
      }}
    >
      {texto}
    </span>
  );
}
