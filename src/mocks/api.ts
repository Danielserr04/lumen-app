/**
 * Cliente mock con la misma forma que tendría el backend real (§11 CRUD por entidad +
 * §15 endpoints derivados). Vive en memoria durante la sesión del navegador — al recargar
 * la página se reinicia a las fixtures de src/mocks/data/. El objetivo es que enchufar un
 * backend real después sea cambiar la implementación de estas funciones, no sus firmas.
 */
import type { Transaction, Budget, Recurring, Category, Account, SavingsGoal, Notification, User } from "@/types/entidades";
import { movimientos as movimientosIniciales } from "./data/movimientos";
import { presupuestos as presupuestosIniciales } from "./data/presupuestos";
import { recurrentes as recurrentesIniciales } from "./data/recurrentes";
import { categoriasSistema } from "./data/categorias";
import { cuentas as cuentasIniciales } from "./data/cuentas";
import { metasAhorro as metasIniciales } from "./data/metas";
import { notificaciones as notificacionesIniciales } from "./data/notificaciones";
import { usuarioActual } from "./data/usuario";
import {
  calcularResumenMensual,
  calcularPresupuestosDerivados,
  calcularGastoPorCategoria,
  calcularMediaPorComercio,
  calcularTopComercios,
  generarInsightsAnalisis,
  resolverVarianteInforme,
  buscarCuenta,
  buscarCategoria,
  mesDe,
  type ResumenMensual,
} from "@/lib/derivar";
import { historicoMensual } from "./data/historico";
import { formatearEuros, formatearPorcentaje } from "@/lib/formato";
import { avisosActivos } from "@/lib/preferenciasNotificaciones";

// --- Estado en memoria (simula las tablas de la BD) ---
let db = {
  usuario: { ...usuarioActual },
  cuentas: [...cuentasIniciales] as Account[],
  categorias: [...categoriasSistema] as Category[],
  movimientos: [...movimientosIniciales] as Transaction[],
  recurrentes: [...recurrentesIniciales] as Recurring[],
  presupuestos: [...presupuestosIniciales] as Budget[],
  metas: [...metasIniciales] as SavingsGoal[],
  notificaciones: [...notificacionesIniciales] as Notification[],
};

const RETRASO_MS = 350;

function esperar<T>(valor: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(valor), RETRASO_MS));
}

function generarId(prefijo: string): string {
  return `${prefijo}-${Math.random().toString(36).slice(2, 9)}`;
}

// ===================== §13.5 Alertas de negocio → §14 Notification =====================
// Aquí es donde los mensajes "saltan" de verdad: no son datos de ejemplo fijos, se generan
// como efecto lateral de las acciones del usuario (crear/editar movimiento, conectar banco,
// completar una meta), igual que haría un backend real con sus jobs y triggers (§11, §13.5).

/** Notificaciones recién creadas en esta sesión, pendientes de mostrarse como toast. */
let colaNotificacionesNuevas: Notification[] = [];

function registrarNotificacion(datos: Omit<Notification, "id" | "user_id" | "read" | "created_at">): Notification | null {
  if (!avisosActivos()) return null;
  const notificacion: Notification = {
    ...datos,
    id: generarId("notif"),
    user_id: db.usuario.id,
    read: false,
    created_at: new Date().toISOString(),
  };
  db.notificaciones = [notificacion, ...db.notificaciones];
  colaNotificacionesNuevas = [...colaNotificacionesNuevas, notificacion];
  return notificacion;
}

function ordenEstadoPresupuesto(estado: "ok" | "warning" | "over" | null): number {
  return estado === "over" ? 2 : estado === "warning" ? 1 : 0;
}

/**
 * Compara el estado del presupuesto de una categoría antes/después de una mutación y,
 * si ha empeorado (cruza 80% o 100%, §13.5 budget_alert), dispara la notificación.
 * No repite aviso si el estado no ha cambiado a peor (evita spam en cada transacción).
 */
function dispararAlertaPresupuestoSiEmpeora(
  categoryId: string,
  periodo: string,
  estadoAntes: "ok" | "warning" | "over" | null,
) {
  const derivado = calcularPresupuestosDerivados(periodo).find((b) => b.category_id === categoryId);
  if (!derivado) return;
  if (ordenEstadoPresupuesto(derivado.state) <= ordenEstadoPresupuesto(estadoAntes)) return;

  const categoria = buscarCategoria(categoryId);
  const nombre = categoria?.name ?? "una categoría";
  if (derivado.state === "over") {
    registrarNotificacion({
      type: "budget_alert",
      severity: "error",
      title: `Has superado tu presupuesto de ${nombre}`,
      body: `Llevas ${formatearEuros(derivado.spent)} de ${formatearEuros(derivado.limit_amount)} en ${nombre} este mes.`,
      related_transaction_id: null,
      action_type: "ver_presupuesto",
      action_target_id: categoryId,
    });
  } else if (derivado.state === "warning") {
    registrarNotificacion({
      type: "budget_alert",
      severity: "warning",
      title: `Cerca del límite en ${nombre}`,
      body: `Vas por el ${formatearPorcentaje(derivado.percent)} de tu presupuesto de ${nombre} este mes.`,
      related_transaction_id: null,
      action_type: "ver_movimientos_categoria",
      action_target_id: categoryId,
    });
  }
}

function estadoPresupuestoDeCategoria(categoryId: string | null, periodo: string): "ok" | "warning" | "over" | null {
  if (!categoryId) return null;
  return calcularPresupuestosDerivados(periodo).find((b) => b.category_id === categoryId)?.state ?? null;
}

/** Error uniforme de la API (§14 "Respuestas de error uniformes"). */
export class ErrorApi extends Error {
  constructor(
    public codigo: number,
    mensaje: string,
  ) {
    super(mensaje);
  }
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
    let lista = db.movimientos.filter((t) => !t.deleted_at);
    if (filtros.from) lista = lista.filter((t) => t.date >= filtros.from!);
    if (filtros.to) lista = lista.filter((t) => t.date <= filtros.to!);
    if (filtros.category_id) lista = lista.filter((t) => t.category_id === filtros.category_id);
    if (filtros.account_id) lista = lista.filter((t) => t.account_id === filtros.account_id);
    if (filtros.type) lista = lista.filter((t) => (filtros.type === "expense" ? t.amount < 0 : t.amount > 0));
    if (filtros.status) lista = lista.filter((t) => t.status === filtros.status);
    if (filtros.is_recurring !== undefined) lista = lista.filter((t) => t.is_recurring === filtros.is_recurring);
    if (filtros.q) {
      const q = filtros.q.toLowerCase();
      lista = lista.filter((t) => t.name.toLowerCase().includes(q) || (t.note ?? "").toLowerCase().includes(q));
    }
    lista = [...lista].sort((a, b) => b.date.localeCompare(a.date));
    return esperar(lista);
  },

  async obtener(id: string): Promise<Transaction> {
    const tx = db.movimientos.find((t) => t.id === id);
    if (!tx) throw new ErrorApi(404, "Movimiento no encontrado");
    return esperar(tx);
  },

  async crear(datos: Omit<Transaction, "id" | "user_id" | "created_at" | "currency" | "status"> & { status?: Transaction["status"] }): Promise<Transaction> {
    if (datos.amount === 0) throw new ErrorApi(400, "El importe no puede ser 0 €");
    const periodo = mesDe(datos.date);
    const estadoAntes = estadoPresupuestoDeCategoria(datos.category_id, periodo);

    const nuevo: Transaction = {
      ...datos,
      id: generarId("tx"),
      user_id: db.usuario.id,
      currency: "EUR",
      status: datos.status ?? "cleared",
      created_at: new Date().toISOString(),
    };
    db.movimientos = [nuevo, ...db.movimientos];

    if (datos.category_id && datos.amount < 0) dispararAlertaPresupuestoSiEmpeora(datos.category_id, periodo, estadoAntes);
    return esperar(nuevo);
  },

  async editar(id: string, cambios: Partial<Transaction>): Promise<Transaction> {
    const idx = db.movimientos.findIndex((t) => t.id === id);
    if (idx === -1) throw new ErrorApi(404, "Movimiento no encontrado");
    const anterior = db.movimientos[idx];

    // §11.1: cambiar categoría/importe/fecha recalcula el presupuesto de antes y el de después.
    const categoriaDespues = cambios.category_id !== undefined ? cambios.category_id : anterior.category_id;
    const periodoDespues = mesDe(cambios.date ?? anterior.date);
    const categoriaCambio = categoriaDespues !== anterior.category_id;
    const estadoAntesCategoriaAnterior = estadoPresupuestoDeCategoria(anterior.category_id, mesDe(anterior.date));
    const estadoAntesCategoriaNueva = categoriaCambio ? estadoPresupuestoDeCategoria(categoriaDespues, periodoDespues) : estadoAntesCategoriaAnterior;

    const actualizado = { ...anterior, ...cambios };
    db.movimientos = db.movimientos.map((t, i) => (i === idx ? actualizado : t));

    if (categoriaDespues && actualizado.amount < 0) {
      dispararAlertaPresupuestoSiEmpeora(categoriaDespues, periodoDespues, estadoAntesCategoriaNueva);
    }
    return esperar(actualizado);
  },

  async eliminar(id: string): Promise<void> {
    // Soft delete (§16.13) para poder deshacer desde el toast.
    db.movimientos = db.movimientos.map((t) => (t.id === id ? { ...t, deleted_at: new Date().toISOString() } : t));
    return esperar(undefined);
  },

  async deshacerEliminar(id: string): Promise<void> {
    db.movimientos = db.movimientos.map((t) => (t.id === id ? { ...t, deleted_at: null } : t));
    return esperar(undefined);
  },

  async duplicar(id: string): Promise<Transaction> {
    const original = db.movimientos.find((t) => t.id === id);
    if (!original) throw new ErrorApi(404, "Movimiento no encontrado");
    const copia: Transaction = { ...original, id: generarId("tx"), date: new Date().toISOString(), created_at: new Date().toISOString() };
    db.movimientos = [copia, ...db.movimientos];
    return esperar(copia);
  },
};

// ===================== §11.2 Budget =====================

export const apiPresupuestos = {
  async listar(periodo: string) {
    return esperar(calcularPresupuestosDerivados(periodo));
  },
  async crear(datos: Omit<Budget, "id" | "user_id">): Promise<Budget> {
    const yaExiste = db.presupuestos.some((b) => b.category_id === datos.category_id && b.period === datos.period);
    if (yaExiste) throw new ErrorApi(409, "Ya existe un presupuesto activo para esta categoría");
    const nuevo: Budget = { ...datos, id: generarId("bud"), user_id: db.usuario.id };
    db.presupuestos = [...db.presupuestos, nuevo];
    return esperar(nuevo);
  },
  async editar(id: string, cambios: Partial<Budget>): Promise<Budget> {
    const idx = db.presupuestos.findIndex((b) => b.id === id);
    if (idx === -1) throw new ErrorApi(404, "Presupuesto no encontrado");
    const actualizado = { ...db.presupuestos[idx], ...cambios };
    db.presupuestos = db.presupuestos.map((b, i) => (i === idx ? actualizado : b));
    return esperar(actualizado);
  },
  async eliminar(id: string): Promise<void> {
    db.presupuestos = db.presupuestos.filter((b) => b.id !== id);
    return esperar(undefined);
  },
};

// ===================== §11.3 Recurring =====================

export const apiRecurrentes = {
  async listar(): Promise<Recurring[]> {
    return esperar([...db.recurrentes].sort((a, b) => a.next_charge_date.localeCompare(b.next_charge_date)));
  },
  async crear(datos: Omit<Recurring, "id" | "user_id">): Promise<Recurring> {
    const nuevo: Recurring = { ...datos, id: generarId("rec"), user_id: db.usuario.id };
    db.recurrentes = [...db.recurrentes, nuevo];
    return esperar(nuevo);
  },
  async editar(id: string, cambios: Partial<Recurring>): Promise<Recurring> {
    const idx = db.recurrentes.findIndex((r) => r.id === id);
    if (idx === -1) throw new ErrorApi(404, "Recurrente no encontrado");
    const actualizado = { ...db.recurrentes[idx], ...cambios };
    db.recurrentes = db.recurrentes.map((r, i) => (i === idx ? actualizado : r));
    return esperar(actualizado);
  },
  async eliminar(id: string): Promise<void> {
    db.recurrentes = db.recurrentes.filter((r) => r.id !== id);
    return esperar(undefined);
  },
  async pausar(id: string): Promise<Recurring> {
    const idx = db.recurrentes.findIndex((r) => r.id === id);
    if (idx === -1) throw new ErrorApi(404, "Recurrente no encontrado");
    const actualizado = { ...db.recurrentes[idx], active: !db.recurrentes[idx].active };
    db.recurrentes = db.recurrentes.map((r, i) => (i === idx ? actualizado : r));
    return esperar(actualizado);
  },
};

// ===================== §11.4 Category =====================

export const apiCategorias = {
  async listar(): Promise<Category[]> {
    return esperar([...db.categorias].sort((a, b) => a.sort_order - b.sort_order));
  },
  async crear(datos: Omit<Category, "id" | "user_id" | "is_system">): Promise<Category> {
    const nueva: Category = { ...datos, id: generarId("cat"), user_id: db.usuario.id, is_system: false };
    db.categorias = [...db.categorias, nueva];
    return esperar(nueva);
  },
  async editar(id: string, cambios: Partial<Category>): Promise<Category> {
    const cat = db.categorias.find((c) => c.id === id);
    if (!cat) throw new ErrorApi(404, "Categoría no encontrada");
    if (cat.is_system) throw new ErrorApi(403, "Las categorías de sistema no se pueden editar");
    const actualizado = { ...cat, ...cambios };
    db.categorias = db.categorias.map((c) => (c.id === id ? actualizado : c));
    return esperar(actualizado);
  },
  async eliminar(id: string): Promise<void> {
    const tieneMovimientos = db.movimientos.some((t) => t.category_id === id && !t.deleted_at);
    if (tieneMovimientos) throw new ErrorApi(409, "La categoría tiene movimientos asociados; reasigna a Otros primero");
    db.categorias = db.categorias.filter((c) => c.id !== id);
    return esperar(undefined);
  },
};

// ===================== §11.5 Account =====================

export const apiCuentas = {
  async listar(): Promise<Account[]> {
    return esperar([...db.cuentas]);
  },
  async obtener(id: string): Promise<Account> {
    const cuenta = db.cuentas.find((c) => c.id === id);
    if (!cuenta) throw new ErrorApi(404, "Cuenta no encontrada");
    return esperar(cuenta);
  },
  async crear(datos: Omit<Account, "id" | "user_id" | "is_connected" | "last_sync_at" | "created_at" | "balance">): Promise<Account> {
    const nueva: Account = {
      ...datos,
      id: generarId("acc"),
      user_id: db.usuario.id,
      balance: 0,
      is_connected: datos.type !== "cash",
      last_sync_at: null,
      created_at: new Date().toISOString(),
    };
    db.cuentas = [...db.cuentas, nueva];

    if (nueva.type !== "cash") {
      registrarNotificacion({
        type: "sync",
        severity: "info",
        title: `${nueva.bank_name ?? nueva.name} conectado`,
        body: `Ya puedes ver los movimientos de ${nueva.bank_name ?? nueva.name} en Lumen.`,
        related_transaction_id: null,
        action_type: "ver_analisis",
        action_target_id: null,
      });
    }
    return esperar(nueva);
  },
  async editar(id: string, cambios: Partial<Account>): Promise<Account> {
    const idx = db.cuentas.findIndex((c) => c.id === id);
    if (idx === -1) throw new ErrorApi(404, "Cuenta no encontrada");
    const actualizado = { ...db.cuentas[idx], ...cambios };
    db.cuentas = db.cuentas.map((c, i) => (i === idx ? actualizado : c));
    return esperar(actualizado);
  },
  async eliminar(id: string): Promise<void> {
    const tieneMovimientos = db.movimientos.some((t) => t.account_id === id && !t.deleted_at);
    if (tieneMovimientos) throw new ErrorApi(409, "La cuenta tiene movimientos asociados");
    db.cuentas = db.cuentas.filter((c) => c.id !== id);
    return esperar(undefined);
  },
  async sincronizar(id: string): Promise<Account> {
    const idx = db.cuentas.findIndex((c) => c.id === id);
    if (idx === -1) throw new ErrorApi(404, "Cuenta no encontrada");
    const actualizado = { ...db.cuentas[idx], last_sync_at: new Date().toISOString() };
    db.cuentas = db.cuentas.map((c, i) => (i === idx ? actualizado : c));
    registrarNotificacion({
      type: "sync",
      severity: "info",
      title: "Sincronización completada",
      body: `${actualizado.bank_name ?? actualizado.name} actualizado con tus últimos movimientos.`,
      related_transaction_id: null,
      action_type: "ver_analisis",
      action_target_id: null,
    });
    return esperar(actualizado);
  },
};

// ===================== §11.6 SavingsGoal =====================

export const apiMetas = {
  async listar(): Promise<SavingsGoal[]> {
    return esperar([...db.metas]);
  },
  async crear(datos: Omit<SavingsGoal, "id" | "user_id" | "current_amount" | "created_at">): Promise<SavingsGoal> {
    const nueva: SavingsGoal = { ...datos, id: generarId("meta"), user_id: db.usuario.id, current_amount: 0, created_at: new Date().toISOString() };
    db.metas = [...db.metas, nueva];
    return esperar(nueva);
  },
  async editar(id: string, cambios: Partial<SavingsGoal>): Promise<SavingsGoal> {
    const idx = db.metas.findIndex((m) => m.id === id);
    if (idx === -1) throw new ErrorApi(404, "Meta no encontrada");
    const actualizado = { ...db.metas[idx], ...cambios };
    db.metas = db.metas.map((m, i) => (i === idx ? actualizado : m));
    return esperar(actualizado);
  },
  async eliminar(id: string): Promise<void> {
    db.metas = db.metas.filter((m) => m.id !== id);
    return esperar(undefined);
  },
  async aportar(id: string, importe: number): Promise<SavingsGoal> {
    const idx = db.metas.findIndex((m) => m.id === id);
    if (idx === -1) throw new ErrorApi(404, "Meta no encontrada");
    const anterior = db.metas[idx];
    const actualizado = { ...anterior, current_amount: anterior.current_amount + importe };
    db.metas = db.metas.map((m, i) => (i === idx ? actualizado : m));

    // §11.6 "Notifica al llegar al 100%" — solo al cruzar la meta, no en cada aportación posterior.
    if (anterior.current_amount < anterior.target_amount && actualizado.current_amount >= actualizado.target_amount) {
      registrarNotificacion({
        type: "insight",
        severity: "info",
        title: "Objetivo de ahorro cumplido",
        body: `Has alcanzado tu meta "${actualizado.name}": ${formatearEuros(actualizado.target_amount)}.`,
        related_transaction_id: null,
        action_type: "ver_meta",
        action_target_id: actualizado.id,
      });
    }
    return esperar(actualizado);
  },
};

// ===================== §11.7 User / Auth =====================

export const apiAuth = {
  async login(_email: string, _password: string): Promise<User> {
    return esperar(db.usuario);
  },
  async signup(nombre: string, email: string, _password: string): Promise<User> {
    db.usuario = { ...db.usuario, name: nombre, email };
    return esperar(db.usuario);
  },
  async logout(): Promise<void> {
    return esperar(undefined);
  },
  async me(): Promise<User> {
    return esperar(db.usuario);
  },
  async actualizarMe(cambios: Partial<User>): Promise<User> {
    db.usuario = { ...db.usuario, ...cambios, updated_at: new Date().toISOString() };
    return esperar(db.usuario);
  },
  async cambiarContrasena(actual: string, nueva: string): Promise<void> {
    if (actual.length < 4) throw new ErrorApi(400, "La contraseña actual no es correcta.");
    if (nueva.length < 8) throw new ErrorApi(400, "La nueva contraseña debe tener al menos 8 caracteres.");
    return esperar(undefined);
  },
};

// ===================== §14 Notification =====================

export const apiNotificaciones = {
  async listar(soloNoLeidas = false): Promise<Notification[]> {
    let lista = [...db.notificaciones];
    if (soloNoLeidas) lista = lista.filter((n) => !n.read);
    lista.sort((a, b) => b.created_at.localeCompare(a.created_at));
    return esperar(lista);
  },
  async obtener(id: string): Promise<Notification> {
    const n = db.notificaciones.find((x) => x.id === id);
    if (!n) throw new ErrorApi(404, "Notificación no encontrada");
    return esperar(n);
  },
  async marcarLeida(id: string): Promise<Notification> {
    const idx = db.notificaciones.findIndex((n) => n.id === id);
    if (idx === -1) throw new ErrorApi(404, "Notificación no encontrada");
    const actualizado = { ...db.notificaciones[idx], read: true };
    db.notificaciones = db.notificaciones.map((n, i) => (i === idx ? actualizado : n));
    return esperar(actualizado);
  },
  async marcarTodasLeidas(): Promise<void> {
    db.notificaciones = db.notificaciones.map((n) => ({ ...n, read: true }));
    return esperar(undefined);
  },
  async eliminar(id: string): Promise<void> {
    db.notificaciones = db.notificaciones.filter((n) => n.id !== id);
    return esperar(undefined);
  },
  async contarNoLeidas(): Promise<number> {
    return esperar(db.notificaciones.filter((n) => !n.read).length);
  },
  /**
   * Vacía y devuelve las notificaciones que acaban de dispararse (§13.5) desde la última
   * vez que se llamó. Las pantallas que ejecutan una acción (guardar movimiento, conectar
   * banco, aportar a una meta) la consultan justo después para mostrar el toast al momento;
   * la notificación ya quedó guardada en la lista/campana aunque no se muestre el toast.
   */
  async drenarNuevas(): Promise<Notification[]> {
    const nuevas = colaNotificacionesNuevas;
    colaNotificacionesNuevas = [];
    return esperar(nuevas);
  },
};

// ===================== §15 Endpoints derivados / analítica =====================

export const apiAnalitica = {
  async resumen(periodo: string): Promise<ResumenMensual> {
    return esperar(calcularResumenMensual(periodo));
  },
  async gastoPorCategoria(periodo: string) {
    return esperar(calcularGastoPorCategoria(periodo));
  },
  /** Histórico mensual (§15 /analytics/cashflow) para el gráfico "Balance entre meses". */
  async cashflowHistorico() {
    return esperar(historicoMensual);
  },
  async topComercios(periodo: string, limite = 5) {
    return esperar(calcularTopComercios(periodo, limite));
  },
  async insights(periodo: string) {
    return esperar(generarInsightsAnalisis(periodo));
  },
  async recurrentesProximos(): Promise<Recurring[]> {
    const activos = db.recurrentes.filter((r) => r.active);
    return esperar([...activos].sort((a, b) => a.next_charge_date.localeCompare(b.next_charge_date)));
  },
  /** §15 GET /reports/transaction/:id — detalle enriquecido que resuelve la variante A–K. */
  async informeMovimiento(id: string) {
    const tx = db.movimientos.find((t) => t.id === id);
    if (!tx) throw new ErrorApi(404, "Movimiento no encontrado");
    const presupuestosDerivados = calcularPresupuestosDerivados(tx.date.slice(0, 7));
    const variante = resolverVarianteInforme(tx, presupuestosDerivados);
    const cuenta = buscarCuenta(tx.account_id);
    const categoria = buscarCategoria(tx.category_id);
    const presupuesto = presupuestosDerivados.find((b) => b.category_id === tx.category_id);
    const media = calcularMediaPorComercio(tx.name);
    const recurrente = tx.recurring_id ? db.recurrentes.find((r) => r.id === tx.recurring_id) : undefined;
    const original = tx.refund_of ? db.movimientos.find((t) => t.id === tx.refund_of) : undefined;
    const otraPata = tx.transfer_id ? db.movimientos.find((t) => t.transfer_id === tx.transfer_id && t.id !== tx.id) : undefined;
    return esperar({ transaccion: tx, variante, cuenta, categoria, presupuesto, media, recurrente, original, otraPata });
  },
};

/** Solo para depuración/desarrollo: acceso directo al estado en memoria. */
export function _resetearDb() {
  db = {
    usuario: { ...usuarioActual },
    cuentas: [...cuentasIniciales],
    categorias: [...categoriasSistema],
    movimientos: [...movimientosIniciales],
    recurrentes: [...recurrentesIniciales],
    presupuestos: [...presupuestosIniciales],
    metas: [...metasIniciales],
    notificaciones: [...notificacionesIniciales],
  };
  colaNotificacionesNuevas = [];
}
