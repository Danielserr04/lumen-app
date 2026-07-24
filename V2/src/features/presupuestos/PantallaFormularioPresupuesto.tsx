import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CaretDown } from "@phosphor-icons/react";
import { CabeceraPantalla } from "@/components/CabeceraPantalla";
import { FilaSeleccion } from "@/components/campos/FilaSeleccion";
import { Slider } from "@/components/campos/Slider";
import { EtiquetaCampo } from "@/components/campos/EtiquetaCampo";
import { CajaInsight } from "@/components/campos/CajaInsight";
import { Boton } from "@/components/Boton";
import { listaCategorias } from "@/theme/tokens";
import { formatearEurosSinDecimales } from "@/lib/formato";
import { apiPresupuestos } from "@/mocks/api";
import { usarToasts } from "@/lib/ContextoToasts";
import { usarCategorias } from "@/lib/usarCategorias";
import { iconoPorNombre } from "@/lib/iconos";
import "../movimientos/FormularioMovimiento.css";
import "./FormularioPresupuesto.css";

/** Nuevo/Editar presupuesto (§12.3): selector de categoría, límite mensual con slider, umbral de aviso. */
export function PantallaFormularioPresupuesto() {
  const navigate = useNavigate();
  const { mostrar } = usarToasts();
  const { idPorToken } = usarCategorias();
  const [indiceCategoria, setIndiceCategoria] = useState(2); // Ocio por defecto, como el prototipo
  const [limite, setLimite] = useState(11000);
  const [umbral, setUmbral] = useState(0.8);
  const [guardando, setGuardando] = useState(false);

  const categoria = listaCategorias[indiceCategoria];
  const ComponenteIcono = iconoPorNombre(categoria.icono);

  async function guardar() {
    const idCategoria = idPorToken(categoria.id);
    if (!idCategoria) {
      mostrar("error", "No se ha podido resolver la categoría");
      return;
    }
    setGuardando(true);
    try {
      await apiPresupuestos.crear({
        category_id: idCategoria,
        limit_amount: limite,
        period: "monthly",
        alert_threshold: umbral,
        start_date: new Date().toISOString(),
      });
      mostrar("exito", "Presupuesto creado");
      navigate(-1);
    } catch (e) {
      mostrar("error", e instanceof Error ? e.message : "No se pudo crear el presupuesto");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="pantalla pantalla--formulario">
      <div className="blob-decorativo" style={{ top: -120, right: -40, background: "radial-gradient(circle, rgba(66,208,244,0.16), transparent 65%)" }} />
      <CabeceraPantalla titulo="Nuevo presupuesto" navegacion="volver" onNavegar={() => navigate(-1)} />

      <div className="formulario-movimiento__campo">
        <EtiquetaCampo>Categoría</EtiquetaCampo>
        <div
          className="formulario-presupuesto__selector-categoria"
          style={{ borderColor: `${categoria.color}80`, background: `${categoria.color}14` }}
          onClick={() => setIndiceCategoria((i) => (i + 1) % listaCategorias.length)}
        >
          {ComponenteIcono && <ComponenteIcono size={20} weight="light" color={categoria.color} />}
          <span style={{ flex: 1 }}>{categoria.nombre}</span>
          <CaretDown size={14} color="var(--color-texto-muted)" />
        </div>
      </div>

      <div className="formulario-presupuesto__importe">
        <EtiquetaCampo>Límite mensual</EtiquetaCampo>
        <span className="formulario-presupuesto__cifra">{formatearEurosSinDecimales(limite)}</span>
      </div>
      <Slider valor={limite} onCambiar={setLimite} min={2000} max={100000} step={1000} />

      <div className="formulario-movimiento__filas">
        <FilaSeleccion etiqueta="Periodo" valor="Mensual" />
        <FilaSeleccion
          etiqueta="Aviso al llegar a"
          valor={`${Math.round(umbral * 100)}%`}
          onClick={() => setUmbral((u) => (u >= 0.95 ? 0.5 : u + 0.1))}
        />
      </div>

      <CajaInsight texto="Ajusta el límite según tu gasto histórico en esta categoría; podrás cambiarlo cuando quieras." />

      <div className="pantalla__cta-anclado">
        <Boton variante="primario" anchoCompleto onClick={guardar} disabled={guardando}>
          {guardando ? "Guardando…" : "Crear presupuesto"}
        </Boton>
      </div>
    </div>
  );
}
