import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bank, CheckCircle, LockSimple, Plus } from "@phosphor-icons/react";
import { CabeceraPantalla } from "@/components/CabeceraPantalla";
import { CampoBusqueda } from "@/components/campos/CampoBusqueda";
import { EtiquetaSeccion } from "@/components/EtiquetaSeccion";
import { Esqueleto } from "@/components/Esqueleto";
import { apiCuentas, apiNotificaciones } from "@/mocks/api";
import { usarToasts } from "@/lib/ContextoToasts";
import { mostrarNotificacionesComoToast } from "@/lib/notificarToast";
import type { Account } from "@/types/entidades";
import "./ConectarCuenta.css";

const BANCOS_DISPONIBLES = ["BBVA", "CaixaBank", "ING", "Openbank"];

/** Conectar cuenta (§12.5): buscador + secciones Conectada / Conectando / Disponibles. */
export function PantallaConectarCuenta() {
  const navigate = useNavigate();
  const { mostrar } = usarToasts();
  const [busqueda, setBusqueda] = useState("");
  const [cuentas, setCuentas] = useState<Account[]>([]);
  const [conectando, setConectando] = useState<string | null>(null);

  useEffect(() => {
    apiCuentas.listar().then(setCuentas);
  }, []);

  const conectadas = cuentas.filter((c) => c.is_connected);

  function conectar(banco: string) {
    setConectando(banco);
    window.setTimeout(async () => {
      await apiCuentas.crear({ name: banco, type: "checking", bank_name: banco, mask: "·· 0000" });
      setConectando(null);
      const nuevas = await apiNotificaciones.drenarNuevas();
      mostrarNotificacionesComoToast(mostrar, nuevas);
      apiCuentas.listar().then(setCuentas);
    }, 1600);
  }

  return (
    <div className="pantalla pantalla--formulario">
      <div className="blob-decorativo" style={{ top: -120, left: -40, background: "radial-gradient(circle, rgba(74,222,168,0.16), transparent 65%)" }} />
      <CabeceraPantalla titulo="Conectar cuenta" navegacion="volver" onNavegar={() => navigate(-1)} />

      <CampoBusqueda valor={busqueda} onCambiar={setBusqueda} placeholder="Busca tu banco…" />

      {conectadas.length > 0 && (
        <>
          <EtiquetaSeccion>Conectada</EtiquetaSeccion>
          {conectadas.map((c) => (
            <div key={c.id} className="conectar-cuenta__fila conectar-cuenta__fila--conectada">
              <div className="conectar-cuenta__icono conectar-cuenta__icono--verde">
                <Bank size={19} color="#4ADEA8" />
              </div>
              <div className="conectar-cuenta__texto">
                <span className="conectar-cuenta__nombre">{c.bank_name}</span>
                <span className="conectar-cuenta__estado-verde">Sincronizado hace 2 min</span>
              </div>
              <CheckCircle size={20} weight="fill" color="#4ADEA8" />
            </div>
          ))}
        </>
      )}

      {conectando && (
        <>
          <EtiquetaSeccion>Conectando…</EtiquetaSeccion>
          <div className="conectar-cuenta__fila">
            <div className="conectar-cuenta__icono" />
            <div className="conectar-cuenta__texto" style={{ gap: 6, flex: 1 }}>
              <Esqueleto ancho="70%" alto={10} />
              <Esqueleto ancho="45%" alto={8} />
            </div>
            <div className="conectar-cuenta__spinner" />
          </div>
        </>
      )}

      <EtiquetaSeccion>Disponibles</EtiquetaSeccion>
      <div className="conectar-cuenta__lista">
        {BANCOS_DISPONIBLES.filter((b) => b.toLowerCase().includes(busqueda.toLowerCase())).map((banco) => (
          <div key={banco} className="conectar-cuenta__fila" onClick={() => conectar(banco)}>
            <div className="conectar-cuenta__icono">
              <Bank size={17} color="#8B93A7" />
            </div>
            <span className="conectar-cuenta__nombre" style={{ flex: 1 }}>
              {banco}
            </span>
            <Plus size={16} color="#8F86FF" />
          </div>
        ))}
      </div>

      <div className="conectar-cuenta__nota pantalla__cta-anclado">
        <LockSimple size={13} color="var(--color-texto-dim)" />
        <span>Conexión cifrada, solo lectura</span>
      </div>
    </div>
  );
}
