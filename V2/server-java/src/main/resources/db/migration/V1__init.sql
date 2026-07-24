-- Esquema de Lumen — espejo de server/prisma/schema.prisma (ahora gestionado por Flyway).
-- Enums como VARCHAR + CHECK (evita depender de tipos ENUM nativos y simplifica el mapeo
-- JPA con @Enumerated(EnumType.STRING)). Importes en INTEGER (céntimos enteros).

create table users (
  id              uuid primary key,
  email           varchar(255) not null unique,
  password_hash   varchar(255) not null,
  name            varchar(255) not null,
  avatar_url      text,
  locale          varchar(10)  not null default 'es',
  currency        varchar(10)  not null default 'EUR',
  theme           varchar(10)  not null default 'dark' check (theme in ('dark','light')),
  avisos_activos  boolean      not null default true,
  created_at      timestamptz  not null default now(),
  updated_at      timestamptz  not null default now()
);

create table accounts (
  id             uuid primary key,
  user_id        uuid not null references users(id) on delete cascade,
  name           varchar(255) not null,
  type           varchar(20) not null check (type in ('checking','card','cash')),
  bank_name      varchar(255),
  mask           varchar(20),
  balance        integer not null default 0,
  is_connected   boolean not null default false,
  last_sync_at   timestamptz,
  created_at     timestamptz not null default now()
);
create index idx_accounts_user on accounts(user_id);

create table categories (
  id          uuid primary key,
  user_id     uuid references users(id) on delete cascade,
  name        varchar(255) not null,
  icon        varchar(100) not null,
  color       varchar(20) not null,
  tint        varchar(50) not null,
  kind        varchar(20) not null check (kind in ('expense','income')),
  is_system   boolean not null default false,
  sort_order  integer not null default 0
);
create index idx_categories_user on categories(user_id);

create table recurrings (
  id                    uuid primary key,
  user_id               uuid not null references users(id) on delete cascade,
  category_id           uuid not null references categories(id),
  account_id            uuid not null references accounts(id),
  name                  varchar(255) not null,
  amount                integer not null,
  frequency             varchar(20) not null check (frequency in ('monthly','weekly','yearly')),
  next_charge_date      timestamptz not null,
  start_date            timestamptz not null,
  active                boolean not null default true,
  installment_current   integer,
  installment_total     integer
);
create index idx_recurrings_user_next on recurrings(user_id, next_charge_date);

create table transactions (
  id                    uuid primary key,
  user_id               uuid not null references users(id) on delete cascade,
  account_id            uuid not null references accounts(id),
  category_id           uuid references categories(id),
  amount                integer not null,
  currency              varchar(10) not null default 'EUR',
  name                  varchar(255) not null,
  note                  text,
  date                  timestamptz not null,
  method                varchar(100),
  status                varchar(20) not null default 'cleared' check (status in ('cleared','pending')),
  is_recurring          boolean not null default false,
  recurring_id          uuid references recurrings(id),
  created_at            timestamptz not null default now(),
  transfer_id           uuid,
  refund_of             uuid,
  amount_original       integer,
  currency_original     varchar(10),
  fx_rate               double precision,
  installment_current   integer,
  installment_total     integer,
  deleted_at            timestamptz
);
create index idx_transactions_user_date on transactions(user_id, date);
create index idx_transactions_category on transactions(category_id);
create index idx_transactions_account on transactions(account_id);

create table budgets (
  id               uuid primary key,
  user_id          uuid not null references users(id) on delete cascade,
  category_id      uuid not null references categories(id),
  limit_amount     integer not null,
  period           varchar(20) not null default 'monthly',
  alert_threshold  double precision not null default 0.80,
  start_date       timestamptz not null
);
create index idx_budgets_user_cat_period on budgets(user_id, category_id, period);

create table savings_goals (
  id              uuid primary key,
  user_id         uuid not null references users(id) on delete cascade,
  name            varchar(255) not null,
  target_amount   integer not null,
  current_amount  integer not null default 0,
  deadline        timestamptz,
  color           varchar(20) not null,
  icon            varchar(100) not null,
  created_at      timestamptz not null default now()
);
create index idx_savings_goals_user on savings_goals(user_id);

create table notifications (
  id                       uuid primary key,
  user_id                  uuid not null references users(id) on delete cascade,
  type                     varchar(20) not null check (type in ('budget_alert','sync','insight')),
  title                    varchar(255) not null,
  body                     text not null,
  related_transaction_id   uuid references transactions(id),
  read                     boolean not null default false,
  created_at               timestamptz not null default now(),
  severity                 varchar(20) not null default 'info' check (severity in ('info','warning','error')),
  action_type              varchar(50),
  action_target_id         varchar(255)
);
create index idx_notifications_user_read on notifications(user_id, read);
