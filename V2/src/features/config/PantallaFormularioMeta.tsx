import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as PhosphorIcons from "@phosphor-icons/react";
import { CabeceraPantalla } from "@/components/CabeceraPantalla";
import { IconoConHalo } from "@/components/IconoConHalo";
import { ImporteInput } from "@/components/campos/ImporteInput";
import { FilaSeleccion } from "@/components/campos/FilaSeleccion";
import { CampoTexto } from "@/components/campos/CampoTexto";
import { EtiquetaCampo } from "@/components/campos/EtiquetaCampo";
import { Calendario } from "@/components/Calendario";
import { HojaInferior } from "@/components/Retroalimentacion";
import { Boton } from "@/components/Boton";
import { apiMetas } from "@/mocks/api";
import { usarToasts } from "@/lib/ContextoToasts";
import "../movimientos/FormularioMovimiento.css";
import "../config/FormularioCategoria.css";
import "./Metas.css";

const COLORES = ["#42D0F4", "#4ADEA8", "#7C6CFF", "#FF7FC4", "#FFC24B"];

/** Iconos pensados para metas de ahorro: viajes, objetos, ropa, ocio… (§12.7, ampliado a petición del usuario). */
const ICONOS_META = [
  "piggy-bank",
  "airplane-tilt",
  "t-shirt",
  "ticket",
  "device-mobile",
  "house-line",
  "car",
  "gift",
  "graduation-cap",
  "heart",
  "paw-print",
  "laptop",
];

function nombreComponenteIcono(kebab: string): string {
  return kebab.split("-").map((p) => p[0].toUpperCase() + p.slice(1)).join("");
}

function formatearFechaLimite(fecha: Date): string {
  return fecha.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
}

/** Nueva/Editar meta de ahorro (§12.7): nombre, importe objetivo, fecha límite (calendario propio), color/icono. */
export function PantallaFormularioMeta() {
  const navigate = useNavigate();
  const { mostrar } = usarToasts();
  const [nombre, setNombre] = useState("");
  const [importeTexto, setImporteTexto] = useState("");
  const [icono, setIcono] = useState(ICONOS_META[0]);
  const [color, setColor] = useState(COLORES[0]);
  const [fechaLimite, setFechaLimite] = useState<Date | null>(null);
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [mesCalendario, setMesCalendario] = useState(new Date());
  const [guardando, setGuardando] = useState(false);

  async function guardar() {
    const limpio = importeTexto.replace(/\./g, "").replace(",", ".");
    const centimos = Math.round(Number.parseFloat(limpio || "0") * 100);
    if (!nombre.trim() || centimos <= 0) return;
    setGuardando(true);
    await apiMetas.crear({
      name: nombre,
      target_amount: centimos,
      deadline: fechaLimite ? fechaLimite.toISOString() : null,
      color,
      icon: icono,
    });
    mostrar("exito", "Meta creada");
    navigate(-1);
  }

  return (
    <div className="pantalla pantalla--formulario">
      <CabeceraPantalla titulo="Nueva meta" navegacion="volver" onNavegar={() => navigate(-1)} />

      <div className="formulario-categoria__preview">
        <IconoConHalo icono={icono} color={color} tamano={52} radio={12} tamanoIcono={24} />
        <span>{nombre || "Nombre de la meta"}</span>
      </div>

      <div className="formulario-movimiento__campo">
        <EtiquetaCampo>Nombre</EtiquetaCampo>
        <CampoTexto placeholder="Ej. Vacaciones" value={nombre} onChange={(e) => setNombre(e.target.value)} />
      </div>

      <ImporteInput valorTexto={importeTexto} onCambiar={setImporteTexto} pista="Importe objetivo" />

      <div className="formulario-movimiento__campo">
        <EtiquetaCampo>Icono</EtiquetaCampo>
        <div className="formulario-categoria__grid-iconos">
          {ICONOS_META.map((nombreIcono) => {
            const Comp = (PhosphorIcons as unknown as Record<string, PhosphorIcons.Icon>)[nombreComponenteIcono(nombreIcono)];
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
        <div style={{ display: "flex", gap: 10 }}>
          {COLORES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              style={{ width: 32, height: 32, borderRadius: "50%", background: c, border: "none", cursor: "pointer", outline: color === c ? `2px solid ${c}` : "none", outlineOffset: 2 }}
            />
          ))}
        </div>
      </div>

      <FilaSeleccion
        etiqueta="Fecha límite"
        valor={fechaLimite ? formatearFechaLimite(fechaLimite) : "Sin fecha (opcional)"}
        onClick={() => setMostrarCalendario(true)}
      />

      <div className="pantalla__cta-anclado">
        <Boton variante="primario" anchoCompleto onClick={guardar} disabled={guardando || !nombre.trim()}>
          Crear meta
        </Boton>
      </div>

      {mostrarCalendario && (
        <HojaInferior onCerrar={() => setMostrarCalendario(false)}>
          <span className="meta-hoja__titulo">Fecha límite</span>
          <Calendario
            mesVisible={mesCalendario}
            onCambiarMes={setMesCalendario}
            fechaInicio={fechaLimite}
            fechaFin={fechaLimite}
            onSeleccionarDia={(dia) => setFechaLimite(dia)}
          />
          <div className="meta-hoja__acciones-calendario">
            <Boton variante="secundario" onClick={() => { setFechaLimite(null); setMostrarCalendario(false); }}>
              Sin fecha
            </Boton>
            <Boton variante="primario" onClick={() => setMostrarCalendario(false)}>
              Listo
            </Boton>
          </div>
        </HojaInferior>
      )}
    </div>
  );
}
