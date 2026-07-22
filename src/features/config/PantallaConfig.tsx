import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, Bell, Tag, Bank, CaretRight, SignOut, ShieldCheck, Globe } from "@phosphor-icons/react";
import { TarjetaGlass } from "@/components/TarjetaGlass";
import { apiAuth, apiCuentas } from "@/mocks/api";
import { avisosActivos as leerAvisosActivos, establecerAvisosActivos } from "@/lib/preferenciasNotificaciones";
import type { User } from "@/types/entidades";
import "./Config.css";

/** Config (§5.7/§5.12.2): perfil, avisos, categorías, cuentas conectadas, metas, preferencias, seguridad, sesión. */
export function PantallaConfig() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<User | null>(null);
  const [numCuentas, setNumCuentas] = useState(0);
  const [avisos, setAvisos] = useState(leerAvisosActivos());

  useEffect(() => {
    apiAuth.me().then(setUsuario);
    apiCuentas.listar().then((c) => setNumCuentas(c.length));
  }, []);

  function alternarAvisos() {
    const activos = !avisos;
    setAvisos(activos);
    establecerAvisosActivos(activos);
  }

  return (
    <div className="pantalla">
      <span className="config-titulo">Config</span>

      <TarjetaGlass padding="16px 18px" className="config-perfil" onClick={() => navigate("/config/perfil")}>
        <div className="config-perfil__avatar">
          {usuario?.avatar_url ? (
            <img src={usuario.avatar_url} alt="" className="config-perfil__avatar-imagen" />
          ) : (
            usuario?.name.charAt(0) ?? "M"
          )}
        </div>
        <div className="config-perfil__texto">
          <span className="config-perfil__nombre">{usuario?.name ?? "Cargando…"}</span>
          <span className="config-perfil__email">{usuario?.email}</span>
        </div>
        <CaretRight size={16} color="var(--color-texto-dim)" />
      </TarjetaGlass>

      <TarjetaGlass padding="4px 6px">
        <FilaConfig
          icono={Bell}
          texto="Avisos inteligentes"
          toggle={avisos}
          onToggle={alternarAvisos}
        />
        <Separador />
        <FilaConfig icono={Tag} texto="Categorías" onClick={() => navigate("/config/categorias")} />
        <Separador />
        <FilaConfig icono={Bank} texto="Cuentas conectadas" valorTexto={String(numCuentas)} onClick={() => navigate("/config/cuentas")} />
      </TarjetaGlass>

      <TarjetaGlass padding="4px 6px">
        <FilaConfig icono={Wallet} texto="Metas de ahorro" onClick={() => navigate("/config/metas")} />
        <Separador />
        <FilaConfig icono={Globe} texto="Preferencias" onClick={() => navigate("/config/preferencias")} />
        <Separador />
        <FilaConfig icono={ShieldCheck} texto="Seguridad" onClick={() => navigate("/config/seguridad")} />
      </TarjetaGlass>

      <TarjetaGlass padding="4px 6px">
        <FilaConfig icono={SignOut} texto="Cerrar sesión" destructivo onClick={() => navigate("/login")} />
      </TarjetaGlass>
    </div>
  );
}

function Separador() {
  return <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "0 12px" }} />;
}

function FilaConfig({
  icono: Icono,
  texto,
  valorTexto,
  toggle,
  onToggle,
  onClick,
  destructivo = false,
}: {
  icono: typeof Wallet;
  texto: string;
  valorTexto?: string;
  toggle?: boolean;
  onToggle?: () => void;
  onClick?: () => void;
  destructivo?: boolean;
}) {
  return (
    <div className="config-fila" onClick={onClick ?? onToggle}>
      <Icono size={18} color={destructivo ? "var(--color-gasto-claro)" : "var(--color-primario-link)"} />
      <span className="config-fila__texto" style={{ color: destructivo ? "var(--color-gasto-claro)" : undefined }}>
        {texto}
      </span>
      {valorTexto && <span className="config-fila__valor">{valorTexto}</span>}
      {toggle !== undefined && (
        <div className={`config-toggle ${toggle ? "config-toggle--activo" : ""}`}>
          <span className="config-toggle__bola" />
        </div>
      )}
      {onClick && valorTexto === undefined && toggle === undefined && <CaretRight size={14} color="var(--color-texto-dim)" />}
    </div>
  );
}
