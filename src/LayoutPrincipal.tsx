import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { NavInferior } from "@/components/NavInferior";

/**
 * Layout de las 5 pestañas principales (§5/§06): el contenido de cada pestaña se
 * renderiza vía <Outlet/> y la navegación inferior queda fija abajo del marco.
 */
export function LayoutPrincipal() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      <Outlet />
      <NavInferior rutaActiva={location.pathname} onNavegar={(ruta) => navigate(ruta)} />
    </>
  );
}
