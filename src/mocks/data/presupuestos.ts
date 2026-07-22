import type { Budget } from "@/types/entidades";

/**
 * `spent`/`available`/`percent`/`state` NO se guardan (§8): se calculan en
 * `src/lib/derivar.ts` a partir de las transacciones del mes. Aquí solo el límite.
 */
export const presupuestos: Budget[] = [
  { id: "bud-comida", user_id: "user-1", category_id: "cat-comida", limit_amount: 40000, period: "monthly", alert_threshold: 0.8, start_date: "2026-07-01T00:00:00.000Z" },
  { id: "bud-transporte", user_id: "user-1", category_id: "cat-transporte", limit_amount: 15000, period: "monthly", alert_threshold: 0.8, start_date: "2026-07-01T00:00:00.000Z" },
  { id: "bud-ocio", user_id: "user-1", category_id: "cat-ocio", limit_amount: 11000, period: "monthly", alert_threshold: 0.8, start_date: "2026-07-01T00:00:00.000Z" },
  { id: "bud-suscripciones", user_id: "user-1", category_id: "cat-suscripciones", limit_amount: 6000, period: "monthly", alert_threshold: 0.8, start_date: "2026-07-01T00:00:00.000Z" },
  { id: "bud-salud", user_id: "user-1", category_id: "cat-salud", limit_amount: 8000, period: "monthly", alert_threshold: 0.8, start_date: "2026-07-01T00:00:00.000Z" },
  { id: "bud-otros", user_id: "user-1", category_id: "cat-otros", limit_amount: 20000, period: "monthly", alert_threshold: 0.8, start_date: "2026-07-01T00:00:00.000Z" },
];
