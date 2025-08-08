-- CryptoBoost initial schema for Supabase (PostgreSQL)
-- Ready to run in Supabase SQL Editor. Idempotent where possible.

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- Roles table
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text unique not null
);

-- Users table (application-level users; independent from Supabase auth.users)
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  role_id uuid references public.roles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Investment plans
create table if not exists public.investment_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  min_amount numeric(18,2) not null default 0,
  profit_percent numeric(6,2) not null default 0,
  duration_days integer not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- User investments
create table if not exists public.user_investments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  plan_id uuid not null references public.investment_plans(id) on delete restrict,
  amount numeric(18,2) not null,
  start_date timestamptz not null default now(),
  end_date timestamptz,
  status text not null default 'active' -- active | completed | cancelled
);

-- Transactions
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null check (type in ('deposit','withdrawal')),
  amount numeric(18,2) not null,
  currency text not null default 'USDT',
  status text not null default 'pending', -- pending | approved | rejected
  created_at timestamptz not null default now()
);

-- Crypto wallets
create table if not exists public.crypto_wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  currency text not null,
  address text not null,
  is_system boolean not null default false,
  created_at timestamptz not null default now()
);

-- Notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  body text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- System logs
create table if not exists public.system_logs (
  id uuid primary key default gen_random_uuid(),
  level text not null default 'info',
  message text not null,
  context jsonb,
  created_at timestamptz not null default now()
);

-- Seed default roles
insert into public.roles (name)
values ('client') on conflict (name) do nothing;
insert into public.roles (name)
values ('admin') on conflict (name) do nothing;

-- Seed default admin user
-- Change the email after running if needed.
insert into public.users (email, role_id)
select 'admin@cryptoboost.world', r.id from public.roles r where r.name = 'admin'
on conflict (email) do nothing;

-- Example investment plans
insert into public.investment_plans (name, min_amount, profit_percent, duration_days)
values
  ('Starter', 50, 15, 30),
  ('Pro', 200, 25, 45),
  ('Expert', 500, 35, 60)
on conflict do nothing;

-- RLS (optional baseline). Uncomment if you wire with auth.uid().
-- alter table public.users enable row level security;
-- alter table public.user_investments enable row level security;
-- alter table public.transactions enable row level security;
-- alter table public.crypto_wallets enable row level security;
-- alter table public.notifications enable row level security;
--
-- create policy "Users can view self" on public.users
--   for select using (true);
-- create policy "Owner can manage own investments" on public.user_investments
--   for all using (true) with check (true);