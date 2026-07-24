import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CabeceraPantalla } from "@/components/CabeceraPantalla";
import { CampoTexto } from "@/components/campos/CampoTexto";
import { EtiquetaCampo } from "@/components/campos/EtiquetaCampo";
import { Boton } from "@/components/Boton";
import { TarjetaGlass } from "@/components/TarjetaGlass";
import { apiAuth, ErrorApi } from "@/mocks/api";
import { usarToasts } from "@/lib/ContextoToasts";
import "./Config.css";

const CLAVE_BIOMETRIA = "lumen_biometria_activa";

/** Seguridad (§5.12: "cambiar contraseña, biometría toggle"). */
export function PantallaSeguridad() {
  const navigate = useNavigate();
  const { mostrar } = usarToasts();
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [biometria, setBiometria] = useState(() => localStorage.getItem(CLAVE_BIOMETRIA) === "1");

  function alternarBiometria() {
    const activa = !biometria;
    setBiometria(activa);
    localStorage.setItem(CLAVE_BIOMETRIA, activa ? "1" : "0");
    mostrar("exito", activa ? "Desbloqueo biométrico activado" : "Desbloqueo biométrico desactivado");
  }

  async function guardar() {
    setError(null);
    if (nueva !== confirmar) {
      setError("Las contraseñas nuevas no coinciden.");
      return;
    }
    setGuardando(true);
    try {
      await apiAuth.cambiarContrasena(actual, nueva);
      mostrar("exito", "Contraseña actualizada");
      setActual("");
      setNueva("");
      setConfirmar("");
    } catch (e) {
      setError(e instanceof ErrorApi ? e.message : "No se pudo cambiar la contraseña.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="pantalla pantalla--formulario">
      <CabeceraPantalla titulo="Seguridad" navegacion="volver" onNavegar={() => navigate(-1)} />

      <TarjetaGlass padding="4px 6px">
        <div className="config-fila" onClick={alternarBiometria}>
          <span className="config-fila__texto">Desbloqueo biométrico</span>
          <div className={`config-toggle ${biometria ? "config-toggle--activo" : ""}`}>
            <span className="config-toggle__bola" />
          </div>
        </div>
      </TarjetaGlass>

      <div className="formulario-movimiento__campo">
        <EtiquetaCampo>Contraseña actual</EtiquetaCampo>
        <CampoTexto type="password" value={actual} onChange={(e) => setActual(e.target.value)} />
      </div>
      <div className="formulario-movimiento__campo">
        <EtiquetaCampo>Nueva contraseña</EtiquetaCampo>
        <CampoTexto type="password" value={nueva} onChange={(e) => setNueva(e.target.value)} />
      </div>
      <div className="formulario-movimiento__campo">
        <EtiquetaCampo>Confirmar nueva contraseña</EtiquetaCampo>
        <CampoTexto type="password" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} error={!!error} />
        {error && <span className="config-error">{error}</span>}
      </div>

      <div className="pantalla__cta-anclado">
        <Boton
          variante="primario"
          anchoCompleto
          onClick={guardar}
          disabled={guardando || !actual || !nueva || !confirmar}
        >
          {guardando ? "Guardando…" : "Cambiar contraseña"}
        </Boton>
      </div>
    </div>
  );
}
