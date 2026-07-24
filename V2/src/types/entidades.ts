/**
 * Entidades del modelo de datos — §8 del handoff (design_handoff_lumen_finanzas/README.md).
 * Los campos y sus nombres siguen EXACTAMENTE la spec para que enchufar un backend real
 * en el futuro sea un cambio de implementación del cliente HTTP, no del contrato de datos.
 * Importes SIEMPRE en céntimos enteros. Fechas en UTC (formato ISO 8601 string).
 *
 * Incluye también los campos "sugeridos" del §16 necesarios para resolver las variantes
 * A–K del informe de movimiento (transferencias, reembolsos, multi-moneda, financiación).
 */

export type Locale = "es";
export type Moneda = "EUR";
export type Tema = "dark" | "light";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  locale: Locale;
  currency: Moneda;
  theme: Tema;
  /**
   * Preferencia "Avisos inteligentes" (§5.12). Vive en el servidor porque es él quien la
   * consulta antes de generar cualquier notificación (§13.5), no la UI.
   */
  avisos_activos: boolean;
  created_at: string;
  updated_at: string;
}

export type TipoCuenta = "checking" | "card" | "cash";

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: TipoCuenta;
  bank_name: string | null;
  mask: string | null;
  balance: number;
  is_connected: boolean;
  last_sync_at: string | null;
  created_at: string;
}

export type TipoCategoria = "expense" | "income";

export interface Category {
  id: string;
  user_id: string | null;
  name: string;
  /** Nombre de icono Phosphor, p.ej. "fork-knife". */
  icon: string;
  color: string;
  tint: string;
  kind: TipoCategoria;
  is_system: boolean;
  sort_order: number;
}

export type EstadoTransaccion = "cleared" | "pending";

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string | null;
  /** Con signo: negativo = gasto, positivo = ingreso. Céntimos enteros. */
  amount: number;
  currency: Moneda;
  name: string;
  note: string | null;
  date: string;
  method: string | null;
  status: EstadoTransaccion;
  is_recurring: boolean;
  recurring_id: string | null;
  created_at: string;

  // Campos §16 — resuelven las variantes E, G, I, K del informe (§5.4).
  /** Transferencia interna: enlaza las dos patas del movimiento (caso E). */
  transfer_id?: string | null;
  /** Reembolso: id de la transacción de gasto original (caso G). */
  refund_of?: string | null;
  /** Moneda extranjera (caso I): importe original antes de convertir. */
  amount_original?: number | null;
  currency_original?: string | null;
  fx_rate?: number | null;
  /** Financiación a plazos (caso K). */
  installment_current?: number | null;
  installment_total?: number | null;
  deleted_at?: string | null;
}

export type Frecuencia = "monthly" | "weekly" | "yearly";

export interface Recurring {
  id: string;
  user_id: string;
  category_id: string;
  account_id: string;
  name: string;
  amount: number;
  frequency: Frecuencia;
  next_charge_date: string;
  start_date: string;
  active: boolean;

  // Campos §16 — financiación a plazos (caso K del informe §5.4).
  installment_current?: number | null;
  installment_total?: number | null;
}

export type PeriodoPresupuesto = "monthly";

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  limit_amount: number;
  period: PeriodoPresupuesto;
  alert_threshold: number;
  start_date: string;
}

/** Campos derivados de Budget — se calculan por query, no se almacenan (§8). */
export interface BudgetDerivado extends Budget {
  spent: number;
  available: number;
  percent: number;
  state: "ok" | "warning" | "over";
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  color: string;
  icon: string;
  created_at: string;
}

export type TipoNotificacion = "budget_alert" | "sync" | "insight";

export interface Notification {
  id: string;
  user_id: string;
  type: TipoNotificacion;
  title: string;
  body: string;
  related_transaction_id: string | null;
  read: boolean;
  created_at: string;

  // Campos §16
  severity?: "info" | "warning" | "error";
  action_type?: "ver_presupuesto" | "ver_movimientos_categoria" | "ver_movimiento" | "reintentar" | "ver_analisis" | "ver_meta";
  action_target_id?: string | null;
}
