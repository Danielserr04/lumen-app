import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Funnel, X, Receipt } from "@phosphor-icons/react";
import { CampoBusqueda } from "@/components/campos/CampoBusqueda";
import { FilaSeleccion } from "@/components/campos/FilaSeleccion";
import { TarjetaGlass } from "@/components/TarjetaGlass";
import { EtiquetaSeccion } from "@/components/EtiquetaSeccion";
import { FilaMovimiento } from "@/components/FilaMovimiento";
import { ChipCategoria } from "@/components/ChipCategoria";
import { Calendario, usarRangoFechas } from "@/components/Calendario";
import { Esqueleto } from "@/components/Esqueleto";
import { EstadoVacio } from "@/components/EstadoVacio";
import { HojaInferior } from "@/components/Retroalimentacion";
import { Boton } from "@/components/Boton";
import { agruparPorFecha } from "@/lib/formato";
import { usarCategorias } from "@/lib/usarCategorias";
import { listaCategorias } from "@/theme/tokens";
import { MAPA_ID_CATEGORIA_MOCK } from "@/lib/mapaCategorias";
import { apiMovimientos } from "@/mocks/api";
import type { Transaction } from "@/types/entidades";
import "./Movimientos.css";

type FiltroTipo = "todos" | "expense" | "income";

function formatearDiaMesCorto(fecha: Date): string {
  return fecha.toLocaleDateString("es-ES", { day: "numeric", month: "short" }).replace(".", "");
}

/** Movimientos (§5.3): lista completa + búsqueda + hoja de filtros (tipo, categoría y rango de fechas). */
export function PantallaMovimientos() {
  const navigate = useNavigate();
  const { visual } = usarCategorias();
  const [movimientos, setMovimientos] = useState<Transaction[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [tipo, setTipo] = useState<FiltroTipo>("todos");
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<Set<string>>(new Set());
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [mesCalendario, setMesCalendario] = useState(new Date());
  const { fechaInicio, fechaFin, seleccionarDia, limpiar: limpiarFechas } = usarRangoFechas();

  useEffect(() => {
    apiMovimientos.listar({}).then((lista) => {
      setMovimientos(lista);
      setCargando(false);
    });
  }, []);

  function alternarCategoria(idMock: string) {
    setCategoriasSeleccionadas((prev) => {
      const siguiente = new Set(prev);
      if (siguiente.has(idMock)) siguiente.delete(idMock);
      else siguiente.add(idMock);
      return siguiente;
    });
  }

  const filtrados = useMemo(() => {
    const finInclusive = fechaFin ? new Date(fechaFin.getFullYear(), fechaFin.getMonth(), fechaFin.getDate(), 23, 59, 59) : null;
    return movimientos.filter((tx) => {
      if (busqueda && !tx.name.toLowerCase().includes(busqueda.toLowerCase())) return false;
      if (tipo === "expense" && tx.amount >= 0) return false;
      if (tipo === "income" && tx.amount <= 0) return false;
      if (categoriasSeleccionadas.size > 0 && (!tx.category_id || !categoriasSeleccionadas.has(tx.category_id))) return false;
      const fechaTx = new Date(tx.date);
      if (fechaInicio && fechaTx < fechaInicio) return false;
      if (finInclusive && fechaTx > finInclusive) return false;
      return true;
    });
  }, [movimientos, busqueda, tipo, categoriasSeleccionadas, fechaInicio, fechaFin]);

  const grupos = useMemo(() => {
    const mapa = new Map<string, Transaction[]>();
    for (const tx of filtrados) {
      const clave = agruparPorFecha(tx.date);
      mapa.set(clave, [...(mapa.get(clave) ?? []), tx]);
    }
    return Array.from(mapa.entries());
  }, [filtrados]);

  const hayFiltrosActivos = busqueda.length > 0 || tipo !== "todos" || categoriasSeleccionadas.size > 0 || !!fechaInicio;

  function limpiarTodo() {
    setTipo("todos");
    setBusqueda("");
    setCategoriasSeleccionadas(new Set());
    limpiarFechas();
  }

  return (
    <div className="pantalla">
      <div className="blob-decorativo" style={{ top: -120, left: -40, background: "radial-gradient(circle, rgba(124,108,255,0.18), transparent 65%)" }} />
      <span className="movimientos-titulo">Movimientos</span>

      <div className="movimientos-buscador-fila">
        <div className="movimientos-buscador-fila__campo">
          <CampoBusqueda valor={busqueda} onCambiar={setBusqueda} />
        </div>
        <button
          type="button"
          className={`movimientos-boton-filtro ${hayFiltrosActivos ? "movimientos-boton-filtro--activo" : ""}`}
          onClick={() => setMostrarFiltros(true)}
        >
          <Funnel size={16} weight={hayFiltrosActivos ? "fill" : "light"} color={hayFiltrosActivos ? "#8F86FF" : "#8B93A7"} />
        </button>
      </div>

      {hayFiltrosActivos && (
        <div className="movimientos-chips-activos">
          {tipo !== "todos" && (
            <span className="movimientos-chip-activo">
              {tipo === "expense" ? "Gastos" : "Ingresos"}
              <X size={11} onClick={() => setTipo("todos")} />
            </span>
          )}
          {Array.from(categoriasSeleccionadas).map((idMock) => {
            const cat = listaCategorias.find((c) => MAPA_ID_CATEGORIA_MOCK[c.id] === idMock);
            return (
              <span key={idMock} className="movimientos-chip-activo">
                {cat?.nombre}
                <X size={11} onClick={() => alternarCategoria(idMock)} />
              </span>
            );
          })}
          {fechaInicio && (
            <span className="movimientos-chip-activo">
              {formatearDiaMesCorto(fechaInicio)}
              {fechaFin ? ` – ${formatearDiaMesCorto(fechaFin)}` : ""}
              <X size={11} onClick={limpiarFechas} />
            </span>
          )}
          {busqueda && (
            <span className="movimientos-chip-activo">
              “{busqueda}”
              <X size={11} onClick={() => setBusqueda("")} />
            </span>
          )}
          <span className="movimientos-chip-limpiar" onClick={limpiarTodo}>
            Limpiar
          </span>
        </div>
      )}

      {!cargando && (
        <EtiquetaSeccion>{`${filtrados.length} resultado${filtrados.length === 1 ? "" : "s"}`}</EtiquetaSeccion>
      )}

      {cargando ? (
        <TarjetaGlass padding="4px 6px">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="movimientos-esqueleto-fila">
              <Esqueleto ancho={38} alto={38} radio={10} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                <Esqueleto ancho="60%" alto={11} />
                <Esqueleto ancho="35%" alto={9} />
              </div>
            </div>
          ))}
        </TarjetaGlass>
      ) : filtrados.length === 0 ? (
        <EstadoVacio icono={Receipt} colorIcono="#8F86FF" titulo="Sin resultados" descripcion="No hay movimientos que coincidan con tu búsqueda o filtros." />
      ) : (
        grupos.map(([etiquetaGrupo, txs]) => (
          <div key={etiquetaGrupo} className="movimientos-grupo">
            <EtiquetaSeccion>{etiquetaGrupo}</EtiquetaSeccion>
            <TarjetaGlass padding="4px 6px">
              {txs.map((tx) => (
                <FilaMovimiento
                  key={tx.id}
                  nombre={tx.name}
                  fechaIso={tx.date}
                  amount={tx.amount}
                  categoria={visual(tx.category_id)}
                  compacta
                  onClick={() => navigate(`/movimientos/${tx.id}`)}
                />
              ))}
            </TarjetaGlass>
          </div>
        ))
      )}

      {mostrarFiltros && !mostrarCalendario && (
        <HojaInferior onCerrar={() => setMostrarFiltros(false)}>
          <span className="movimientos-hoja__titulo">Filtrar por</span>

          <div className="movimientos-hoja__grupo">
            <span className="movimientos-hoja__etiqueta">Tipo</span>
            <div className="movimientos-hoja__segmentos">
              {(["todos", "expense", "income"] as const).map((t) => (
                <span
                  key={t}
                  className={`movimientos-hoja__segmento ${tipo === t ? "movimientos-hoja__segmento--activo" : ""}`}
                  onClick={() => setTipo(t)}
                >
                  {t === "todos" ? "Todos" : t === "expense" ? "Gastos" : "Ingresos"}
                </span>
              ))}
            </div>
          </div>

          <div className="movimientos-hoja__grupo">
            <span className="movimientos-hoja__etiqueta">Categoría</span>
            <div className="movimientos-hoja__chips">
              {listaCategorias.map((cat) => (
                <ChipCategoria
                  key={cat.id}
                  categoria={cat}
                  seleccionada={categoriasSeleccionadas.has(MAPA_ID_CATEGORIA_MOCK[cat.id])}
                  onClick={() => alternarCategoria(MAPA_ID_CATEGORIA_MOCK[cat.id])}
                />
              ))}
            </div>
          </div>

          <div className="movimientos-hoja__grupo">
            <span className="movimientos-hoja__etiqueta">Fecha</span>
            <div className="movimientos-hoja__fechas">
              <FilaSeleccion etiqueta="Desde" valor={fechaInicio ? formatearDiaMesCorto(fechaInicio) : "Sin definir"} onClick={() => setMostrarCalendario(true)} />
              <FilaSeleccion etiqueta="Hasta" valor={fechaFin ? formatearDiaMesCorto(fechaFin) : "Sin definir"} onClick={() => setMostrarCalendario(true)} />
            </div>
          </div>

          <Boton variante="primario" anchoCompleto onClick={() => setMostrarFiltros(false)}>
            Aplicar filtros
          </Boton>
        </HojaInferior>
      )}

      {mostrarCalendario && (
        <HojaInferior onCerrar={() => setMostrarCalendario(false)}>
          <span className="movimientos-hoja__titulo">Elige un rango de fechas</span>
          <span className="movimientos-hoja__ayuda">
            {fechaInicio && !fechaFin ? "Ahora toca la fecha de fin" : "Toca la fecha de inicio"}
          </span>
          <Calendario mesVisible={mesCalendario} onCambiarMes={setMesCalendario} fechaInicio={fechaInicio} fechaFin={fechaFin} onSeleccionarDia={seleccionarDia} />
          <div className="movimientos-hoja__acciones-calendario">
            <Boton variante="secundario" onClick={limpiarFechas}>
              Limpiar
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
