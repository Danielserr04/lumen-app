import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ArrowDownLeft, ArrowUpRight, Plus, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { TarjetaGlass } from "@/components/TarjetaGlass";
import { TarjetaAviso } from "@/components/TarjetaAviso";
import { FabExpandible } from "@/components/FabExpandible";
import { Banner } from "@/components/Retroalimentacion";
import { PildoraEstado } from "@/components/PildoraEstado";
import { BarraProgreso } from "@/components/BarraProgreso";
import { FilaMovimiento } from "@/components/FilaMovimiento";
import { Esqueleto } from "@/components/Esqueleto";
import { EstadoVacio } from "@/components/EstadoVacio";
import { GraficoLinea } from "@/components/graficos/GraficoLinea";
import { Sparkline } from "@/components/graficos/Sparkline";
import { formatearEuros, formatearMesAnio, formatearPorcentaje } from "@/lib/formato";
import { periodoActual } from "@/lib/periodo";
import { apiAnalitica, apiMovimientos, apiNotificaciones, apiPresupuestos } from "@/mocks/api";
import { usarCategorias } from "@/lib/usarCategorias";
import { trazarLineaSuave, puntoFinal } from "@/lib/trazarLinea";
import { historicoMensual } from "@/mocks/data/historico";
import type { ResumenMensual } from "@/lib/derivar";
import type { Transaction, BudgetDerivado, Recurring } from "@/types/entidades";
import "./Dashboard.css";

const VALORES_BALANCE = historicoMensual.map((p) => p.balanceDisponible);
const ETIQUETAS_HISTORICO = historicoMensual.map((p) => p.etiqueta);
const VARIACION_BALANCE = Math.round(
  ((VALORES_BALANCE[VALORES_BALANCE.length - 1] - VALORES_BALANCE[0]) / VALORES_BALANCE[0]) * 100,
);

const ETIQUETA_ESTADO = { ok: "Vas bien", warning: "Cuidado", over: "Te queda poco" } as const;
const SEVERIDAD_ESTADO = { ok: "ok", warning: "warning", over: "error" } as const;
const DEGRADADO_ESTADO = {
  ok: "linear-gradient(90deg,#7C6CFF,#42D0F4)",
  warning: "linear-gradient(90deg,#FFC24B,#FFD98A)",
  over: "linear-gradient(90deg,#FF6B7A,#FF9AA5)",
} as const;

/** Dashboard (§5.1): tarjeta de balance mensual, mini-cards ingresos/gastos, aviso y últimos movimientos. */
export function PantallaDashboard() {
  const navigate = useNavigate();
  const [resumen, setResumen] = useState<ResumenMensual | null>(null);
  const [recientes, setRecientes] = useState<Transaction[]>([]);
  const [presupuestos, setPresupuestos] = useState<BudgetDerivado[]>([]);
  const [proximosCargos, setProximosCargos] = useState<Recurring[]>([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [cargando, setCargando] = useState(true);
  const { visual, porId } = usarCategorias();
  const [online, setOnline] = useState(navigator.onLine);
  const [desfaseMeses, setDesfaseMeses] = useState(0);

  const fechaMes = (() => {
    const f = new Date();
    f.setDate(1);
    f.setMonth(f.getMonth() + desfaseMeses);
    return f;
  })();

  useEffect(() => {
    const marcarOnline = () => setOnline(true);
    const marcarOffline = () => setOnline(false);
    window.addEventListener("online", marcarOnline);
    window.addEventListener("offline", marcarOffline);
    return () => {
      window.removeEventListener("online", marcarOnline);
      window.removeEventListener("offline", marcarOffline);
    };
  }, []);

  useEffect(() => {
    const periodo = periodoActual(fechaMes);
    setCargando(true);
    Promise.all([
      apiAnalitica.resumen(periodo),
      apiMovimientos.listar({}),
      apiNotificaciones.contarNoLeidas(),
      apiPresupuestos.listar(periodo),
      apiAnalitica.recurrentesProximos(),
    ]).then(([r, movs, contador, presu, proximos]) => {
      setResumen(r);
      setRecientes(movs.filter((m) => periodoActual(new Date(m.date)) === periodo).slice(0, 4));
      setNoLeidas(contador);
      setPresupuestos(presu);
      setProximosCargos(proximos);
      setCargando(false);
    });
  }, [desfaseMeses]);

  const presupuestoSuperado = presupuestos.find((b) => b.state === "over");
  const presupuestoAjustado = !presupuestoSuperado ? presupuestos.find((b) => b.state === "warning") : undefined;
  const cargoInminente = proximosCargos.find((r) => {
    const dias = (new Date(r.next_charge_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return dias >= 0 && dias <= 2;
  });

  return (
    <div className="pantalla">
      <div className="blob-decorativo" style={{ top: -130, left: -70, background: "radial-gradient(circle, rgba(124,108,255,0.18), transparent 65%)" }} />
      {!online && <Banner severidad="offline" texto="Sin conexión · mostrando datos guardados" />}
      <div className="dashboard-cabecera">
        <div className="dashboard-saludo">
          <span className="dashboard-saludo__hola">Hola, Marta</span>
          <div className="dashboard-saludo__selector-mes">
            <button
              type="button"
              className="dashboard-saludo__flecha"
              aria-label="Mes anterior"
              onClick={() => setDesfaseMeses((d) => d - 1)}
            >
              <CaretLeft size={12} weight="bold" />
            </button>
            <span className="dashboard-saludo__mes">{formatearMesAnio(fechaMes)}</span>
            <button
              type="button"
              className="dashboard-saludo__flecha"
              aria-label="Mes siguiente"
              disabled={desfaseMeses >= 0}
              onClick={() => setDesfaseMeses((d) => Math.min(0, d + 1))}
            >
              <CaretRight size={12} weight="bold" />
            </button>
          </div>
        </div>
        <button type="button" className="dashboard-campana" onClick={() => navigate("/notificaciones")}>
          <Bell size={18} color="#A9B0C0" />
          {noLeidas > 0 && <span className="dashboard-campana__badge">{noLeidas}</span>}
        </button>
      </div>

      {cargando || !resumen ? (
        <TarjetaGlass fondo="var(--degradado-primario-fondo)">
          <Esqueleto alto={14} ancho="40%" />
          <Esqueleto alto={40} ancho="60%" />
          <Esqueleto alto={4} />
        </TarjetaGlass>
      ) : (
        <TarjetaGlass fondo="var(--degradado-primario-fondo)">
          <div className="dashboard-balance__cabecera">
            <span className="dashboard-balance__etiqueta">Disponible</span>
            <PildoraEstado texto={ETIQUETA_ESTADO[resumen.estado]} severidad={SEVERIDAD_ESTADO[resumen.estado]} />
          </div>
          <span className="dashboard-balance__cifra">{formatearEuros(resumen.disponible)}</span>
          <div className="dashboard-balance__progreso">
            <BarraProgreso fraccion={resumen.porcentajeGastado} degradado={DEGRADADO_ESTADO[resumen.estado]} />
            <div className="dashboard-balance__pie">
              <span>{formatearPorcentaje(resumen.porcentajeGastado)} gastado</span>
              <span>de {formatearEuros(resumen.presupuestoTotal)}</span>
            </div>
          </div>
        </TarjetaGlass>
      )}

      {!cargando && resumen && (
        <div className="dashboard-minicards">
          <TarjetaGlass fondo="rgba(74,222,168,0.05)" className="dashboard-minicard dashboard-minicard--ingreso">
            <Sparkline valores={historicoMensual.map((p) => p.ingresos)} color="#4ADEA8" />
            <div className="dashboard-minicard__linea">
              <ArrowDownLeft size={13} color="#4ADEA8" />
              <span>Ingresos</span>
            </div>
            <span className="dashboard-minicard__cifra" style={{ color: "var(--color-ingreso)" }}>
              {formatearEuros(resumen.ingresos)}
            </span>
          </TarjetaGlass>
          <TarjetaGlass fondo="rgba(255,107,122,0.05)" className="dashboard-minicard dashboard-minicard--gasto">
            <Sparkline valores={historicoMensual.map((p) => p.gastos)} color="#FF6B7A" />
            <div className="dashboard-minicard__linea">
              <ArrowUpRight size={13} color="#FF6B7A" />
              <span>Gastos</span>
            </div>
            <span className="dashboard-minicard__cifra" style={{ color: "var(--color-gasto)" }}>
              {formatearEuros(resumen.gastos)}
            </span>
          </TarjetaGlass>
        </div>
      )}

      {/* Tarjetas de aviso (§4 "04 · Tarjeta de aviso") — reales, no ejemplos fijos. */}
      {presupuestoSuperado && (
        <TarjetaAviso
          icono="warning"
          color="#FF6B7A"
          titulo={`Has superado tu presupuesto de ${porId(presupuestoSuperado.category_id)?.name ?? "una categoría"}`}
          cuerpo={`Llevas ${formatearEuros(presupuestoSuperado.spent)} de ${formatearEuros(presupuestoSuperado.limit_amount)} este mes.`}
          onClick={() => navigate("/movimientos")}
        />
      )}
      {presupuestoAjustado && (
        <TarjetaAviso
          icono="warning"
          color="#FFC24B"
          titulo={`Cerca del límite en ${porId(presupuestoAjustado.category_id)?.name ?? "una categoría"}`}
          cuerpo={`Vas por el ${formatearPorcentaje(presupuestoAjustado.percent)} de tu presupuesto este mes.`}
          onClick={() => navigate("/movimientos")}
        />
      )}
      {cargoInminente && (
        <TarjetaAviso
          icono="calendar-blank"
          color="#FF6B7A"
          titulo={`${cargoInminente.name} se cobra pronto`}
          cuerpo={`${formatearEuros(Math.abs(cargoInminente.amount))} el ${new Date(cargoInminente.next_charge_date).getDate()} de ${new Date(cargoInminente.next_charge_date).toLocaleDateString("es-ES", { month: "long" })}.`}
          onClick={() => navigate("/recurrentes")}
        />
      )}

      {!cargando && (
        <TarjetaGlass
          animada
          fondo="linear-gradient(120deg, rgba(124,108,255,0.18), rgba(143,134,255,0.10) 40%, rgba(66,208,244,0.14) 75%)"
          className="dashboard-linea"
        >
          <div className="dashboard-linea__cabecera">
            <span className="dashboard-linea__titulo">Balance entre meses</span>
            <span className="dashboard-linea__variacion" style={{ color: VARIACION_BALANCE >= 0 ? "var(--color-ingreso)" : "var(--color-gasto)" }}>
              {VARIACION_BALANCE >= 0 ? "+" : ""}
              {VARIACION_BALANCE}% vs {ETIQUETAS_HISTORICO[0].toLowerCase()}
            </span>
          </div>
          <GraficoLinea
            puntosPath={trazarLineaSuave(VALORES_BALANCE)}
            etiquetas={ETIQUETAS_HISTORICO}
            marcadorFinal={puntoFinal(VALORES_BALANCE)}
          />
        </TarjetaGlass>
      )}

      <div className="dashboard-recientes">
        <div className="dashboard-recientes__cabecera">
          <span className="dashboard-recientes__titulo">Últimos movimientos</span>
          <span className="dashboard-recientes__ver-todos" onClick={() => navigate("/movimientos")}>
            Ver todos
          </span>
        </div>
        {cargando ? (
          <TarjetaGlass padding="4px 6px">
            {[0, 1, 2].map((i) => (
              <div key={i} className="dashboard-recientes__esqueleto-fila">
                <Esqueleto ancho={36} alto={36} radio={10} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                  <Esqueleto ancho="70%" alto={11} />
                  <Esqueleto ancho="40%" alto={9} />
                </div>
              </div>
            ))}
          </TarjetaGlass>
        ) : recientes.length === 0 ? (
          <EstadoVacio
            icono={Plus}
            titulo="Aún no hay movimientos"
            descripcion="Conecta una cuenta o añade tu primer gasto para empezar a ver tu actividad aquí."
            accion={{ texto: "Añadir movimiento", icono: Plus, onClick: () => navigate("/movimientos/nuevo") }}
          />
        ) : (
          <TarjetaGlass padding="4px 6px">
            {recientes.map((tx) => (
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
        )}
      </div>

      <FabExpandible
        className="dashboard-fab"
        ariaLabel="Añadir movimiento"
        acciones={[
          { icono: "arrow-up-right", etiqueta: "Gasto", color: "#FF6B7A", onClick: () => navigate("/movimientos/nuevo?tipo=expense") },
          { icono: "arrow-down-left", etiqueta: "Ingreso", color: "#4ADEA8", onClick: () => navigate("/movimientos/nuevo?tipo=income") },
        ]}
      />
    </div>
  );
}
