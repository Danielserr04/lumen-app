import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { CabeceraPantalla } from "@/components/CabeceraPantalla";
import { ImporteInput } from "@/components/campos/ImporteInput";
import { FilaSeleccion } from "@/components/campos/FilaSeleccion";
import { CampoTexto } from "@/components/campos/CampoTexto";
import { EtiquetaCampo } from "@/components/campos/EtiquetaCampo";
import { ToggleSegmentado, type OpcionToggle } from "@/components/ToggleSegmentado";
import { Boton } from "@/components/Boton";
import type { Account, Frecuencia } from "@/types/entidades";
import { apiRecurrentes, apiCuentas } from "@/mocks/api";
import { usarToasts } from "@/lib/ContextoToasts";
import { usarCategorias } from "@/lib/usarCategorias";
import "../movimientos/FormularioMovimiento.css";

const FRECUENCIAS: { valor: Frecuencia; etiqueta: string }[] = [
  { valor: "monthly", etiqueta: "Mensual" },
  { valor: "weekly", etiqueta: "Semanal" },
  { valor: "yearly", etiqueta: "Anual" },
];

type TipoRecurrente = "suscripcion" | "financiacion" | "meta";

const OPCIONES_TIPO: OpcionToggle<TipoRecurrente>[] = [
  { valor: "suscripcion", etiqueta: "Suscripción", tint: "255,127,196" },
  { valor: "financiacion", etiqueta: "Financiación", tint: "92,179,255" },
  { valor: "meta", etiqueta: "Meta de ahorro", tint: "124,108,255" },
];

/**
 * Nueva/Editar recurrente (§12.4, ampliado): al crear, primero se elige el tipo
 * (suscripción / financiación / meta de ahorro) — "Meta" abre su propio formulario,
 * ya que es una entidad distinta (`SavingsGoal`, no `Recurring`).
 */
export function PantallaFormularioRecurrente() {
  const { id } = useParams();
  const modoEditar = !!id;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { mostrar } = usarToasts();
  const { idPorToken, porId } = usarCategorias();
  const [cuentas, setCuentas] = useState<Account[]>([]);

  // El formulario todavía no deja elegir categoría ni cuenta, así que se fijan por defecto:
  // "Suscripciones" (o "Otros" si no existiera) y la primera cuenta del usuario.
  const categoriaPorDefecto = porId(idPorToken("suscripciones") ?? idPorToken("otros"));
  const cuentaPorDefecto = cuentas[0];

  const [tipo, setTipo] = useState<TipoRecurrente>(searchParams.get("tipo") === "financiacion" ? "financiacion" : "suscripcion");
  const [nombre, setNombre] = useState("");
  const [importeTexto, setImporteTexto] = useState("");
  const [frecuenciaIdx, setFrecuenciaIdx] = useState(0);
  const [cuotasTotales, setCuotasTotales] = useState("12");
  const [activo, setActivo] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    apiCuentas.listar().then(setCuentas);
  }, []);

  useEffect(() => {
    if (modoEditar) {
      apiRecurrentes.listar().then((lista) => {
        const r = lista.find((x) => x.id === id);
        if (r) {
          setTipo(r.installment_total ? "financiacion" : "suscripcion");
          setNombre(r.name);
          setImporteTexto((Math.abs(r.amount) / 100).toFixed(2).replace(".", ","));
          setFrecuenciaIdx(FRECUENCIAS.findIndex((f) => f.valor === r.frequency));
          if (r.installment_total) setCuotasTotales(String(r.installment_total));
          setActivo(r.active);
        }
      });
    }
  }, [id, modoEditar]);

  function elegirTipo(nuevoTipo: TipoRecurrente) {
    if (nuevoTipo === "meta") {
      navigate("/config/metas/nueva");
      return;
    }
    setTipo(nuevoTipo);
  }

  async function guardar() {
    const limpio = importeTexto.replace(/\./g, "").replace(",", ".");
    const centimos = Math.round(Number.parseFloat(limpio || "0") * 100);
    if (!nombre.trim() || centimos === 0) return;
    setGuardando(true);
    const ahora = new Date().toISOString();
    const esFinanciacion = tipo === "financiacion";
    const totalCuotas = Math.max(1, Number.parseInt(cuotasTotales, 10) || 1);

    if (modoEditar) {
      await apiRecurrentes.editar(id!, {
        name: nombre,
        amount: -centimos,
        frequency: FRECUENCIAS[frecuenciaIdx].valor,
        active: activo,
        ...(esFinanciacion ? { installment_total: totalCuotas } : {}),
      });
      mostrar("exito", "Cambios guardados");
    } else {
      if (!categoriaPorDefecto || !cuentaPorDefecto) {
        mostrar("error", "Falta una categoría o una cuenta para crear la recurrente");
        setGuardando(false);
        return;
      }
      await apiRecurrentes.crear({
        name: nombre,
        amount: -centimos,
        category_id: categoriaPorDefecto.id,
        account_id: cuentaPorDefecto.id,
        frequency: FRECUENCIAS[frecuenciaIdx].valor,
        start_date: ahora,
        next_charge_date: ahora,
        active: true,
        ...(esFinanciacion ? { installment_current: 1, installment_total: totalCuotas } : {}),
      });
      mostrar("exito", esFinanciacion ? "Financiación guardada" : "Suscripción guardada");
    }
    navigate(-1);
  }

  async function pausar() {
    if (!id) return;
    const r = await apiRecurrentes.pausar(id);
    setActivo(r.active);
    mostrar("info", r.active ? "Recurrente reactivado" : "Recurrente pausado");
  }

  return (
    <div className="pantalla pantalla--formulario">
      <CabeceraPantalla
        titulo={modoEditar ? (tipo === "financiacion" ? "Editar financiación" : "Editar suscripción") : "Nueva recurrente"}
        navegacion="volver"
        onNavegar={() => navigate(-1)}
      />

      {!modoEditar && (
        <div className="formulario-movimiento__campo">
          <EtiquetaCampo>Tipo</EtiquetaCampo>
          <ToggleSegmentado opciones={OPCIONES_TIPO} valor={tipo} onCambiar={elegirTipo} />
        </div>
      )}

      <div className="formulario-movimiento__campo">
        <EtiquetaCampo>Nombre</EtiquetaCampo>
        <CampoTexto placeholder={tipo === "financiacion" ? "Ej. iPhone 16" : "Ej. Disney+"} value={nombre} onChange={(e) => setNombre(e.target.value)} />
      </div>

      <ImporteInput valorTexto={importeTexto} onCambiar={setImporteTexto} pista={tipo === "financiacion" ? "Importe de cada cuota" : undefined} />

      <div className="formulario-movimiento__filas">
        {/* Informativas: el formulario aún no deja elegirlas, pero al menos enseñan lo que
            de verdad se va a guardar en vez de un nombre fijo del prototipo. */}
        <FilaSeleccion etiqueta="Categoría" valor={categoriaPorDefecto?.name ?? "Suscripciones"} />
        <FilaSeleccion etiqueta="Cuenta" valor={cuentaPorDefecto?.name ?? "Tu cuenta principal"} />
        <FilaSeleccion
          etiqueta="Frecuencia"
          valor={FRECUENCIAS[frecuenciaIdx].etiqueta}
          onClick={() => setFrecuenciaIdx((i) => (i + 1) % FRECUENCIAS.length)}
        />
      </div>

      {tipo === "financiacion" && (
        <div className="formulario-movimiento__campo">
          <EtiquetaCampo>Número de cuotas</EtiquetaCampo>
          <CampoTexto
            type="number"
            min={1}
            inputMode="numeric"
            value={cuotasTotales}
            onChange={(e) => setCuotasTotales(e.target.value)}
          />
        </div>
      )}

      <div className="pantalla__cta-anclado" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Boton variante="primario" anchoCompleto onClick={guardar} disabled={guardando || !nombre.trim()}>
          {tipo === "financiacion" ? "Guardar financiación" : "Guardar suscripción"}
        </Boton>
        {modoEditar && (
          <Boton variante="secundario" anchoCompleto onClick={pausar}>
            {activo ? "Pausar" : "Reactivar"}
          </Boton>
        )}
      </div>
    </div>
  );
}
