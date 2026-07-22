import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, CaretRight } from "@phosphor-icons/react";
import { CabeceraPantalla } from "@/components/CabeceraPantalla";
import { TarjetaGlass } from "@/components/TarjetaGlass";
import { IconoConHalo } from "@/components/IconoConHalo";
import { EtiquetaSeccion } from "@/components/EtiquetaSeccion";
import { apiCategorias } from "@/mocks/api";
import type { Category } from "@/types/entidades";
import "./Config.css";

/** Lista de categorías (§5.12.3): de sistema + del usuario, con acceso a crear nuevas. */
export function PantallaCategorias() {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState<Category[]>([]);

  useEffect(() => {
    apiCategorias.listar().then(setCategorias);
  }, []);

  const sistema = categorias.filter((c) => c.is_system);
  const propias = categorias.filter((c) => !c.is_system);

  return (
    <div className="pantalla">
      <CabeceraPantalla
        titulo="Categorías"
        navegacion="volver"
        onNavegar={() => navigate(-1)}
        accionDerecha={
          <span className="formulario-movimiento__guardar-texto" onClick={() => navigate("/config/categorias/nueva")}>
            <Plus size={16} style={{ verticalAlign: "middle" }} /> Nueva
          </span>
        }
      />

      <EtiquetaSeccion>Sistema</EtiquetaSeccion>
      <TarjetaGlass padding="4px 6px">
        {sistema.map((cat, i) => (
          <div key={cat.id}>
            <div className="config-fila">
              <IconoConHalo icono={cat.icon} color={cat.color} tamano={36} radio={10} tamanoIcono={17} />
              <span className="config-fila__texto">{cat.name}</span>
              <span className="config-fila__valor">{cat.kind === "expense" ? "Gasto" : "Ingreso"}</span>
            </div>
            {i < sistema.length - 1 && <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "0 12px" }} />}
          </div>
        ))}
      </TarjetaGlass>

      {propias.length > 0 && (
        <>
          <EtiquetaSeccion>Tuyas</EtiquetaSeccion>
          <TarjetaGlass padding="4px 6px">
            {propias.map((cat, i) => (
              <div key={cat.id}>
                <div className="config-fila" onClick={() => navigate(`/config/categorias/${cat.id}/editar`)}>
                  <IconoConHalo icono={cat.icon} color={cat.color} tamano={36} radio={10} tamanoIcono={17} />
                  <span className="config-fila__texto">{cat.name}</span>
                  <CaretRight size={14} color="var(--color-texto-dim)" />
                </div>
                {i < propias.length - 1 && <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "0 12px" }} />}
              </div>
            ))}
          </TarjetaGlass>
        </>
      )}
    </div>
  );
}
