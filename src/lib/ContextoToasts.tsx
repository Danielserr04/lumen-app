import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { Toast, type TipoToast } from "@/components/Retroalimentacion";

interface ToastActivo {
  id: number;
  tipo: TipoToast;
  mensaje: string;
  accion?: { texto: string; onClick: () => void };
}

interface ApiToasts {
  mostrar: (tipo: TipoToast, mensaje: string, accion?: ToastActivo["accion"]) => void;
}

const ContextoToasts = createContext<ApiToasts | null>(null);

/** Hook para lanzar toasts (§13.1) desde cualquier pantalla: `mostrar("exito", "Movimiento guardado")`. */
export function usarToasts(): ApiToasts {
  const ctx = useContext(ContextoToasts);
  if (!ctx) throw new Error("usarToasts debe usarse dentro de <ProveedorToasts>");
  return ctx;
}

const DURACION_MS: Record<TipoToast, number> = { exito: 3000, error: 3500, info: 3000, deshacer: 5000 };

export function ProveedorToasts({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastActivo[]>([]);
  const contadorId = useRef(0);

  const mostrar = useCallback<ApiToasts["mostrar"]>((tipo, mensaje, accion) => {
    const id = ++contadorId.current;
    setToasts((prev) => [...prev, { id, tipo, mensaje, accion }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, DURACION_MS[tipo]);
  }, []);

  return (
    <ContextoToasts.Provider value={{ mostrar }}>
      {children}
      <div className="contenedor-toasts">
        {toasts.map((t) => (
          <Toast key={t.id} tipo={t.tipo} mensaje={t.mensaje} accion={t.accion} />
        ))}
      </div>
    </ContextoToasts.Provider>
  );
}
