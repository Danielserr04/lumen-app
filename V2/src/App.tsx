import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProveedorToasts } from "@/lib/ContextoToasts";
import { LayoutPrincipal } from "@/LayoutPrincipal";

import { PantallaOnboarding } from "@/features/onboarding/PantallaOnboarding";
import { PantallaLogin } from "@/features/auth/PantallaLogin";
import { PantallaSignup } from "@/features/auth/PantallaSignup";
import { PantallaRecuperar } from "@/features/auth/PantallaRecuperar";

import { PantallaDashboard } from "@/features/dashboard/PantallaDashboard";
import { PantallaMovimientos } from "@/features/movimientos/PantallaMovimientos";
import { PantallaInformeMovimiento } from "@/features/movimientos/PantallaInformeMovimiento";
import { PantallaFormularioMovimiento } from "@/features/movimientos/PantallaFormularioMovimiento";
import { PantallaRecurrentes } from "@/features/recurrentes/PantallaRecurrentes";
import { PantallaFormularioRecurrente } from "@/features/recurrentes/PantallaFormularioRecurrente";
import { PantallaAnalisis } from "@/features/analisis/PantallaAnalisis";

import { PantallaConfig } from "@/features/config/PantallaConfig";
import { PantallaPerfil } from "@/features/config/PantallaPerfil";
import { PantallaCategorias } from "@/features/config/PantallaCategorias";
import { PantallaFormularioCategoria } from "@/features/config/PantallaFormularioCategoria";
import { PantallaMetas } from "@/features/config/PantallaMetas";
import { PantallaFormularioMeta } from "@/features/config/PantallaFormularioMeta";
import { PantallaCuentas } from "@/features/config/PantallaCuentas";
import { PantallaSeguridad } from "@/features/config/PantallaSeguridad";
import { PantallaPreferencias } from "@/features/config/PantallaPreferencias";

import { PantallaConectarCuenta } from "@/features/cuentas/PantallaConectarCuenta";
import { PantallaFormularioPresupuesto } from "@/features/presupuestos/PantallaFormularioPresupuesto";
import { PantallaNotificaciones } from "@/features/notificaciones/PantallaNotificaciones";
import { PantallaDetalleNotificacion } from "@/features/notificaciones/PantallaDetalleNotificacion";

import "./App.css";

/**
 * Árbol de rutas de Lumen. Las 5 pestañas (§5) viven bajo <LayoutPrincipal/> que añade
 * la navegación inferior; onboarding, auth y las pantallas de formulario/detalle se
 * apilan por encima sin nav, como en el prototipo (cabecera con volver/cerrar).
 */
export function App() {
  return (
    <BrowserRouter>
      <ProveedorToasts>
        <div className="lienzo-app">
          <div className="ventana-app">
            <Routes>
              <Route path="/" element={<Navigate to="/onboarding" replace />} />
              <Route path="/onboarding" element={<PantallaOnboarding />} />
              <Route path="/login" element={<PantallaLogin />} />
              <Route path="/signup" element={<PantallaSignup />} />
              <Route path="/recuperar" element={<PantallaRecuperar />} />

              <Route element={<LayoutPrincipal />}>
                <Route path="/dashboard" element={<PantallaDashboard />} />
                <Route path="/movimientos" element={<PantallaMovimientos />} />
                <Route path="/movimientos/:id" element={<PantallaInformeMovimiento />} />
                <Route path="/recurrentes" element={<PantallaRecurrentes />} />
                <Route path="/analisis" element={<PantallaAnalisis />} />
                <Route path="/config" element={<PantallaConfig />} />
                <Route path="/config/perfil" element={<PantallaPerfil />} />
                <Route path="/config/categorias" element={<PantallaCategorias />} />
                <Route path="/config/metas" element={<PantallaMetas />} />
                <Route path="/config/cuentas" element={<PantallaCuentas />} />
                <Route path="/config/seguridad" element={<PantallaSeguridad />} />
                <Route path="/config/preferencias" element={<PantallaPreferencias />} />
              </Route>

              {/* Formularios y flujos que se apilan por encima, sin nav inferior */}
              <Route path="/movimientos/nuevo" element={<PantallaFormularioMovimiento />} />
              <Route path="/movimientos/:id/editar" element={<PantallaFormularioMovimiento />} />
              <Route path="/recurrentes/nuevo" element={<PantallaFormularioRecurrente />} />
              <Route path="/recurrentes/:id/editar" element={<PantallaFormularioRecurrente />} />
              <Route path="/presupuestos/nuevo" element={<PantallaFormularioPresupuesto />} />
              <Route path="/cuentas/conectar" element={<PantallaConectarCuenta />} />
              <Route path="/config/categorias/nueva" element={<PantallaFormularioCategoria />} />
              <Route path="/config/categorias/:id/editar" element={<PantallaFormularioCategoria />} />
              <Route path="/config/metas/nueva" element={<PantallaFormularioMeta />} />
              <Route path="/notificaciones" element={<PantallaNotificaciones />} />
              <Route path="/notificaciones/:id" element={<PantallaDetalleNotificacion />} />

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </div>
      </ProveedorToasts>
    </BrowserRouter>
  );
}
