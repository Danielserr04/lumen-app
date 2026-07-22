import type { SavingsGoal } from "@/types/entidades";

export const metasAhorro: SavingsGoal[] = [
  {
    id: "meta-vacaciones",
    user_id: "user-1",
    name: "Vacaciones",
    target_amount: 150000,
    current_amount: 90000,
    deadline: "2026-12-01T00:00:00.000Z",
    color: "#42D0F4",
    icon: "airplane-tilt",
    created_at: "2026-02-01T09:00:00.000Z",
  },
  {
    id: "meta-fondo",
    user_id: "user-1",
    name: "Fondo de emergencia",
    target_amount: 500000,
    current_amount: 300000,
    deadline: null,
    color: "#4ADEA8",
    icon: "piggy-bank",
    created_at: "2025-06-01T09:00:00.000Z",
  },
];
