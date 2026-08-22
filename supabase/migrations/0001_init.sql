-- Autentica Fashions - initial schema
-- Tables, RLS policies, RPCs and storage bucket for products/auth/admin panel.

create extension if not exists pgcrypto;

-- =========================================================
-- PROFILES (1:1 with auth.users)
-- =========================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null default '',
  phone text not null default '',
  cpf_cnpj text not null default '',
  address jsonb not null default '{}'::jsonb,
  role text not null default 'client' check (role in ('client','admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select role from public.profiles where id = auth.uid()) = 'admin', false);
$$;

create policy profiles_select_own_or_admin on public.profiles
  for select using (auth.uid() = id or public.is_admin());

create policy profiles_update_own_or_admin on public.profiles
  for update using (auth.uid() = id or public.is_admin());

-- keep non-admins from promoting themselves via a plain UPDATE
create or replace function public.profiles_protect_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role <> old.role and not public.is_admin() then
    new.role := old.role;
  end if;
  return new;
end;
$$;

create trigger profiles_protect_role_trg
  before update on public.profiles
  for each row execute function public.profiles_protect_role();

-- auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, phone, cpf_cnpj)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'cpfCnpj', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================
-- CATEGORIES / SUBCATEGORIES
-- =========================================================
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  image text not null default '',
  created_at timestamptz not null default now()
);

create table public.subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  name text not null
);

alter table public.categories enable row level security;
alter table public.subcategories enable row level security;

create policy categories_select_all on public.categories for select using (true);
create policy categories_admin_write on public.categories for insert with check (public.is_admin());
create policy categories_admin_update on public.categories for update using (public.is_admin());
create policy categories_admin_delete on public.categories for delete using (public.is_admin());

create policy subcategories_select_all on public.subcategories for select using (true);
create policy subcategories_admin_write on public.subcategories for insert with check (public.is_admin());
create policy subcategories_admin_update on public.subcategories for update using (public.is_admin());
create policy subcategories_admin_delete on public.subcategories for delete using (public.is_admin());

-- =========================================================
-- PRODUCTS
-- =========================================================
create table public.products (
  id uuid primary key default gen_random_uuid(),
  sku text not null default '',
  name text not null,
  description text not null default '',
  category text not null default '',
  subcategory text not null default '',
  price_normal numeric(10,2) not null default 0,
  price_resale numeric(10,2) not null default 0,
  stock integer not null default 0,
  active boolean not null default true,
  featured boolean not null default false,
  is_new boolean not null default false,
  is_popular boolean not null default false,
  type text not null default 'roupas' check (type in ('roupas','sapatos')),
  sizes text[] not null default '{}',
  colors jsonb not null default '[]'::jsonb,
  images text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy products_select_public on public.products for select using (active = true);
create policy products_select_admin on public.products for select using (public.is_admin());
create policy products_admin_write on public.products for insert with check (public.is_admin());
create policy products_admin_update on public.products for update using (public.is_admin());
create policy products_admin_delete on public.products for delete using (public.is_admin());

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- =========================================================
-- COUPONS
-- =========================================================
create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type text not null check (type in ('percentage','value')),
  discount numeric(10,2) not null default 0,
  valid_until date,
  max_uses integer not null default 0,
  current_uses integer not null default 0,
  uses_per_client integer not null default 1,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.coupons enable row level security;

create policy coupons_admin_select on public.coupons for select using (public.is_admin());
create policy coupons_admin_write on public.coupons for insert with check (public.is_admin());
create policy coupons_admin_update on public.coupons for update using (public.is_admin());
create policy coupons_admin_delete on public.coupons for delete using (public.is_admin());

create table public.coupon_uses (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid,
  created_at timestamptz not null default now()
);

alter table public.coupon_uses enable row level security;
create policy coupon_uses_admin_select on public.coupon_uses for select using (public.is_admin());

-- =========================================================
-- ORDERS
-- =========================================================
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  customer_name text not null default '',
  customer_email text not null default '',
  customer_phone text not null default '',
  address jsonb not null default '{}'::jsonb,
  items jsonb not null default '[]'::jsonb,
  price_type text not null default 'normal' check (price_type in ('normal','resale')),
  subtotal numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  shipping_method text not null default 'padrao',
  shipping_price numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  coupon_code text,
  status text not null default 'em_analise' check (status in ('em_analise','em_preparo','pago','enviado','entregue','cancelado')),
  tracking_code text,
  carrier text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy orders_select_own_or_admin on public.orders
  for select using (auth.uid() = user_id or public.is_admin());

create policy orders_admin_update on public.orders
  for update using (public.is_admin());

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- =========================================================
-- RPC: validate_coupon (read-only check, used at checkout before paying)
-- =========================================================
create or replace function public.validate_coupon(p_code text)
returns table (valid boolean, code text, type text, discount numeric)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coupon public.coupons%rowtype;
  v_client_uses integer;
begin
  if auth.uid() is null then
    return query select false, null::text, null::text, null::numeric;
    return;
  end if;

  select * into v_coupon from public.coupons where coupons.code = upper(p_code) and active = true;

  if not found then
    return query select false, null::text, null::text, null::numeric;
    return;
  end if;

  if v_coupon.valid_until is not null and v_coupon.valid_until < current_date then
    return query select false, null::text, null::text, null::numeric;
    return;
  end if;

  if v_coupon.max_uses > 0 and v_coupon.current_uses >= v_coupon.max_uses then
    return query select false, null::text, null::text, null::numeric;
    return;
  end if;

  select count(*) into v_client_uses from public.coupon_uses
    where coupon_uses.coupon_id = v_coupon.id and coupon_uses.user_id = auth.uid();

  if v_client_uses >= v_coupon.uses_per_client then
    return query select false, null::text, null::text, null::numeric;
    return;
  end if;

  return query select true, v_coupon.code, v_coupon.type, v_coupon.discount;
end;
$$;

grant execute on function public.validate_coupon(text) to authenticated;

-- =========================================================
-- RPC: create_order (atomic: recompute prices, lock+decrement stock, apply coupon)
-- =========================================================
create or replace function public.create_order(
  p_items jsonb,
  p_address jsonb,
  p_coupon_code text,
  p_shipping_method text,
  p_shipping_price numeric,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_item jsonb;
  v_product public.products%rowtype;
  v_product_id uuid;
  v_item_price_type text;
  v_qty integer;
  v_unit_price numeric(10,2);
  v_subtotal numeric(10,2) := 0;
  v_discount numeric(10,2) := 0;
  v_total numeric(10,2) := 0;
  v_price_type text := 'normal';
  v_coupon public.coupons%rowtype;
  v_client_uses integer;
  v_order public.orders%rowtype;
begin
  if v_user_id is null then
    raise exception 'Não autenticado';
  end if;

  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Carrinho vazio';
  end if;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->'product'->>'id')::uuid;
    v_item_price_type := coalesce(v_item->>'priceType', 'normal');

    if v_item_price_type = 'resale' then
      select coalesce(sum(value::int), 0) into v_qty
        from jsonb_each_text(coalesce(v_item->'sizeDistribution', '{}'::jsonb));
      v_price_type := 'resale';
    else
      v_qty := coalesce((v_item->>'quantity')::int, 0);
    end if;

    if v_qty <= 0 then
      raise exception 'Item com quantidade inválida';
    end if;

    select * into v_product from public.products where id = v_product_id and active = true for update;

    if not found then
      raise exception 'Produto não encontrado ou indisponível';
    end if;

    if v_product.stock < v_qty then
      raise exception 'Estoque insuficiente para %', v_product.name;
    end if;

    v_unit_price := case when v_item_price_type = 'resale' then v_product.price_resale else v_product.price_normal end;

    update public.products set stock = stock - v_qty where id = v_product_id;

    v_subtotal := v_subtotal + (v_unit_price * v_qty);
  end loop;

  if p_coupon_code is not null and length(trim(p_coupon_code)) > 0 then
    select * into v_coupon from public.coupons where code = upper(p_coupon_code) and active = true;

    if not found then
      raise exception 'Cupom inválido';
    end if;

    if v_coupon.valid_until is not null and v_coupon.valid_until < current_date then
      raise exception 'Cupom expirado';
    end if;

    if v_coupon.max_uses > 0 and v_coupon.current_uses >= v_coupon.max_uses then
      raise exception 'Cupom esgotado';
    end if;

    select count(*) into v_client_uses from public.coupon_uses
      where coupon_uses.coupon_id = v_coupon.id and coupon_uses.user_id = v_user_id;

    if v_client_uses >= v_coupon.uses_per_client then
      raise exception 'Limite de uso do cupom atingido';
    end if;

    v_discount := case when v_coupon.type = 'percentage'
      then round(v_subtotal * v_coupon.discount / 100, 2)
      else v_coupon.discount
    end;

    if v_discount > v_subtotal then
      v_discount := v_subtotal;
    end if;
  end if;

  v_total := v_subtotal - v_discount + coalesce(p_shipping_price, 0);
  if v_total < 0 then
    v_total := 0;
  end if;

  insert into public.orders (
    user_id, customer_name, customer_email, customer_phone, address, items,
    price_type, subtotal, discount, shipping_method, shipping_price, total, coupon_code
  ) values (
    v_user_id, p_customer_name, p_customer_email, p_customer_phone, coalesce(p_address, '{}'::jsonb), p_items,
    v_price_type, v_subtotal, v_discount, coalesce(p_shipping_method, 'padrao'), coalesce(p_shipping_price, 0), v_total,
    nullif(upper(coalesce(p_coupon_code, '')), '')
  )
  returning * into v_order;

  if v_coupon.id is not null then
    insert into public.coupon_uses (coupon_id, user_id, order_id) values (v_coupon.id, v_user_id, v_order.id);
    update public.coupons set current_uses = current_uses + 1 where id = v_coupon.id;
  end if;

  return v_order;
end;
$$;

grant execute on function public.create_order(jsonb, jsonb, text, text, numeric, text, text, text) to authenticated;

-- =========================================================
-- STORAGE: product images bucket (public read, admin write)
-- =========================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy product_images_public_read on storage.objects
  for select using (bucket_id = 'product-images');

create policy product_images_admin_insert on storage.objects
  for insert with check (bucket_id = 'product-images' and public.is_admin());

create policy product_images_admin_update on storage.objects
  for update using (bucket_id = 'product-images' and public.is_admin());

create policy product_images_admin_delete on storage.objects
  for delete using (bucket_id = 'product-images' and public.is_admin());
