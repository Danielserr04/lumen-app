import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { NavInferior } from "@/components/NavInferior";
import { haySesion } from "@/lib/httpApi";

/**
 * Layout de las 5 pestañas principales (§5/§06): el contenido de cada pestaña se
 * renderiza vía <Outlet/> y la navegación inferior queda fija abajo del marco.
 * Sin sesión (sin JWT guardado) redirige a /login en vez de dejar la pantalla
 * lanzando peticiones 401 contra el backend real.
 */
export function LayoutPrincipal() {
  const location = useLocation();
  const navigate = useNavigate();

  if (!haySesion()) return <Navigate to="/login" replace />;

  return (
    <>
      <Outlet />
      <NavInferior rutaActiva={location.pathname} onNavegar={(ruta) => navigate(ruta)} />
    </>
  );
}
