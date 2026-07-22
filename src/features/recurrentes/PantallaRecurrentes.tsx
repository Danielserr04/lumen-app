import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, PiggyBank } from "@phosphor-icons/react";
import { TarjetaGlass } from "@/components/TarjetaGlass";
import { IconoConHalo } from "@/components/IconoConHalo";
import { BarraProgreso } from "@/components/BarraProgreso";
import { EtiquetaSeccion } from "@/components/EtiquetaSeccion";
import { FabExpandible } from "@/components/FabExpandible";
import { Esqueleto } from "@/components/Esqueleto";
import { EstadoVacio } from "@/components/EstadoVacio";
import { formatearEuros, formatearPorcentaje } from "@/lib/formato";
import { usarCategorias } from "@/lib/usarCategorias";
import { apiRecurrentes, apiMetas } from "@/mocks/api";
import type { Recurring, SavingsGoal } from "@/types/entidades";
import "./Recurrentes.css";

/**
 * Recurrentes (§5.5, ampliada): suscripciones, financiación y también metas de ahorro
 * — conceptualmente es lo mismo (ir asignando poco a poco hasta llegar a un valor), así
 * que viven juntas en la misma pestaña en vez de escondidas dentro de Config.
 */
export function PantallaRecurrentes() {
  const navigate = useNavigate();
  const { visual } = usarCategorias();
  const [recurrentes, setRecurrentes] = useState<Recurring[]>([]);
  const [metas, setMetas] = useState<SavingsGoal[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    Promise.all([apiRecurrentes.listar(), apiMetas.listar()]).then(([r, m]) => {
      setRecurrentes(r);
      setMetas(m);
      setCargando(false);
    });
  }, []);

  const suscripciones = recurrentes.filter((r) => !r.installment_total && r.amount < 0);
  const financiaciones = recurrentes.filter((r) => !!r.installment_total);
  const totalMensual = suscripciones.filter((r) => r.active).reduce((s, r) => s + Math.abs(r.amount), 0);
  const sinNada = recurrentes.length === 0 && metas.length === 0;

  return (
    <div className="pantalla">
      <span className="recurrentes-titulo">Recurrentes</span>

      {cargando ? (
        <TarjetaGlass>
          <Esqueleto ancho="40%" alto={11} />
          <div style={{ height: 8 }} />
          <Esqueleto ancho="60%" alto={28} />
        </TarjetaGlass>
      ) : sinNada ? (
        <EstadoVacio icono={Plus} titulo="Sin recurrentes" descripcion="Añade tus suscripciones para hacerles seguimiento aquí." />
      ) : (
        <>
          {suscripciones.length > 0 && (
            <>
              <TarjetaGlass fondo="linear-gradient(155deg, rgba(255,127,196,0.10), rgba(255,255,255,0.03) 55%)" className="recurrentes-resumen">
                <div className="recurrentes-resumen__texto">
                  <span className="recurrentes-resumen__etiqueta">Total mensual</span>
                  <span className="recurrentes-resumen__cifra">{formatearEuros(totalMensual)}</span>
                </div>
                <span className="recurrentes-resumen__activas">{suscripciones.filter((r) => r.active).length} activas</span>
              </TarjetaGlass>

              <TarjetaGlass padding="4px 6px">
                {suscripciones.map((r, i) => {
                  const cat = visual(r.category_id);
                  return (
                    <div key={r.id}>
                      <div className="recurrentes-fila" onClick={() => navigate(`/recurrentes/${r.id}/editar`)}>
                        <IconoConHalo icono={cat?.icono ?? "arrows-clockwise"} color={cat?.color ?? "#98A2B8"} tamano={36} radio={10} tamanoIcono={17} />
                        <div className="recurrentes-fila__texto">
                          <span className="recurrentes-fila__nombre">{r.name}</span>
                          <span className="recurrentes-fila__sub">día {new Date(r.next_charge_date).getDate()}</span>
                        </div>
                        <span className="recurrentes-fila__importe">{formatearEuros(Math.abs(r.amount))}</span>
                      </div>
                      {i < suscripciones.length - 1 && <div className="recurrentes-separador" />}
                    </div>
                  );
                })}
              </TarjetaGlass>
            </>
          )}

          {financiaciones.length > 0 && (
            <div className="recurrentes-seccion">
              <EtiquetaSeccion>Financiación</EtiquetaSeccion>
              {financiaciones.map((r) => (
                <TarjetaGlass key={r.id} className="recurrentes-financiacion">
                  <div className="recurrentes-fila recurrentes-fila--sinpadding">
                    <IconoConHalo icono={r.category_id ? (visual(r.category_id)?.icono ?? "credit-card") : "credit-card"} color={visual(r.category_id)?.color ?? "#5CB3FF"} tamano={36} radio={10} tamanoIcono={17} />
                    <div className="recurrentes-fila__texto">
                      <span className="recurrentes-fila__nombre">{r.name}</span>
                      <span className="recurrentes-fila__sub">Cuota {r.installment_current} de {r.installment_total}</span>
                    </div>
                    <span className="recurrentes-fila__importe">{formatearEuros(Math.abs(r.amount))}</span>
                  </div>
                  <BarraProgreso fraccion={(r.installment_current ?? 0) / (r.installment_total ?? 1)} />
                </TarjetaGlass>
              ))}
            </div>
          )}

          <div className="recurrentes-seccion">
            <div className="recurrentes-seccion__cabecera">
              <EtiquetaSeccion>Ahorro · Metas</EtiquetaSeccion>
              <span className="recurrentes-seccion__accion" onClick={() => navigate("/config/metas")}>
                Gestionar
              </span>
            </div>
            {metas.length === 0 ? (
              <TarjetaGlass className="recurrentes-metas-vacio" onClick={() => navigate("/config/metas/nueva")}>
                <PiggyBank size={20} color="#8F86FF" weight="light" />
                <span>Crea una hucha para ir apartando dinero poco a poco, como una suscripción a la inversa.</span>
              </TarjetaGlass>
            ) : (
              metas.map((meta) => {
                const fraccion = meta.target_amount > 0 ? meta.current_amount / meta.target_amount : 0;
                return (
                  <TarjetaGlass key={meta.id} className="recurrentes-financiacion" onClick={() => navigate("/config/metas")}>
                    <div className="recurrentes-fila recurrentes-fila--sinpadding">
                      <IconoConHalo icono={meta.icon} color={meta.color} tamano={36} radio={10} tamanoIcono={17} />
                      <div className="recurrentes-fila__texto">
                        <span className="recurrentes-fila__nombre">{meta.name}</span>
                        <span className="recurrentes-fila__sub">
                          {formatearEuros(meta.current_amount)} de {formatearEuros(meta.target_amount)}
                        </span>
                      </div>
                      <span className="recurrentes-fila__importe" style={{ color: meta.color }}>
                        {formatearPorcentaje(fraccion)}
                      </span>
                    </div>
                    <BarraProgreso fraccion={fraccion} degradado={`linear-gradient(90deg, ${meta.color}, #42D0F4)`} />
                  </TarjetaGlass>
                );
              })
            )}
          </div>
        </>
      )}

      <FabExpandible
        className="recurrentes-fab"
        ariaLabel="Añadir recurrente"
        acciones={[
          { icono: "arrows-clockwise", etiqueta: "Suscripción", color: "#FF7FC4", onClick: () => navigate("/recurrentes/nuevo?tipo=suscripcion") },
          { icono: "credit-card", etiqueta: "Financiación", color: "#5CB3FF", onClick: () => navigate("/recurrentes/nuevo?tipo=financiacion") },
          { icono: "piggy-bank", etiqueta: "Meta de ahorro", color: "#7C6CFF", onClick: () => navigate("/config/metas/nueva") },
        ]}
      />
    </div>
  );
}
