import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { CabeceraPantalla } from "@/components/CabeceraPantalla";
import { ToggleSegmentado } from "@/components/ToggleSegmentado";
import { ChipCategoria } from "@/components/ChipCategoria";
import { ImporteInput } from "@/components/campos/ImporteInput";
import { FilaSeleccion } from "@/components/campos/FilaSeleccion";
import { AreaTexto } from "@/components/campos/CampoTexto";
import { EtiquetaCampo } from "@/components/campos/EtiquetaCampo";
import { ErrorCampo } from "@/components/campos/ErrorCampo";
import { Boton } from "@/components/Boton";
import { Calendario } from "@/components/Calendario";
import { HojaInferior } from "@/components/Retroalimentacion";
import { listaCategorias } from "@/theme/tokens";
import { apiMovimientos, apiCuentas, apiNotificaciones } from "@/mocks/api";
import { usarToasts } from "@/lib/ContextoToasts";
import { mostrarNotificacionesComoToast } from "@/lib/notificarToast";
import { usarCategorias } from "@/lib/usarCategorias";
import type { Account } from "@/types/entidades";
import "./FormularioMovimiento.css";

function esMismoDia(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function etiquetaFecha(fecha: Date): string {
  const hoy = new Date();
  const ayer = new Date();
  ayer.setDate(hoy.getDate() - 1);
  if (esMismoDia(fecha, hoy)) return "Hoy";
  if (esMismoDia(fecha, ayer)) return "Ayer";
  return fecha.toLocaleDateString("es-ES", { day: "numeric", month: "short" }).replace(".", "");
}

/** Añadir/Editar movimiento (§12.1/12.2): misma pantalla, precargada en modo editar. */
export function PantallaFormularioMovimiento() {
  const { id } = useParams();
  const modoEditar = !!id;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { mostrar } = usarToasts();
  const { idPorToken } = usarCategorias();

  const [tipo, setTipo] = useState<"expense" | "income">(searchParams.get("tipo") === "income" ? "income" : "expense");
  const [importeTexto, setImporteTexto] = useState("");
  const [categoriaId, setCategoriaId] = useState<string | null>(null);
  const [nota, setNota] = useState("");
  const [cuentaId, setCuentaId] = useState<string>("");
  const [cuentas, setCuentas] = useState<Account[]>([]);
  const [comercio, setComercio] = useState("");
  const [fecha, setFecha] = useState(new Date());
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [mesCalendario, setMesCalendario] = useState(new Date());
  const [errorImporte, setErrorImporte] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    // Al crear, la primera cuenta del usuario es la preseleccionada. Antes había un id fijo
    // ("acc-visa") que no existe fuera de los mocks: el backend rechazaba el alta entera.
    apiCuentas.listar().then((lista) => {
      setCuentas(lista);
      if (!modoEditar) setCuentaId((actual) => actual || lista[0]?.id || "");
    });
    if (modoEditar) {
      apiMovimientos.obtener(id!).then((tx) => {
        setTipo(tx.amount < 0 ? "expense" : "income");
        setImporteTexto((Math.abs(tx.amount) / 100).toFixed(2).replace(".", ","));
        setCategoriaId(tx.category_id);
        setNota(tx.note ?? "");
        setCuentaId(tx.account_id);
        setComercio(tx.name);
        setFecha(new Date(tx.date));
      });
    }
  }, [id, modoEditar]);

  const cuentaActual = cuentas.find((c) => c.id === cuentaId);

  function parsearImporte(): number {
    const limpio = importeTexto.replace(/\./g, "").replace(",", ".");
    const numero = Number.parseFloat(limpio || "0");
    return Number.isFinite(numero) ? Math.round(numero * 100) : 0;
  }

  async function guardar() {
    const centimos = parsearImporte();
    if (centimos === 0) {
      setErrorImporte("El importe no puede ser 0 €");
      return;
    }
    setErrorImporte(null);
    setGuardando(true);
    const amount = tipo === "expense" ? -centimos : centimos;
    try {
      if (modoEditar) {
        await apiMovimientos.editar(id!, { amount, category_id: categoriaId, note: nota || null, account_id: cuentaId, name: comercio || "Movimiento", date: fecha.toISOString() });
        mostrar("exito", "Cambios guardados");
      } else {
        await apiMovimientos.crear({
          amount,
          category_id: categoriaId,
          note: nota || null,
          account_id: cuentaId,
          name: comercio || (tipo === "expense" ? "Gasto" : "Ingreso"),
          date: fecha.toISOString(),
          method: null,
          is_recurring: false,
          recurring_id: null,
        });
        mostrar("exito", "Movimiento guardado");
      }
      const nuevas = await apiNotificaciones.drenarNuevas();
      mostrarNotificacionesComoToast(mostrar, nuevas);
      navigate(-1);
    } finally {
      setGuardando(false);
    }
  }

  const categoriasFiltradas = listaCategorias; // en gasto se muestran todas; ingreso podría omitirse (§12.1)

  return (
    <div className="pantalla pantalla--formulario">
      <div className="blob-decorativo" style={{ top: -120, left: -40, background: "radial-gradient(circle, rgba(124,108,255,0.18), transparent 65%)" }} />

      <CabeceraPantalla
        titulo={modoEditar ? "Editar movimiento" : "Añadir movimiento"}
        navegacion="cerrar"
        onNavegar={() => navigate(-1)}
        centrado
        accionDerecha={
          <span className="formulario-movimiento__guardar-texto" onClick={guardar}>
            Guardar
          </span>
        }
      />

      <ToggleSegmentado
        valor={tipo}
        onCambiar={setTipo}
        opciones={[
          { valor: "expense", etiqueta: "Gasto", tint: "255,107,122" },
          { valor: "income", etiqueta: "Ingreso", tint: "74,222,168" },
        ]}
      />

      <ImporteInput valorTexto={importeTexto} onCambiar={setImporteTexto} />

      <div className="formulario-movimiento__campo">
        <EtiquetaCampo>Comercio</EtiquetaCampo>
        <input
          className="campo-texto"
          placeholder={tipo === "expense" ? "¿Dónde has gastado?" : "¿De dónde viene el ingreso?"}
          value={comercio}
          onChange={(e) => setComercio(e.target.value)}
        />
      </div>

      {tipo === "expense" && (
        <div className="formulario-movimiento__campo">
          <EtiquetaCampo>Categoría</EtiquetaCampo>
          <div className="formulario-movimiento__chips">
            {categoriasFiltradas.map((cat) => (
              <ChipCategoria
                key={cat.id}
                categoria={cat}
                seleccionada={categoriaId === idPorToken(cat.id)}
                onClick={() => setCategoriaId(idPorToken(cat.id) ?? null)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="formulario-movimiento__filas">
        <FilaSeleccion etiqueta="Fecha" valor={etiquetaFecha(fecha)} onClick={() => setMostrarCalendario(true)} />
        <FilaSeleccion
          etiqueta="Cuenta"
          valor={cuentaActual?.name ?? "Selecciona una cuenta"}
          onClick={() => {
            const idx = cuentas.findIndex((c) => c.id === cuentaId);
            setCuentaId(cuentas[(idx + 1) % cuentas.length]?.id ?? cuentaId);
          }}
        />
        <div className="formulario-movimiento__nota">
          <AreaTexto placeholder="Nota (opcional)" value={nota} onChange={(e) => setNota(e.target.value)} error={!!errorImporte} />
          {errorImporte && <ErrorCampo mensaje={errorImporte} />}
        </div>
      </div>

      <div className="pantalla__cta-anclado">
        <Boton variante="primario" anchoCompleto onClick={guardar} disabled={guardando}>
          {guardando ? "Guardando…" : modoEditar ? "Guardar cambios" : "Guardar movimiento"}
        </Boton>
      </div>

      {mostrarCalendario && (
        <HojaInferior onCerrar={() => setMostrarCalendario(false)}>
          <span className="formulario-movimiento__hoja-titulo">Fecha del movimiento</span>
          <Calendario
            mesVisible={mesCalendario}
            onCambiarMes={setMesCalendario}
            fechaInicio={fecha}
            fechaFin={fecha}
            onSeleccionarDia={(dia) => setFecha(dia)}
          />
          <Boton variante="primario" anchoCompleto onClick={() => setMostrarCalendario(false)}>
            Listo
          </Boton>
        </HojaInferior>
      )}
    </div>
  );
}
