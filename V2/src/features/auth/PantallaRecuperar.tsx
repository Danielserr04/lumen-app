import { useState } from "react";
import { Link } from "react-router-dom";
import { Boton } from "@/components/Boton";
import { CampoTexto } from "@/components/campos/CampoTexto";
import { EtiquetaCampo } from "@/components/campos/EtiquetaCampo";
import { CajaInsight } from "@/components/campos/CajaInsight";
import { apiAuth } from "@/mocks/api";
import "./Auth.css";

/** Recuperar contraseña (§12.8): email → enlace de restablecimiento. */
export function PantallaRecuperar() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);

  async function enviar() {
    if (!email.includes("@")) return;
    await apiAuth.recuperarContrasena(email);
    setEnviado(true);
  }

  return (
    <div className="pantalla-auth">
      <div className="auth-blob auth-blob--indigo" />
      <div className="auth-contenido">
        <div className="auth-logo" />
        <span className="auth-titulo">Recuperar contraseña</span>
        <span className="auth-subtitulo">Te enviaremos un enlace para restablecerla.</span>
        <div className="auth-campos">
          <div className="auth-campo">
            <EtiquetaCampo>Email</EtiquetaCampo>
            <CampoTexto type="email" placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>
        {enviado && <CajaInsight variante="exito" texto={`Si existe una cuenta con ${email}, recibirás un enlace en unos minutos.`} />}
        <div className="pantalla__cta-anclado">
          <Boton variante="primario" anchoCompleto onClick={enviar} disabled={enviado}>
            {enviado ? "Enlace enviado" : "Enviar enlace"}
          </Boton>
          <span className="auth-pie">
            <Link to="/login">Volver a iniciar sesión</Link>
          </span>
        </div>
      </div>
    </div>
  );
}
