import { useEffect, useState } from "react";
import { apiCategorias } from "@/mocks/api";
import type { Category } from "@/types/entidades";
import type { CategoriaVisual } from "@/components/FilaMovimiento";

/**
 * Carga las categorías (sistema + usuario) una vez y expone un mapa por id, listo para
 * resolver la `CategoriaVisual` (nombre/icono/color) que consumen FilaMovimiento y
 * el informe de movimiento a partir del `category_id` de una Transaction.
 */
export function usarCategorias() {
  const [categorias, setCategorias] = useState<Category[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    apiCategorias.listar().then((lista) => {
      setCategorias(lista);
      setCargando(false);
    });
  }, []);

  function porId(id: string | null | undefined): Category | undefined {
    if (!id) return undefined;
    return categorias.find((c) => c.id === id);
  }

  function visual(id: string | null | undefined): CategoriaVisual | null {
    const cat = porId(id);
    if (!cat) return null;
    return { nombre: cat.name, icono: cat.icon, color: cat.color };
  }

  return { categorias, cargando, porId, visual };
}
