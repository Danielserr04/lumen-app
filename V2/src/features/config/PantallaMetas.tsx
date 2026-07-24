import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, PiggyBank } from "@phosphor-icons/react";
import { CabeceraPantalla } from "@/components/CabeceraPantalla";
import { TarjetaGlass } from "@/components/TarjetaGlass";
import { IconoConHalo } from "@/components/IconoConHalo";
import { BarraProgreso } from "@/components/BarraProgreso";
import { EstadoVacio } from "@/components/EstadoVacio";
import { Boton } from "@/components/Boton";
import { ImporteInput } from "@/components/campos/ImporteInput";
import { HojaInferior } from "@/components/Retroalimentacion";
import { formatearEuros, formatearPorcentaje } from "@/lib/formato";
import { apiMetas, apiNotificaciones } from "@/mocks/api";
import { usarToasts } from "@/lib/ContextoToasts";
import { mostrarNotificacionesComoToast } from "@/lib/notificarToast";
import type { SavingsGoal } from "@/types/entidades";
import "./Config.css";
import "./Metas.css";

/** Metas de ahorro (§5.12.4): objetivo, progreso, fecha límite y aportación por meta. */
export function PantallaMetas() {
  const navigate = useNavigate();
  const { mostrar } = usarToasts();
  const [metas, setMetas] = useState<SavingsGoal[]>([]);
  const [metaAportando, setMetaAportando] = useState<SavingsGoal | null>(null);
  const [importeTexto, setImporteTexto] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    apiMetas.listar().then(setMetas);
  }, []);

  async function confirmarAportacion() {
    if (!metaAportando) return;
    const limpio = importeTexto.replace(/\./g, "").replace(",", ".");
    const centimos = Math.round(Number.parseFloat(limpio || "0") * 100);
    if (centimos <= 0) return;
    setGuardando(true);
    try {
      await apiMetas.aportar(metaAportando.id, centimos);
      const nuevas = await apiNotificaciones.drenarNuevas();
      if (nuevas.length > 0) {
        mostrarNotificacionesComoToast(mostrar, nuevas);
      } else {
        mostrar("exito", `Has aportado ${formatearEuros(centimos)} a ${metaAportando.name}`);
      }
      setMetaAportando(null);
      setImporteTexto("");
      apiMetas.listar().then(setMetas);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="pantalla">
      <CabeceraPantalla
        titulo="Metas de ahorro"
        navegacion="volver"
        onNavegar={() => navigate(-1)}
        accionDerecha={
          <span className="formulario-movimiento__guardar-texto" onClick={() => navigate("/config/metas/nueva")}>
            <Plus size={16} style={{ verticalAlign: "middle" }} /> Nueva
          </span>
        }
      />

      {metas.length === 0 ? (
        <EstadoVacio icono={Plus} titulo="Sin metas todavía" descripcion="Crea una meta de ahorro para hacer seguimiento de tu objetivo." accion={{ texto: "Nueva meta", icono: Plus, onClick: () => navigate("/config/metas/nueva") }} />
      ) : (
        metas.map((meta) => {
          const fraccion = meta.target_amount > 0 ? meta.current_amount / meta.target_amount : 0;
          const cumplida = meta.current_amount >= meta.target_amount;
          return (
            <TarjetaGlass key={meta.id} className="meta-tarjeta">
              <div className="meta-tarjeta__cabecera">
                <IconoConHalo icono={meta.icon} color={meta.color} tamano={44} radio={10} />
                <div className="meta-tarjeta__texto">
                  <span className="meta-tarjeta__nombre">{meta.name}</span>
                  {meta.deadline && <span className="meta-tarjeta__fecha">Hasta {new Date(meta.deadline).toLocaleDateString("es-ES", { month: "long", year: "numeric" })}</span>}
                </div>
                <span className="meta-tarjeta__porcentaje">{formatearPorcentaje(fraccion)}</span>
              </div>
              <BarraProgreso fraccion={fraccion} degradado={`linear-gradient(90deg, ${meta.color}, #42D0F4)`} />
              <div className="meta-tarjeta__pie">
                <span>{formatearEuros(meta.current_amount)}</span>
                <span>de {formatearEuros(meta.target_amount)}</span>
              </div>
              {!cumplida && (
                <Boton variante="secundario" tamano="pequeno" anchoCompleto onClick={() => setMetaAportando(meta)}>
                  <PiggyBank size={14} /> Añadir aportación
                </Boton>
              )}
            </TarjetaGlass>
          );
        })
      )}

      {metaAportando && (
        <HojaInferior onCerrar={() => setMetaAportando(null)}>
          <span className="meta-hoja__titulo">Aportar a {metaAportando.name}</span>
          <ImporteInput valorTexto={importeTexto} onCambiar={setImporteTexto} pista="Cuánto quieres aportar" />
          <Boton variante="primario" anchoCompleto onClick={confirmarAportacion} disabled={guardando}>
            {guardando ? "Guardando…" : "Confirmar aportación"}
          </Boton>
        </HojaInferior>
      )}
    </div>
  );
}
