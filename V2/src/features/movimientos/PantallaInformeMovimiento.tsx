import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DotsThree, ArrowsLeftRight, Tag } from "@phosphor-icons/react";
import { CabeceraPantalla } from "@/components/CabeceraPantalla";
import { TarjetaGlass } from "@/components/TarjetaGlass";
import { IconoConHalo } from "@/components/IconoConHalo";
import { PildoraEstado } from "@/components/PildoraEstado";
import { BarraProgreso } from "@/components/BarraProgreso";
import { Boton } from "@/components/Boton";
import { ChipCategoria } from "@/components/ChipCategoria";
import { CajaInsight } from "@/components/campos/CajaInsight";
import { ModalConfirmacion, HojaInferior } from "@/components/Retroalimentacion";
import { formatearImporteConSigno, formatearEuros, formatearFechaLarga } from "@/lib/formato";
import { apiAnalitica, apiMovimientos } from "@/mocks/api";
import { usarToasts } from "@/lib/ContextoToasts";
import { listaCategorias, type IdCategoria } from "@/theme/tokens";
import { usarCategorias } from "@/lib/usarCategorias";
import "./InformeMovimiento.css";

type Informe = Awaited<ReturnType<typeof apiAnalitica.informeMovimiento>>;

const TITULO_POR_VARIANTE: Record<string, string> = {
  A: "Informe de gasto",
  B: "Ingreso",
  C: "Suscripción",
  D: "Movimiento",
  E: "Transferencia",
  F: "Informe de gasto",
  G: "Reembolso",
  H: "Movimiento",
  I: "Informe de gasto",
  J: "Informe de gasto",
  K: "Financiación",
};

/**
 * Informe de movimiento (§5.4): UNA plantilla que cubre las 11 variantes A–K a partir
 * de la resolución en `resolverVarianteInforme` (amount, status, is_recurring,
 * category_id, tipo de cuenta, moneda, financiación) — no se hardcodean 11 pantallas.
 */
export function PantallaInformeMovimiento() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { mostrar } = usarToasts();
  const { idPorToken } = usarCategorias();
  const [informe, setInforme] = useState<Informe | null>(null);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [confirmandoBorrado, setConfirmandoBorrado] = useState(false);
  const [recategorizando, setRecategorizando] = useState(false);

  useEffect(() => {
    apiAnalitica.informeMovimiento(id).then(setInforme);
  }, [id]);

  async function recategorizar(idCategoriaTokens: IdCategoria) {
    const idReal = idPorToken(idCategoriaTokens);
    if (!idReal) return;
    await apiMovimientos.editar(id, { category_id: idReal });
    setRecategorizando(false);
    mostrar("exito", "Categoría actualizada");
    apiAnalitica.informeMovimiento(id).then(setInforme);
  }

  if (!informe) return <div className="pantalla informe-cargando" />;

  const { transaccion: tx, variante, cuenta, categoria, presupuesto, media, recurrente, original, otraPata } = informe;

  const esGasto = tx.amount < 0;
  const colorImporte = variante === "D" ? "var(--color-texto-muted)" : esGasto ? "var(--color-gasto)" : "var(--color-ingreso)";
  const colorHalo = categoria?.color ?? "#98A2B8";
  const iconoHalo = variante === "E" ? undefined : categoria?.icon;

  async function eliminar() {
    await apiMovimientos.eliminar(tx.id);
    setConfirmandoBorrado(false);
    mostrar("deshacer", "Movimiento eliminado · Deshacer", {
      texto: "Deshacer",
      onClick: () => apiMovimientos.deshacerEliminar(tx.id).then(() => mostrar("info", "Restaurado")),
    });
    navigate(-1);
  }

  async function duplicar() {
    await apiMovimientos.duplicar(tx.id);
    setMenuAbierto(false);
    mostrar("exito", "Movimiento duplicado");
  }

  return (
    <div className="pantalla informe-movimiento">
      <div className="blob-decorativo" style={{ top: -120, left: -40, background: `radial-gradient(circle, ${colorHalo}30, transparent 65%)` }} />

      <CabeceraPantalla
        titulo={TITULO_POR_VARIANTE[variante]}
        navegacion="volver"
        onNavegar={() => navigate(-1)}
        centrado
        accionDerecha={
          <div className="informe-movimiento__menu-contenedor">
            <button type="button" className="informe-movimiento__menu-boton" onClick={() => setMenuAbierto((v) => !v)}>
              <DotsThree size={20} color="#A9B0C0" weight="bold" />
            </button>
            {menuAbierto && (
              <div className="informe-movimiento__menu">
                <span onClick={() => { setMenuAbierto(false); navigate(`/movimientos/${tx.id}/editar`); }}>Editar</span>
                <span onClick={duplicar}>Duplicar</span>
                <span className="informe-movimiento__menu-destructivo" onClick={() => { setMenuAbierto(false); setConfirmandoBorrado(true); }}>
                  Eliminar
                </span>
              </div>
            )}
          </div>
        }
      />

      {/* Bloque hero */}
      <TarjetaGlass animada fondo={`linear-gradient(120deg, ${colorHalo}30, rgba(124,108,255,0.14))`} conSombra className="informe-movimiento__hero">
        <div className="informe-movimiento__hero-fila">
          {variante === "E" ? (
            <IconoConHalo icono={<ArrowsLeftRight size={24} color="#8F86FF" />} color="#7C6CFF" tamano={50} radio={6} />
          ) : (
            <IconoConHalo icono={iconoHalo ?? "dots-three-circle"} color={colorHalo} tamano={50} radio={6} tamanoIcono={24} />
          )}
          <div className="informe-movimiento__hero-texto">
            <span className="informe-movimiento__hero-nombre">{tx.name}</span>
            <span className="informe-movimiento__hero-sub">
              {categoria?.name ?? "Sin categorizar"}
              {tx.is_recurring && variante === "C" && " · recurrente"}
            </span>
          </div>
          {variante === "C" && <PildoraEstado texto="Activa" severidad="ok" />}
          {variante === "D" && <PildoraEstado texto="Pendiente" severidad="warning" />}
        </div>

        {variante === "E" ? (
          <div className="informe-movimiento__transferencia">
            <span>{cuenta?.name}</span>
            <ArrowsLeftRight size={16} color="#8B93A7" />
            <span>{otraPata ? "Efectivo" : "—"}</span>
          </div>
        ) : (
          <span className="informe-movimiento__hero-importe" style={{ color: colorImporte }}>
            {variante === "I" && tx.amount_original
              ? formatearImporteConSigno(tx.amount)
              : formatearImporteConSigno(tx.amount)}
          </span>
        )}

        <span className="informe-movimiento__hero-fecha">
          {formatearFechaLarga(tx.date)}
          {cuenta && variante !== "J" && ` · ${cuenta.name}`}
        </span>

        {variante === "G" && original && <span className="informe-movimiento__etiqueta-reembolso">Reembolso</span>}
      </TarjetaGlass>

      {/* Filas de detalle */}
      <TarjetaGlass padding="4px 6px" className="informe-movimiento__filas">
        {variante !== "E" && (
          <FilaDetalle
            etiqueta="Categoría"
            valor={
              categoria ? (
                <span className="informe-movimiento__chip-categoria" style={{ background: `${categoria.color}1A`, borderColor: `${categoria.color}59`, color: categoria.color }}>
                  {categoria.name}
                </span>
              ) : (
                <Boton variante="terciario" tamano="pequeno" onClick={() => navigate(`/movimientos/${tx.id}/editar`)}>
                  Asignar categoría
                </Boton>
              )
            }
          />
        )}
        {variante !== "J" && cuenta && <FilaDetalle etiqueta="Cuenta" valor={cuenta.name} />}
        {tx.method && variante !== "J" && <FilaDetalle etiqueta="Método" valor={tx.method} />}
        <FilaDetalle etiqueta={variante === "D" ? "Estado" : "Fecha y hora"} valor={variante === "D" ? "Pendiente de confirmar" : formatearFechaLarga(tx.date)} />

        {variante === "A" && media.mediaPorMes > 0 && <FilaDetalle etiqueta="Media aquí" valor={formatearEuros(media.mediaPorMes)} />}
        {(variante === "A" || variante === "F") && presupuesto && (
          <FilaDetalle etiqueta="Presupuesto restante" valor={formatearEuros(presupuesto.available)} colorValor={presupuesto.available < 0 ? "var(--color-gasto)" : "var(--color-ingreso)"} />
        )}

        {variante === "B" && recurrente && <FilaDetalle etiqueta="Frecuencia" valor={`Mensual · día ${new Date(tx.date).getDate()}`} />}

        {variante === "C" && recurrente && (
          <>
            <FilaDetalle etiqueta="Desde" valor={formatearFechaLarga(recurrente.start_date).split(" · ")[0]} />
            <FilaDetalle etiqueta="Próximo cargo" valor={formatearFechaLarga(recurrente.next_charge_date).split(" · ")[0]} />
          </>
        )}

        {variante === "G" && original && <FilaDetalle etiqueta="Gasto original" valor={`${original.name} · ${formatearImporteConSigno(original.amount)}`} />}

        {variante === "I" && tx.amount_original && (
          <>
            <FilaDetalle etiqueta="Importe original" valor={`${(tx.amount_original / 100).toFixed(2)} ${tx.currency_original}`} />
            <FilaDetalle etiqueta="Tipo de cambio" valor={`${tx.fx_rate} €/$`} />
          </>
        )}

        {variante === "K" && tx.installment_current && tx.installment_total && (
          <>
            <FilaDetalle etiqueta="Cuota" valor={`${tx.installment_current} de ${tx.installment_total}`} />
            <FilaDetalle etiqueta="Pendiente" valor={formatearEuros(Math.abs(tx.amount) * (tx.installment_total - tx.installment_current))} />
          </>
        )}
      </TarjetaGlass>

      {variante === "F" && presupuesto && (
        <div className="informe-movimiento__barra-presupuesto">
          <BarraProgreso fraccion={presupuesto.percent} degradado="linear-gradient(90deg,#FF6B7A,#FF9AA5)" />
        </div>
      )}
      {variante === "K" && tx.installment_current && tx.installment_total && (
        <BarraProgreso fraccion={tx.installment_current / tx.installment_total} />
      )}

      <CajaInsight variante={variante === "F" || variante === "D" ? "aviso" : variante === "G" || variante === "B" ? "exito" : "info"} texto={obtenerTextoInsight(variante, informe)} />

      <div className="pantalla__cta-anclado informe-movimiento__acciones">
        {variante === "H" ? (
          <Boton variante="primario" anchoCompleto onClick={() => setRecategorizando(true)}>
            <Tag size={15} /> Asignar categoría
          </Boton>
        ) : variante === "E" ? (
          <Boton variante="secundario" anchoCompleto onClick={() => navigate(`/movimientos/${tx.id}/editar`)}>
            Editar movimiento
          </Boton>
        ) : (
          <div className="informe-movimiento__fila-botones">
            <Boton variante="secundario" onClick={() => navigate(`/movimientos/${tx.id}/editar`)}>
              Editar
            </Boton>
            <Boton variante="secundario" onClick={() => setRecategorizando(true)}>
              <Tag size={15} /> Recategorizar
            </Boton>
          </div>
        )}
        <span className="informe-movimiento__eliminar" onClick={() => setConfirmandoBorrado(true)}>
          Eliminar
        </span>
      </div>

      {recategorizando && (
        <HojaInferior onCerrar={() => setRecategorizando(false)}>
          <span className="informe-movimiento__hoja-titulo">Elige una categoría</span>
          <div className="informe-movimiento__hoja-chips">
            {listaCategorias.map((cat) => (
              <ChipCategoria
                key={cat.id}
                categoria={cat}
                seleccionada={tx.category_id === idPorToken(cat.id)}
                onClick={() => recategorizar(cat.id)}
              />
            ))}
          </div>
        </HojaInferior>
      )}

      {confirmandoBorrado && (
        <ModalConfirmacion
          titulo="Eliminar movimiento"
          cuerpo={`¿Seguro que quieres eliminar "${tx.name}"? Podrás deshacerlo justo después.`}
          textoConfirmar="Eliminar"
          destructivo
          onConfirmar={eliminar}
          onCancelar={() => setConfirmandoBorrado(false)}
        />
      )}
    </div>
  );
}

function FilaDetalle({ etiqueta, valor, colorValor }: { etiqueta: string; valor: ReactNode; colorValor?: string }) {
  return (
    <div className="informe-movimiento__fila-detalle">
      <span className="informe-movimiento__fila-etiqueta">{etiqueta}</span>
      <span className="informe-movimiento__fila-valor" style={{ color: colorValor }}>
        {valor}
      </span>
    </div>
  );
}

function obtenerTextoInsight(variante: string, informe: Informe): string {
  const { media, presupuesto, recurrente, original } = informe;
  switch (variante) {
    case "A":
      return `Has gastado ${formatearEuros(media.mediaPorMes)} en ${informe.categoria?.name ?? "esta categoría"} este mes, en línea con tu media habitual.`;
    case "B":
      return "Tu ingreso principal. Representa la mayor parte de tus ingresos del mes.";
    case "C":
      return recurrente ? `Llevas varios cargos de esta suscripción desde que te diste de alta.` : "Suscripción activa.";
    case "D":
      return "Los importes pendientes pueden cambiar hasta que el banco los confirme.";
    case "E":
      return "Movimiento interno: no cuenta como gasto ni ingreso.";
    case "F":
      return presupuesto
        ? `Con este gasto superas tu presupuesto de ${informe.categoria?.name} en ${formatearEuros(presupuesto.spent - presupuesto.limit_amount)}.`
        : "Has superado tu presupuesto en esta categoría.";
    case "G":
      return original ? `Devolución de tu compra en ${original.name} del ${formatearFechaLarga(original.date).split(",")[0]}.` : "Reembolso recibido.";
    case "H":
      return "Categoriza este movimiento para mejorar tus informes.";
    case "I":
      return `Convertido a ${informe.transaccion.fx_rate} €/$ el día de la operación.`;
    case "J":
      return "Los gastos en efectivo los añadiste manualmente.";
    case "K": {
      const { installment_current, installment_total, amount } = informe.transaccion;
      if (!installment_current || !installment_total) return "Pago a plazos.";
      const restantes = installment_total - installment_current;
      return `Cuota ${installment_current} de ${installment_total} · quedan ${restantes} cargos (${formatearEuros(Math.abs(amount) * restantes)}).`;
    }
    default:
      return "";
  }
}
