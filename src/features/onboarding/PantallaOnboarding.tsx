import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bank, CaretRight, CaretLeft } from "@phosphor-icons/react";
import { Boton } from "@/components/Boton";
import { CajaInsight } from "@/components/campos/CajaInsight";
import { Slider } from "@/components/campos/Slider";
import { formatearEurosSinDecimales } from "@/lib/formato";
import "./Onboarding.css";

const BANCOS_DISPONIBLES = ["Banco Sabadell", "BBVA", "CaixaBank"];

/** Onboarding de 3 pasos (§5.10/§16 sección 16 del prototipo): bienvenida → conectar banco → presupuesto inicial. */
export function PantallaOnboarding() {
  const navigate = useNavigate();
  const [paso, setPaso] = useState(0);
  const [presupuesto, setPresupuesto] = useState(200000); // 2.000 € en céntimos

  function terminar() {
    navigate("/dashboard");
  }

  return (
    <div className="pantalla-onboarding">
      <div className={`onboarding-blob onboarding-blob--paso${paso}`} />

      {paso === 0 && (
        <div className="onboarding-paso onboarding-paso--centrado">
          <div className="onboarding-logo" />
          <div className="onboarding-intro">
            <span className="onboarding-titulo">Lumen</span>
            <span className="onboarding-descripcion">
              Controla tu dinero de un vistazo: presupuestos, movimientos e informes en un mismo sitio.
            </span>
          </div>
          <div className="onboarding-pie">
            <Boton variante="primario" anchoCompleto onClick={() => setPaso(1)}>
              Empezar
            </Boton>
            <span className="onboarding-enlace" onClick={() => navigate("/login")}>
              Ya tengo cuenta · Iniciar sesión
            </span>
            <PuntosPaginacion paso={0} color="#8F86FF" />
          </div>
        </div>
      )}

      {paso === 1 && (
        <div className="onboarding-paso">
          <div className="onboarding-nav-fila">
            <button type="button" className="onboarding-volver" onClick={() => setPaso(0)} aria-label="Volver">
              <CaretLeft size={20} color="#A9B0C0" />
            </button>
            <span className="onboarding-paso-label">Paso 2 de 3</span>
          </div>
          <div className="onboarding-cabecera-paso">
            <span className="onboarding-titulo-paso">Conecta tu banco</span>
            <span className="onboarding-subtitulo-paso">
              Verás tus movimientos automáticamente. Puedes omitir este paso y añadirlos a mano.
            </span>
          </div>
          <div className="onboarding-lista-bancos">
            {BANCOS_DISPONIBLES.map((banco) => (
              <div key={banco} className="onboarding-fila-banco" onClick={() => setPaso(2)}>
                <div className="onboarding-fila-banco__icono">
                  <Bank size={18} color="#8B93A7" />
                </div>
                <span className="onboarding-fila-banco__nombre">{banco}</span>
                <CaretRight size={14} color="#5C6478" />
              </div>
            ))}
          </div>
          <div className="onboarding-pie">
            <span className="onboarding-enlace onboarding-enlace--centrado" onClick={() => setPaso(2)}>
              Omitir por ahora
            </span>
            <PuntosPaginacion paso={1} color="#4ADEA8" />
          </div>
        </div>
      )}

      {paso === 2 && (
        <div className="onboarding-paso">
          <div className="onboarding-nav-fila">
            <button type="button" className="onboarding-volver" onClick={() => setPaso(1)} aria-label="Volver">
              <CaretLeft size={20} color="#A9B0C0" />
            </button>
            <span className="onboarding-paso-label">Paso 3 de 3</span>
          </div>
          <div className="onboarding-cabecera-paso">
            <span className="onboarding-titulo-paso">Fija tu presupuesto</span>
            <span className="onboarding-subtitulo-paso">¿Cuánto quieres gastar al mes? Podrás ajustarlo después.</span>
          </div>
          <div className="onboarding-importe">
            <span className="onboarding-importe__valor">{formatearEurosSinDecimales(presupuesto)}</span>
            <span className="onboarding-importe__pista">al mes</span>
          </div>
          <Slider valor={presupuesto} onCambiar={setPresupuesto} min={50000} max={500000} step={5000} />
          <CajaInsight texto="Basado en tus últimos movimientos, podrías empezar con 1.900–2.100 €." />
          <div className="onboarding-pie">
            <Boton variante="primario" anchoCompleto onClick={terminar}>
              Terminar
            </Boton>
            <PuntosPaginacion paso={2} color="#FF7FC4" />
          </div>
        </div>
      )}
    </div>
  );
}

function PuntosPaginacion({ paso, color }: { paso: number; color: string }) {
  return (
    <div className="onboarding-puntos">
      {[0, 1, 2].map((i) => (
        <span key={i} className="onboarding-punto" style={{ background: i === paso ? color : "rgba(255,255,255,0.15)", width: i === paso ? 20 : 6 }} />
      ))}
    </div>
  );
}
