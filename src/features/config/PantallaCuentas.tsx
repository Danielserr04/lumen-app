import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bank, Plus } from "@phosphor-icons/react";
import { CabeceraPantalla } from "@/components/CabeceraPantalla";
import { TarjetaGlass } from "@/components/TarjetaGlass";
import { formatearEuros, formatearTiempoRelativo } from "@/lib/formato";
import { apiCuentas } from "@/mocks/api";
import type { Account } from "@/types/entidades";
import "./Config.css";

const NOMBRE_TIPO = { checking: "Cuenta corriente", card: "Tarjeta", cash: "Efectivo" } as const;

/** Cuentas conectadas (§5.7): lista con saldo y última sincronización, acceso a conectar una nueva. */
export function PantallaCuentas() {
  const navigate = useNavigate();
  const [cuentas, setCuentas] = useState<Account[]>([]);

  useEffect(() => {
    apiCuentas.listar().then(setCuentas);
  }, []);

  return (
    <div className="pantalla">
      <CabeceraPantalla
        titulo="Cuentas conectadas"
        navegacion="volver"
        onNavegar={() => navigate(-1)}
        accionDerecha={
          <span className="formulario-movimiento__guardar-texto" onClick={() => navigate("/cuentas/conectar")}>
            <Plus size={16} style={{ verticalAlign: "middle" }} /> Añadir
          </span>
        }
      />

      {cuentas.map((c) => (
        <TarjetaGlass key={c.id} padding="16px 18px" className="config-perfil">
          <div className="config-perfil__avatar" style={{ background: "rgba(255,255,255,0.08)" }}>
            <Bank size={18} color="#8B93A7" />
          </div>
          <div className="config-perfil__texto">
            <span className="config-perfil__nombre">{c.name}</span>
            <span className="config-perfil__email">
              {NOMBRE_TIPO[c.type]} · {formatearEuros(c.balance)}
              {c.last_sync_at && ` · sync ${formatearTiempoRelativo(c.last_sync_at)}`}
            </span>
          </div>
        </TarjetaGlass>
      ))}
    </div>
  );
}
