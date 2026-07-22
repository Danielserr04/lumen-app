import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Storefront } from "@phosphor-icons/react";
import { TarjetaGlass } from "@/components/TarjetaGlass";
import { TarjetaAviso } from "@/components/TarjetaAviso";
import { GraficoDonut } from "@/components/graficos/GraficoDonut";
import { GraficoFlujo } from "@/components/graficos/GraficoFlujo";
import { BarraProgreso } from "@/components/BarraProgreso";
import { Esqueleto } from "@/components/Esqueleto";
import { formatearEuros, formatearEurosSinDecimales, formatearPorcentaje } from "@/lib/formato";
import { periodoActual } from "@/lib/periodo";
import { apiAnalitica, apiPresupuestos } from "@/mocks/api";
import { usarCategorias } from "@/lib/usarCategorias";
import type { GastoPorCategoria, ComercioFrecuente, InsightAnalisis } from "@/lib/derivar";
import type { BudgetDerivado } from "@/types/entidades";
import type { PuntoHistorico } from "@/mocks/data/historico";
import "./Analisis.css";

const RANGOS = [
  { valor: 3, etiqueta: "3M" },
  { valor: 6, etiqueta: "6M" },
] as const;

/**
 * Análisis — rediseñada por completo (a petición del usuario, "no me gusta, rediséñala
 * a tu gusto"): un único gráfico de flujo combinado (barras de contexto + línea de
 * balance) como pieza central en vez de repetir dos tarjetas casi iguales, donut con
 * leyenda en píldoras, insights como carrusel horizontal y comercios como tarjetas-stat
 * — mismo lenguaje visual que los recuadros del informe de movimiento, para que Análisis
 * no sea otra pila de tarjetas idénticas.
 */
export function PantallaAnalisis() {
  const navigate = useNavigate();
  const { porId } = usarCategorias();
  const [gastoPorCategoria, setGastoPorCategoria] = useState<GastoPorCategoria[] | null>(null);
  const [historico, setHistorico] = useState<PuntoHistorico[] | null>(null);
  const [presupuestos, setPresupuestos] = useState<BudgetDerivado[] | null>(null);
  const [topComercios, setTopComercios] = useState<ComercioFrecuente[] | null>(null);
  const [insights, setInsights] = useState<InsightAnalisis[] | null>(null);
  const [rango, setRango] = useState<3 | 6>(6);

  useEffect(() => {
    const periodo = periodoActual();
    Promise.all([
      apiAnalitica.gastoPorCategoria(periodo),
      apiAnalitica.cashflowHistorico(),
      apiPresupuestos.listar(periodo),
      apiAnalitica.topComercios(periodo, 5),
      apiAnalitica.insights(periodo),
    ]).then(([g, h, p, tc, ins]) => {
      setGastoPorCategoria(g);
      setHistorico(h);
      setPresupuestos(p);
      setTopComercios(tc);
      setInsights(ins);
    });
  }, []);

  const historicoVisible = useMemo(() => (historico ? historico.slice(-rango) : null), [historico, rango]);

  const totalGastado = gastoPorCategoria?.reduce((s, g) => s + g.total, 0) ?? 0;
  const variacionBalance =
    historicoVisible && historicoVisible.length > 1
      ? Math.round(
          ((historicoVisible[historicoVisible.length - 1].balanceDisponible - historicoVisible[0].balanceDisponible) /
            historicoVisible[0].balanceDisponible) *
            100,
        )
      : 0;

  const presupuestosActivos = presupuestos?.filter((b) => b.spent > 0).sort((a, b) => b.percent - a.percent) ?? [];
  const cargando = !gastoPorCategoria || !historico || !presupuestos || !topComercios || !insights;

  return (
    <div className="pantalla">
      <div className="blob-decorativo" style={{ top: -100, right: -60, background: "radial-gradient(circle, rgba(124,108,255,0.16), transparent 65%)" }} />

      <div className="analisis-cabecera">
        <span className="analisis-titulo">Análisis</span>
        <div className="analisis-rangos">
          {RANGOS.map((r) => (
            <span
              key={r.valor}
              className={`analisis-rango ${rango === r.valor ? "analisis-rango--activo" : ""}`}
              onClick={() => setRango(r.valor)}
            >
              {r.etiqueta}
            </span>
          ))}
        </div>
      </div>

      {cargando ? (
        <TarjetaGlass>
          <Esqueleto alto={150} />
        </TarjetaGlass>
      ) : (
        <>
          {/* Pieza central: un único gráfico de flujo, no dos tarjetas repetidas. */}
          <TarjetaGlass
            animada
            fondo="linear-gradient(120deg, rgba(124,108,255,0.20), rgba(66,208,244,0.10) 55%, rgba(74,222,168,0.10))"
            className="analisis-hero"
          >
            <div className="analisis-hero__cabecera">
              <div className="analisis-hero__texto">
                <span className="analisis-hero__etiqueta">Flujo · últimos {rango} meses</span>
                <span className="analisis-hero__cifra">{formatearEuros(historicoVisible![historicoVisible!.length - 1].balanceDisponible)}</span>
              </div>
              <span
                className="analisis-hero__variacion"
                style={{ color: variacionBalance >= 0 ? "var(--color-ingreso)" : "var(--color-gasto)" }}
              >
                {variacionBalance >= 0 ? "+" : ""}
                {variacionBalance}%
              </span>
            </div>
            <GraficoFlujo
              datos={historicoVisible!.map((p) => ({ etiqueta: p.etiqueta, ingreso: p.ingresos, gasto: p.gastos, balance: p.balanceDisponible }))}
            />
            <div className="analisis-hero__leyenda">
              <span><i style={{ background: "#4ADEA8" }} /> Ingresos</span>
              <span><i style={{ background: "#FF6B7A" }} /> Gastos</span>
              <span><i className="analisis-hero__leyenda-linea" /> Balance</span>
            </div>
          </TarjetaGlass>

          {/* Donut con leyenda en píldoras tintadas, no una lista de puntitos. */}
          <div className="analisis-seccion">
            <span className="analisis-seccion__titulo">Gasto por categoría</span>
            <TarjetaGlass
              animada
              fondo="linear-gradient(120deg, rgba(255,163,92,0.16), rgba(183,140,255,0.14) 40%, rgba(66,208,244,0.12) 70%, rgba(255,127,196,0.14))"
              className="analisis-donut-tarjeta"
            >
              <GraficoDonut
                tamano={150}
                segmentos={gastoPorCategoria!.map((g) => ({ color: g.categoria.color, porcentaje: g.porcentaje * 100 }))}
                centroTitulo={formatearEurosSinDecimales(totalGastado)}
                centroSubtitulo="este mes"
              />
              <div className="analisis-donut-pildoras">
                {gastoPorCategoria!.map((g) => (
                  <span
                    key={g.categoria.id}
                    className="analisis-donut-pildora"
                    style={{ background: `${g.categoria.color}1A`, borderColor: `${g.categoria.color}40`, color: g.categoria.color }}
                  >
                    {g.categoria.name} · {formatearPorcentaje(g.porcentaje)}
                  </span>
                ))}
              </div>
            </TarjetaGlass>
          </div>

          {/* Insights: lista vertical de tarjetas de aviso (§4 "04 · Tarjeta de aviso") */}
          {insights!.length > 0 && (
            <div className="analisis-seccion">
              <span className="analisis-seccion__titulo">Lo que dicen tus números</span>
              <div className="analisis-insights-lista">
                {insights!.map((insight, i) => (
                  <TarjetaAviso key={i} icono={insight.icono} color={insight.color} titulo={insight.titulo} cuerpo={insight.cuerpo} />
                ))}
              </div>
            </div>
          )}

          {/* Top comercios como tarjetas-stat compactas (mismo lenguaje que el informe). */}
          {topComercios!.length > 0 && (
            <div className="analisis-seccion">
              <span className="analisis-seccion__titulo">Dónde gastas más</span>
              <div className="analisis-comercios-carrusel">
                {topComercios!.map((c) => (
                  <div key={c.nombre} className="analisis-comercio-stat" onClick={() => navigate("/movimientos")}>
                    <Storefront size={16} weight="light" color="#B78CFF" />
                    <span className="analisis-comercio-stat__nombre">{c.nombre}</span>
                    <span className="analisis-comercio-stat__total">{formatearEuros(c.total)}</span>
                    <span className="analisis-comercio-stat__veces">{c.veces}×</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {presupuestosActivos.length > 0 && (
            <div className="analisis-seccion">
              <span className="analisis-seccion__titulo">Presupuestos del mes</span>
              <TarjetaGlass padding="4px 6px">
                {presupuestosActivos.map((b, i, arr) => (
                  <div key={b.id}>
                    <div className="analisis-presupuesto-fila" onClick={() => navigate("/movimientos")}>
                      <div className="analisis-presupuesto-fila__texto">
                        <span>{porId(b.category_id)?.name ?? "Categoría"}</span>
                        <span className="analisis-presupuesto-fila__cifras">
                          {formatearEuros(b.spent)} de {formatearEuros(b.limit_amount)}
                        </span>
                      </div>
                      <span
                        className="analisis-presupuesto-fila__pct"
                        style={{ color: b.state === "over" ? "var(--color-gasto)" : b.state === "warning" ? "var(--color-aviso)" : "var(--color-ingreso)" }}
                      >
                        {formatearPorcentaje(b.percent)}
                      </span>
                    </div>
                    <div className="analisis-presupuesto-fila__barra">
                      <BarraProgreso
                        fraccion={b.percent}
                        degradado={
                          b.state === "over"
                            ? "linear-gradient(90deg,#FF6B7A,#FF9AA5)"
                            : b.state === "warning"
                              ? "linear-gradient(90deg,#FFC24B,#FFD98A)"
                              : "linear-gradient(90deg,#7C6CFF,#42D0F4)"
                        }
                      />
                    </div>
                    {i < arr.length - 1 && <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "10px 12px" }} />}
                  </div>
                ))}
              </TarjetaGlass>
            </div>
          )}
        </>
      )}
    </div>
  );
}
