import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Boton } from "@/components/Boton";
import { CampoTexto } from "@/components/campos/CampoTexto";
import { EtiquetaCampo } from "@/components/campos/EtiquetaCampo";
import { ErrorCampo } from "@/components/campos/ErrorCampo";
import { apiAuth } from "@/mocks/api";
import "./Auth.css";

/** Signup (§12.8): nombre + email + contraseña. */
export function PantallaSignup() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    if (nombre.trim().length < 2) return setError("Introduce tu nombre");
    if (!email.includes("@")) return setError("Introduce un email válido");
    if (password.length < 8) return setError("La contraseña debe tener al menos 8 caracteres");
    setError(null);
    setEnviando(true);
    try {
      await apiAuth.signup(nombre, email, password);
      navigate("/onboarding");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo crear la cuenta");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="pantalla-auth">
      <div className="auth-blob auth-blob--cian" />
      <div className="auth-contenido">
        <div className="auth-logo" />
        <span className="auth-titulo">Crea tu cuenta</span>
        <span className="auth-subtitulo">Empieza a controlar tus finanzas en minutos.</span>
        <div className="auth-campos">
          <div className="auth-campo">
            <EtiquetaCampo>Nombre</EtiquetaCampo>
            <CampoTexto placeholder="Tu nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>
          <div className="auth-campo">
            <EtiquetaCampo>Email</EtiquetaCampo>
            <CampoTexto type="email" placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="auth-campo">
            <EtiquetaCampo>Contraseña</EtiquetaCampo>
            <CampoTexto type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} error={!!error} />
            {error && <ErrorCampo mensaje={error} />}
          </div>
        </div>
        <div className="pantalla__cta-anclado">
          <Boton variante="primario" anchoCompleto onClick={enviar} disabled={enviando}>
            {enviando ? "Creando cuenta…" : "Crear cuenta"}
          </Boton>
          <span className="auth-pie">
            ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
          </span>
        </div>
      </div>
    </div>
  );
}
