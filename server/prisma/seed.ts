import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORIAS_SISTEMA = [
  { id: "cat-comida", name: "Comida", icon: "fork-knife", color: "#FFA35C", tint: "255,163,92", kind: "expense" as const, sort_order: 1 },
  { id: "cat-transporte", name: "Transporte", icon: "car", color: "#5CB3FF", tint: "92,179,255", kind: "expense" as const, sort_order: 2 },
  { id: "cat-ocio", name: "Ocio", icon: "confetti", color: "#B78CFF", tint: "183,140,255", kind: "expense" as const, sort_order: 3 },
  { id: "cat-suscripciones", name: "Suscripciones", icon: "repeat", color: "#FF7FC4", tint: "255,127,196", kind: "expense" as const, sort_order: 4 },
  { id: "cat-salud", name: "Salud", icon: "heartbeat", color: "#4FD9D0", tint: "79,217,208", kind: "expense" as const, sort_order: 5 },
  { id: "cat-tabaco", name: "Tabaco", icon: "cigarette", color: "#B08968", tint: "176,137,104", kind: "expense" as const, sort_order: 6 },
  { id: "cat-otros", name: "Otros", icon: "dots-three", color: "#98A2B8", tint: "152,162,184", kind: "expense" as const, sort_order: 7 },
  { id: "cat-ingreso", name: "Ingreso", icon: "hand-coins", color: "#4ADEA8", tint: "74,222,168", kind: "income" as const, sort_order: 8 },
];

async function main() {
  console.log("Sembrando datos de ejemplo…");

  await prisma.category.createMany({
    data: CATEGORIAS_SISTEMA.map((c) => ({ ...c, user_id: null, is_system: true })),
    skipDuplicates: true,
  });

  const password_hash = await bcrypt.hash("demo1234", 10);
  const usuario = await prisma.user.upsert({
    where: { email: "demo@lumen.app" },
    update: {},
    create: { email: "demo@lumen.app", name: "Marta", password_hash },
  });

  const cuentaVisa = await prisma.account.upsert({
    where: { id: "acc-visa-demo" },
    update: {},
    create: { id: "acc-visa-demo", user_id: usuario.id, name: "Visa ·· 4821", type: "checking", bank_name: "BBVA", mask: "·· 4821", balance: 182450, is_connected: true, last_sync_at: new Date() },
  });
  const cuentaEfectivo = await prisma.account.upsert({
    where: { id: "acc-efectivo-demo" },
    update: {},
    create: { id: "acc-efectivo-demo", user_id: usuario.id, name: "Efectivo", type: "cash", balance: 6000, is_connected: false },
  });

  const hoy = new Date();
  const hace = (dias: number) => new Date(hoy.getTime() - dias * 24 * 60 * 60 * 1000);

  // Variante A: gasto normal · B: ingreso · C: recurrente · D: pendiente · F: presupuesto
  // superado · H: sin categorizar · J: cuenta en efectivo. (E/G/I/K quedan para cuando se
  // usen los flujos de transferencia/reembolso/multidivisa/financiación desde la app.)
  await prisma.transaction.createMany({
    data: [
      { user_id: usuario.id, account_id: cuentaVisa.id, category_id: "cat-comida", amount: -4280, name: "Mercadona", date: hace(0), method: "Contactless", status: "cleared" },
      { user_id: usuario.id, account_id: cuentaVisa.id, category_id: "cat-ingreso", amount: 185000, name: "Nómina", date: hace(3), status: "cleared" },
      { user_id: usuario.id, account_id: cuentaVisa.id, category_id: "cat-suscripciones", amount: -1099, name: "Spotify", date: hace(5), status: "cleared", is_recurring: true },
      { user_id: usuario.id, account_id: cuentaVisa.id, category_id: "cat-transporte", amount: -6000, name: "Repsol", date: hace(1), status: "pending" },
      { user_id: usuario.id, account_id: cuentaVisa.id, category_id: "cat-ocio", amount: -12800, name: "Steam", date: hace(2), status: "cleared" },
      { user_id: usuario.id, account_id: cuentaVisa.id, category_id: null, amount: -1550, name: "Comercio desconocido", date: hace(4), status: "cleared" },
      { user_id: usuario.id, account_id: cuentaEfectivo.id, category_id: "cat-comida", amount: -800, name: "Panadería", date: hace(1), status: "cleared" },
    ],
  });

  await prisma.budget.createMany({
    data: [
      { user_id: usuario.id, category_id: "cat-ocio", limit_amount: 11000, period: "monthly", alert_threshold: 0.8, start_date: hoy },
      { user_id: usuario.id, category_id: "cat-comida", limit_amount: 20000, period: "monthly", alert_threshold: 0.8, start_date: hoy },
      { user_id: usuario.id, category_id: "cat-transporte", limit_amount: 15000, period: "monthly", alert_threshold: 0.8, start_date: hoy },
    ],
    skipDuplicates: true,
  });

  const proximoCargo = new Date(hoy);
  proximoCargo.setMonth(proximoCargo.getMonth() + 1);
  await prisma.recurring.upsert({
    where: { id: "rec-spotify-demo" },
    update: {},
    create: { id: "rec-spotify-demo", user_id: usuario.id, name: "Spotify", amount: -1099, category_id: "cat-suscripciones", account_id: cuentaVisa.id, frequency: "monthly", start_date: hace(30), next_charge_date: proximoCargo },
  });

  await prisma.savingsGoal.upsert({
    where: { id: "meta-viaje-demo" },
    update: {},
    create: { id: "meta-viaje-demo", user_id: usuario.id, name: "Viaje a Japón", target_amount: 200000, current_amount: 65000, color: "#42D0F4", icon: "airplane-tilt" },
  });

  console.log(`Listo. Usuario demo: demo@lumen.app / demo1234 (id ${usuario.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
