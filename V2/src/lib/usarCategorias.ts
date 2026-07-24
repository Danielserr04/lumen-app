import { useEffect, useState } from "react";
import { apiCategorias } from "@/mocks/api";
import type { Category } from "@/types/entidades";
import type { CategoriaVisual } from "@/components/FilaMovimiento";
import { categorias as categoriasTokens, type IdCategoria } from "@/theme/tokens";

/**
 * Carga las categorías (sistema + usuario) una vez y expone un mapa por id, listo para
 * resolver la `CategoriaVisual` (nombre/icono/color) que consumen FilaMovimiento y
 * el informe de movimiento a partir del `category_id` de una Transaction.
 *
 * También traduce entre los ids fijos de `theme/tokens.ts` (los de los chips de selección,
 * tipados y estables) y el id real que asigna el backend. Se empareja por **nombre**, no
 * por icono: los iconos de tokens y los de la semilla no siempre coinciden
 * (`gas-pump`/`car`, `popcorn`/`confetti`…), pero los nombres sí.
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

  /** Id real (el que asigna el backend) de la categoría equivalente a un id de tokens. */
  function idPorToken(idToken: IdCategoria): string | undefined {
    const nombre = categoriasTokens[idToken].nombre.toLowerCase();
    return categorias.find((c) => c.name.toLowerCase() === nombre)?.id;
  }

  return { categorias, cargando, porId, visual, idPorToken };
}
