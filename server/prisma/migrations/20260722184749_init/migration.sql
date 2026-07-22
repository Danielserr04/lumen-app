-- CreateEnum
CREATE TYPE "Tema" AS ENUM ('dark', 'light');

-- CreateEnum
CREATE TYPE "TipoCuenta" AS ENUM ('checking', 'card', 'cash');

-- CreateEnum
CREATE TYPE "TipoCategoria" AS ENUM ('expense', 'income');

-- CreateEnum
CREATE TYPE "EstadoTransaccion" AS ENUM ('cleared', 'pending');

-- CreateEnum
CREATE TYPE "Frecuencia" AS ENUM ('monthly', 'weekly', 'yearly');

-- CreateEnum
CREATE TYPE "TipoNotificacion" AS ENUM ('budget_alert', 'sync', 'insight');

-- CreateEnum
CREATE TYPE "SeveridadNotificacion" AS ENUM ('info', 'warning', 'error');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'es',
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "theme" "Tema" NOT NULL DEFAULT 'dark',
    "avisos_activos" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "TipoCuenta" NOT NULL,
    "bank_name" TEXT,
    "mask" TEXT,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "is_connected" BOOLEAN NOT NULL DEFAULT false,
    "last_sync_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "tint" TEXT NOT NULL,
    "kind" "TipoCategoria" NOT NULL,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "category_id" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "name" TEXT NOT NULL,
    "note" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "method" TEXT,
    "status" "EstadoTransaccion" NOT NULL DEFAULT 'cleared',
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "recurring_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transfer_id" TEXT,
    "refund_of" TEXT,
    "amount_original" INTEGER,
    "currency_original" TEXT,
    "fx_rate" DOUBLE PRECISION,
    "installment_current" INTEGER,
    "installment_total" INTEGER,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recurring" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "frequency" "Frecuencia" NOT NULL,
    "next_charge_date" TIMESTAMP(3) NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "installment_current" INTEGER,
    "installment_total" INTEGER,

    CONSTRAINT "Recurring_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Budget" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "limit_amount" INTEGER NOT NULL,
    "period" TEXT NOT NULL DEFAULT 'monthly',
    "alert_threshold" DOUBLE PRECISION NOT NULL DEFAULT 0.80,
    "start_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavingsGoal" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "target_amount" INTEGER NOT NULL,
    "current_amount" INTEGER NOT NULL DEFAULT 0,
    "deadline" TIMESTAMP(3),
    "color" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavingsGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "TipoNotificacion" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "related_transaction_id" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "severity" "SeveridadNotificacion" NOT NULL DEFAULT 'info',
    "action_type" TEXT,
    "action_target_id" TEXT,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Account_user_id_idx" ON "Account"("user_id");

-- CreateIndex
CREATE INDEX "Category_user_id_idx" ON "Category"("user_id");

-- CreateIndex
CREATE INDEX "Transaction_user_id_date_idx" ON "Transaction"("user_id", "date");

-- CreateIndex
CREATE INDEX "Transaction_category_id_idx" ON "Transaction"("category_id");

-- CreateIndex
CREATE INDEX "Transaction_account_id_idx" ON "Transaction"("account_id");

-- CreateIndex
CREATE INDEX "Recurring_user_id_next_charge_date_idx" ON "Recurring"("user_id", "next_charge_date");

-- CreateIndex
CREATE INDEX "Budget_user_id_category_id_period_idx" ON "Budget"("user_id", "category_id", "period");

-- CreateIndex
CREATE INDEX "SavingsGoal_user_id_idx" ON "SavingsGoal"("user_id");

-- CreateIndex
CREATE INDEX "Notification_user_id_read_idx" ON "Notification"("user_id", "read");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_recurring_id_fkey" FOREIGN KEY ("recurring_id") REFERENCES "Recurring"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recurring" ADD CONSTRAINT "Recurring_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recurring" ADD CONSTRAINT "Recurring_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recurring" ADD CONSTRAINT "Recurring_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavingsGoal" ADD CONSTRAINT "SavingsGoal_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_related_transaction_id_fkey" FOREIGN KEY ("related_transaction_id") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
