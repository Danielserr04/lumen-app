import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Boton } from "@/components/Boton";
import { CampoTexto } from "@/components/campos/CampoTexto";
import { EtiquetaCampo } from "@/components/campos/EtiquetaCampo";
import { ErrorCampo } from "@/components/campos/ErrorCampo";
import { apiAuth } from "@/mocks/api";
import "./Auth.css";

/** Login (§5.12.1, §12.8): email + contraseña, glass, CTA con degradado. */
export function PantallaLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    if (!email.includes("@")) return setError("Introduce un email válido");
    if (password.length < 4) return setError("La contraseña es demasiado corta");
    setError(null);
    setEnviando(true);
    try {
      await apiAuth.login(email, password);
      navigate("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo iniciar sesión");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="pantalla-auth">
      <div className="auth-blob auth-blob--indigo" />
      <div className="auth-contenido">
        <div className="auth-logo" />
        <span className="auth-titulo">Bienvenido</span>
        <span className="auth-subtitulo">Inicia sesión para ver tus finanzas.</span>
        <div className="auth-campos">
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
        <Link to="/recuperar" className="auth-enlace">
          ¿Olvidaste tu contraseña?
        </Link>
        <div className="pantalla__cta-anclado">
          <Boton variante="primario" anchoCompleto onClick={enviar} disabled={enviando}>
            {enviando ? "Entrando…" : "Iniciar sesión"}
          </Boton>
          <span className="auth-pie">
            ¿No tienes cuenta? <Link to="/signup">Crear cuenta</Link>
          </span>
        </div>
      </div>
    </div>
  );
}
