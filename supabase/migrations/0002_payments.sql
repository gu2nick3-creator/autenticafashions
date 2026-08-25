-- Autentica Fashions - Mercado Pago payment tracking
-- Adds columns to reconcile orders with Mercado Pago preferences/payments,
-- plus SECURITY DEFINER RPCs the serverless webhook/checkout functions can
-- call using only the public anon key + a shared secret (so we don't need
-- to hand those functions the Supabase service_role key).

alter table public.orders
  add column if not exists mp_preference_id text,
  add column if not exists mp_payment_id text,
  add column if not exists payment_status text not null default 'pending',
  add column if not exists payment_method text;

create unique index if not exists orders_mp_payment_id_idx
  on public.orders (mp_payment_id)
  where mp_payment_id is not null;

-- =========================================================
-- app_secrets: RLS enabled, no policies -> unreachable via PostgREST/anon.
-- Only readable from inside SECURITY DEFINER functions below.
-- =========================================================
create table if not exists public.app_secrets (
  key text primary key,
  value text not null
);

alter table public.app_secrets enable row level security;

-- Set the shared secret (use the SAME value as MP_WEBHOOK_SECRET on Vercel):
insert into public.app_secrets (key, value)
values ('mp_webhook_secret', 'c6b321d2f14661ae31d4e89dbdb087c9cfa97699a7c53672033fe189d264d666')
on conflict (key) do update set value = excluded.value;

create or replace function public.check_webhook_secret(p_secret text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select p_secret is not null
    and p_secret = (select value from public.app_secrets where key = 'mp_webhook_secret');
$$;

-- =========================================================
-- RPC: set_order_preference
-- Called right after creating the Mercado Pago preference for an order.
-- =========================================================
create or replace function public.set_order_preference(
  p_order_id uuid,
  p_secret text,
  p_mp_preference_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.check_webhook_secret(p_secret) then
    raise exception 'invalid secret';
  end if;

  update public.orders
  set mp_preference_id = p_mp_preference_id
  where id = p_order_id;
end;
$$;

grant execute on function public.set_order_preference(uuid, text, text) to anon, authenticated;

-- =========================================================
-- RPC: mark_order_paid
-- Called by the /api/mercadopago/webhook serverless function whenever
-- Mercado Pago notifies a payment update for an order.
-- =========================================================
create or replace function public.mark_order_paid(
  p_order_id uuid,
  p_secret text,
  p_mp_payment_id text,
  p_payment_status text,
  p_payment_method text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.check_webhook_secret(p_secret) then
    raise exception 'invalid secret';
  end if;

  update public.orders
  set
    mp_payment_id = p_mp_payment_id,
    payment_status = p_payment_status,
    payment_method = coalesce(p_payment_method, payment_method),
    status = case when p_payment_status = 'approved' then 'pago' else status end
  where id = p_order_id;
end;
$$;

grant execute on function public.mark_order_paid(uuid, text, text, text, text) to anon, authenticated;
