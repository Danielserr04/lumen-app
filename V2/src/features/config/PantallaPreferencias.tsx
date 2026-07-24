import { useNavigate } from "react-router-dom";
import { CabeceraPantalla } from "@/components/CabeceraPantalla";
import { TarjetaGlass } from "@/components/TarjetaGlass";
import "./Config.css";

/** Preferencias (§5.12: "idioma, moneda, tema"). Idioma y moneda fijos en esta versión (solo es-ES/EUR). */
export function PantallaPreferencias() {
  const navigate = useNavigate();

  return (
    <div className="pantalla pantalla--formulario">
      <CabeceraPantalla titulo="Preferencias" navegacion="volver" onNavegar={() => navigate(-1)} />

      <TarjetaGlass padding="4px 6px">
        <div className="config-fila">
          <span className="config-fila__texto">Idioma</span>
          <span className="config-fila__valor">Español</span>
        </div>
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "0 12px" }} />
        <div className="config-fila">
          <span className="config-fila__texto">Moneda</span>
          <span className="config-fila__valor">Euro (€)</span>
        </div>
      </TarjetaGlass>

      <TarjetaGlass padding="4px 6px">
        <div className="config-fila">
          <span className="config-fila__texto">Tema oscuro</span>
          <div className="config-toggle config-toggle--activo">
            <span className="config-toggle__bola" />
          </div>
        </div>
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "0 12px" }} />
        <div className="config-fila">
          <span className="config-fila__texto" style={{ color: "var(--color-texto-dim)" }}>
            Tema claro
          </span>
          <span className="config-etiqueta-proximamente">Próximamente</span>
        </div>
      </TarjetaGlass>
    </div>
  );
}
