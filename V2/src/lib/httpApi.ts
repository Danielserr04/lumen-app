/**
 * Cliente HTTP real — mismos exports y firmas que src/mocks/api.ts (§11/§14/§15 del
 * handoff), pero hablando con el backend real (server/, Fastify+Prisma+Postgres) en vez
 * de mantener el estado en memoria. Ninguna pantalla importa de aquí directamente: siguen
 * apuntando a "@/mocks/api", que ahora reexporta este módulo — así el cambio de mock a
 * backend real es un cambio de implementación, no de contrato, tal como estaba previsto.
 */
import type { Transaction, Budget, Recurring, Category, Account, SavingsGoal, Notification, User, BudgetDerivado } from "@/types/entidades";
import type { ResumenMensual, GastoPorCategoria, ComercioFrecuente, InsightAnalisis, VarianteInforme } from "@/lib/derivar";

const BASE_URL = import.meta.env.VITE_API_URL as string;
const CLAVE_TOKEN = "lumen_token";

let token: string | null = localStorage.getItem(CLAVE_TOKEN);

function establecerToken(nuevo: string) {
  token = nuevo;
  localStorage.setItem(CLAVE_TOKEN, nuevo);
}

function limpiarToken() {
  token = null;
  localStorage.removeItem(CLAVE_TOKEN);
}

/** Error uniforme de la API (§14 "Respuestas de error uniformes") — misma clase que el mock. */
export class ErrorApi extends Error {
  constructor(
    public codigo: number,
    mensaje: string,
  ) {
    super(mensaje);
  }
}

async function peticion<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  const respuesta = await fetch(`${BASE_URL}${ruta}`, {
    ...opciones,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opciones.headers,
    },
  });

  if (respuesta.status === 204) return undefined as T;
  const cuerpo = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    if (respuesta.status === 401) limpiarToken();
    throw new ErrorApi(respuesta.status, cuerpo.error ?? "Error de red");
  }
  return cuerpo as T;
}

const get = <T>(ruta: string) => peticion<T>(ruta);
const post = <T>(ruta: string, body?: unknown) => peticion<T>(ruta, { method: "POST", body: body !== undefined ? JSON.stringify(body) : undefined });
const patch = <T>(ruta: string, body: unknown) => peticion<T>(ruta, { method: "PATCH", body: JSON.stringify(body) });
const del = <T>(ruta: string) => peticion<T>(ruta, { method: "DELETE" });

function qs(params: object): string {
  const filtrado = Object.entries(params as Record<string, unknown>).filter(([, v]) => v !== undefined) as [string, string | number | boolean][];
  if (filtrado.length === 0) return "";
  return "?" + new URLSearchParams(filtrado.map(([k, v]) => [k, String(v)])).toString();
}

// ===================== §11.1 Transaction =====================

export interface FiltrosMovimientos {
  from?: string;
  to?: string;
  category_id?: string;
  account_id?: string;
  type?: "expense" | "income";
  status?: "cleared" | "pending";
  q?: string;
  is_recurring?: boolean;
}

export const apiMovimientos = {
  async listar(filtros: FiltrosMovimientos = {}): Promise<Transaction[]> {
    return get(`/transactions${qs(filtros)}`);
  },
  async obtener(id: string): Promise<Transaction> {
    return get(`/transactions/${id}`);
  },
  async crear(datos: Omit<Transaction, "id" | "user_id" | "created_at" | "currency" | "status"> & { status?: Transaction["status"] }): Promise<Transaction> {
    return post("/transactions", datos);
  },
  async editar(id: string, cambios: Partial<Transaction>): Promise<Transaction> {
    return patch(`/transactions/${id}`, cambios);
  },
  async eliminar(id: string): Promise<void> {
    await del(`/transactions/${id}`);
  },
  async deshacerEliminar(id: string): Promise<void> {
    await post(`/transactions/${id}/restore`);
  },
  async duplicar(id: string): Promise<Transaction> {
    return post(`/transactions/${id}/duplicate`);
  },
};

// ===================== §11.2 Budget =====================

export const apiPresupuestos = {
  async listar(periodo: string): Promise<BudgetDerivado[]> {
    return get(`/budgets${qs({ period: periodo })}`);
  },
  async crear(datos: Omit<Budget, "id" | "user_id">): Promise<Budget> {
    return post("/budgets", datos);
  },
  async editar(id: string, cambios: Partial<Budget>): Promise<Budget> {
    return patch(`/budgets/${id}`, cambios);
  },
  async eliminar(id: string): Promise<void> {
    await del(`/budgets/${id}`);
  },
};

// ===================== §11.3 Recurring =====================

export const apiRecurrentes = {
  async listar(): Promise<Recurring[]> {
    return get("/recurrings");
  },
  async crear(datos: Omit<Recurring, "id" | "user_id">): Promise<Recurring> {
    return post("/recurrings", datos);
  },
  async editar(id: string, cambios: Partial<Recurring>): Promise<Recurring> {
    return patch(`/recurrings/${id}`, cambios);
  },
  async eliminar(id: string): Promise<void> {
    await del(`/recurrings/${id}`);
  },
  async pausar(id: string): Promise<Recurring> {
    return post(`/recurrings/${id}/pause`);
  },
};

// ===================== §11.4 Category =====================

export const apiCategorias = {
  async listar(): Promise<Category[]> {
    return get("/categories");
  },
  async crear(datos: Omit<Category, "id" | "user_id" | "is_system">): Promise<Category> {
    return post("/categories", datos);
  },
  async editar(id: string, cambios: Partial<Category>): Promise<Category> {
    return patch(`/categories/${id}`, cambios);
  },
  async eliminar(id: string): Promise<void> {
    await del(`/categories/${id}`);
  },
};

// ===================== §11.5 Account =====================

export const apiCuentas = {
  async listar(): Promise<Account[]> {
    return get("/accounts");
  },
  async obtener(id: string): Promise<Account> {
    return get(`/accounts/${id}`);
  },
  async crear(datos: Omit<Account, "id" | "user_id" | "is_connected" | "last_sync_at" | "created_at" | "balance">): Promise<Account> {
    return post("/accounts", datos);
  },
  async editar(id: string, cambios: Partial<Account>): Promise<Account> {
    return patch(`/accounts/${id}`, cambios);
  },
  async eliminar(id: string): Promise<void> {
    await del(`/accounts/${id}`);
  },
  async sincronizar(id: string): Promise<Account> {
    return post(`/accounts/${id}/sync`);
  },
};

// ===================== §11.6 SavingsGoal =====================

export const apiMetas = {
  async listar(): Promise<SavingsGoal[]> {
    return get("/goals");
  },
  async crear(datos: Omit<SavingsGoal, "id" | "user_id" | "current_amount" | "created_at">): Promise<SavingsGoal> {
    return post("/goals", datos);
  },
  async editar(id: string, cambios: Partial<SavingsGoal>): Promise<SavingsGoal> {
    return patch(`/goals/${id}`, cambios);
  },
  async eliminar(id: string): Promise<void> {
    await del(`/goals/${id}`);
  },
  async aportar(id: string, importe: number): Promise<SavingsGoal> {
    return post(`/goals/${id}/contribute`, { amount: importe });
  },
};

// ===================== §11.7 User / Auth =====================

export const apiAuth = {
  async login(email: string, password: string): Promise<User> {
    const { user, token: nuevoToken } = await post<{ user: User; token: string }>("/auth/login", { email, password });
    establecerToken(nuevoToken);
    return user;
  },
  async signup(nombre: string, email: string, password: string): Promise<User> {
    const { user, token: nuevoToken } = await post<{ user: User; token: string }>("/auth/signup", { name: nombre, email, password });
    establecerToken(nuevoToken);
    return user;
  },
  async logout(): Promise<void> {
    limpiarToken();
  },
  async me(): Promise<User> {
    return get("/me");
  },
  async actualizarMe(cambios: Partial<User>): Promise<User> {
    return patch("/me", cambios);
  },
  async cambiarContrasena(actual: string, nueva: string): Promise<void> {
    await post("/auth/change-password", { actual, nueva });
  },
};

export function haySesion(): boolean {
  return token !== null;
}

// ===================== §14 Notification =====================

export const apiNotificaciones = {
  async listar(soloNoLeidas = false): Promise<Notification[]> {
    return get(`/notifications${qs({ read: soloNoLeidas ? "false" : undefined })}`);
  },
  async obtener(id: string): Promise<Notification> {
    return get(`/notifications/${id}`);
  },
  async marcarLeida(id: string): Promise<Notification> {
    return patch(`/notifications/${id}`, {});
  },
  async marcarTodasLeidas(): Promise<void> {
    await post("/notifications/read-all");
  },
  async eliminar(id: string): Promise<void> {
    await del(`/notifications/${id}`);
  },
  async contarNoLeidas(): Promise<number> {
    const { count } = await get<{ count: number }>("/notifications/unread-count");
    return count;
  },
  async drenarNuevas(): Promise<Notification[]> {
    return post("/notifications/drain-new");
  },
};

// ===================== §15 Endpoints derivados / analítica =====================

interface PuntoHistoricoApi {
  mes: string;
  etiqueta: string;
  ingresos: number;
  gastos: number;
  balanceDisponible: number;
}

export const apiAnalitica = {
  async resumen(periodo: string): Promise<ResumenMensual> {
    return get(`/summary${qs({ period: periodo })}`);
  },
  async gastoPorCategoria(periodo: string): Promise<GastoPorCategoria[]> {
    return get(`/analytics/by-category${qs({ period: periodo })}`);
  },
  async cashflowHistorico(): Promise<PuntoHistoricoApi[]> {
    return get(`/analytics/cashflow${qs({ range: 6 })}`);
  },
  async topComercios(periodo: string, limite = 5): Promise<ComercioFrecuente[]> {
    return get(`/analytics/top-merchants${qs({ period: periodo, limit: limite })}`);
  },
  async insights(periodo: string): Promise<InsightAnalisis[]> {
    return get(`/analytics/insights${qs({ period: periodo })}`);
  },
  async recurrentesProximos(): Promise<Recurring[]> {
    return get("/analytics/recurring-upcoming");
  },
  async informeMovimiento(id: string): Promise<{
    transaccion: Transaction;
    variante: VarianteInforme;
    cuenta?: Account;
    categoria?: Category;
    presupuesto?: BudgetDerivado;
    media: { mediaPorMes: number; visitasPorMes: number; ticketMedio: number };
    recurrente?: Recurring;
    original?: Transaction;
    otraPata?: Transaction;
  }> {
    return get(`/reports/transaction/${id}`);
  },
};
