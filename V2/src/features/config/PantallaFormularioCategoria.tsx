import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CabeceraPantalla } from "@/components/CabeceraPantalla";
import { IconoConHalo } from "@/components/IconoConHalo";
import { ToggleSegmentado } from "@/components/ToggleSegmentado";
import { CampoTexto } from "@/components/campos/CampoTexto";
import { EtiquetaCampo } from "@/components/campos/EtiquetaCampo";
import { Boton } from "@/components/Boton";
import { apiCategorias } from "@/mocks/api";
import { usarToasts } from "@/lib/ContextoToasts";
import "../movimientos/FormularioMovimiento.css";
import "./FormularioCategoria.css";
import { iconoPorNombre } from "@/lib/iconos";

const ICONOS_DISPONIBLES = [
  "fork-knife", "gas-pump", "popcorn", "arrows-clockwise", "heartbeat", "dots-three-circle",
  "airplane-tilt", "gift", "book-open", "paw-print", "house-line", "baby",
];
const COLORES_DISPONIBLES = ["#FFA35C", "#5CB3FF", "#B78CFF", "#FF7FC4", "#4FD9D0", "#98A2B8", "#4ADEA8", "#FF6B7A"];

/** Nueva/Editar categoría (§12.6): nombre, icono, color, tipo — con preview en vivo. */
export function PantallaFormularioCategoria() {
  const navigate = useNavigate();
  const { mostrar } = usarToasts();
  const [nombre, setNombre] = useState("");
  const [icono, setIcono] = useState(ICONOS_DISPONIBLES[0]);
  const [color, setColor] = useState(COLORES_DISPONIBLES[0]);
  const [tipo, setTipo] = useState<"expense" | "income">("expense");
  const [guardando, setGuardando] = useState(false);

  function hexARgb(hex: string): string {
    const n = parseInt(hex.replace("#", ""), 16);
    return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
  }

  async function guardar() {
    if (!nombre.trim()) return;
    setGuardando(true);
    await apiCategorias.crear({ name: nombre, icon: icono, color, tint: hexARgb(color), kind: tipo, sort_order: 99 });
    mostrar("exito", "Categoría guardada");
    navigate(-1);
  }

  return (
    <div className="pantalla pantalla--formulario">
      <CabeceraPantalla titulo="Nueva categoría" navegacion="volver" onNavegar={() => navigate(-1)} />

      <div className="formulario-categoria__preview">
        <IconoConHalo icono={icono} color={color} tamano={52} radio={12} tamanoIcono={24} />
        <span>{nombre || "Nombre de la categoría"}</span>
      </div>

      <div className="formulario-movimiento__campo">
        <EtiquetaCampo>Nombre</EtiquetaCampo>
        <CampoTexto placeholder="Ej. Mascotas" value={nombre} onChange={(e) => setNombre(e.target.value)} />
      </div>

      <div className="formulario-movimiento__campo">
        <EtiquetaCampo>Tipo</EtiquetaCampo>
        <ToggleSegmentado
          valor={tipo}
          onCambiar={setTipo}
          opciones={[
            { valor: "expense", etiqueta: "Gasto", tint: "255,107,122" },
            { valor: "income", etiqueta: "Ingreso", tint: "74,222,168" },
          ]}
        />
      </div>

      <div className="formulario-movimiento__campo">
        <EtiquetaCampo>Icono</EtiquetaCampo>
        <div className="formulario-categoria__grid-iconos">
          {ICONOS_DISPONIBLES.map((nombreIcono) => {
            const Comp = iconoPorNombre(nombreIcono);
            const seleccionado = icono === nombreIcono;
            return (
              <button
                key={nombreIcono}
                type="button"
                className={`formulario-categoria__icono-opcion ${seleccionado ? "formulario-categoria__icono-opcion--activo" : ""}`}
                style={seleccionado ? { borderColor: `${color}80`, background: `${color}1F` } : undefined}
                onClick={() => setIcono(nombreIcono)}
              >
                {Comp && <Comp size={19} weight="light" color={seleccionado ? color : "#8B93A7"} />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="formulario-movimiento__campo">
        <EtiquetaCampo>Color</EtiquetaCampo>
        <div className="formulario-categoria__grid-colores">
          {COLORES_DISPONIBLES.map((c) => (
            <button
              key={c}
              type="button"
              className="formulario-categoria__color-opcion"
              style={{ background: c, outline: color === c ? `2px solid ${c}` : "none", outlineOffset: 2 }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
      </div>

      <div className="pantalla__cta-anclado">
        <Boton variante="primario" anchoCompleto onClick={guardar} disabled={guardando || !nombre.trim()}>
          Guardar categoría
        </Boton>
      </div>
    </div>
  );
}
