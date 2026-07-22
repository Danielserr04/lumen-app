import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera } from "@phosphor-icons/react";
import { CabeceraPantalla } from "@/components/CabeceraPantalla";
import { CampoTexto } from "@/components/campos/CampoTexto";
import { EtiquetaCampo } from "@/components/campos/EtiquetaCampo";
import { Boton } from "@/components/Boton";
import { apiAuth } from "@/mocks/api";
import { usarToasts } from "@/lib/ContextoToasts";
import type { User } from "@/types/entidades";
import "./Perfil.css";

/** Perfil de usuario (§5.12.2 Ajustes): nombre y foto de perfil (cambiable desde el dispositivo). */
export function PantallaPerfil() {
  const navigate = useNavigate();
  const { mostrar } = usarToasts();
  const inputArchivoRef = useRef<HTMLInputElement>(null);
  const [usuario, setUsuario] = useState<User | null>(null);
  const [nombre, setNombre] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    apiAuth.me().then((u) => {
      setUsuario(u);
      setNombre(u.name);
    });
  }, []);

  function abrirSelectorDeArchivo() {
    inputArchivoRef.current?.click();
  }

  function alSeleccionarArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    if (!archivo.type.startsWith("image/")) {
      mostrar("error", "Elige un archivo de imagen");
      return;
    }
    const lector = new FileReader();
    lector.onload = () => {
      const dataUrl = lector.result as string;
      setUsuario((prev) => (prev ? { ...prev, avatar_url: dataUrl } : prev));
    };
    lector.readAsDataURL(archivo);
  }

  async function guardar() {
    setGuardando(true);
    try {
      const actualizado = await apiAuth.actualizarMe({ name: nombre, avatar_url: usuario?.avatar_url ?? null });
      setUsuario(actualizado);
      mostrar("exito", "Perfil actualizado");
      navigate(-1);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="pantalla pantalla--formulario">
      <CabeceraPantalla titulo="Perfil" navegacion="volver" onNavegar={() => navigate(-1)} />

      <div className="perfil-avatar-bloque">
        <button type="button" className="perfil-avatar" onClick={abrirSelectorDeArchivo} aria-label="Cambiar foto de perfil">
          {usuario?.avatar_url ? (
            <img src={usuario.avatar_url} alt="" className="perfil-avatar__imagen" />
          ) : (
            <span className="perfil-avatar__inicial">{(usuario?.name ?? "?").charAt(0)}</span>
          )}
          <span className="perfil-avatar__badge">
            <Camera size={14} weight="fill" color="#0A0C13" />
          </span>
        </button>
        <input ref={inputArchivoRef} type="file" accept="image/*" className="perfil-input-oculto" onChange={alSeleccionarArchivo} />
        <span className="perfil-avatar__cambiar" onClick={abrirSelectorDeArchivo}>
          Cambiar foto
        </span>
      </div>

      <div className="formulario-movimiento__campo">
        <EtiquetaCampo>Nombre</EtiquetaCampo>
        <CampoTexto value={nombre} onChange={(e) => setNombre(e.target.value)} />
      </div>

      <div className="formulario-movimiento__campo">
        <EtiquetaCampo>Email</EtiquetaCampo>
        <CampoTexto value={usuario?.email ?? ""} disabled />
      </div>

      <div className="pantalla__cta-anclado">
        <Boton variante="primario" anchoCompleto onClick={guardar} disabled={guardando || !nombre.trim()}>
          {guardando ? "Guardando…" : "Guardar cambios"}
        </Boton>
      </div>
    </div>
  );
}
