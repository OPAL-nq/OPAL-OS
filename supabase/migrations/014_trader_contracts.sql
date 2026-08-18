-- Table: trader_contracts
create table public.trader_contracts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  max_daily_loss numeric not null,
  max_trades_per_day integer not null,
  allowed_instruments text[] not null,
  allowed_setups text[] not null,
  trading_hours_start time not null,
  trading_hours_end time not null,
  signature_data_url text not null, -- Base64 SVG/PNG de la signature
  coach_signature_data_url text, -- Base64 SVG/PNG de la signature du coach (Intensive)
  is_active boolean default true,
  signed_at timestamptz default now() not null
);

-- Row Level Security
alter table public.trader_contracts enable row level security;

-- Policies
create policy "Users can view their own contracts"
  on public.trader_contracts for select
  using (auth.uid() = user_id);

create policy "Users can insert their own contracts"
  on public.trader_contracts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own contracts"
  on public.trader_contracts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Optional: Allow admins to view all contracts
create policy "Admins can view all contracts"
  on public.trader_contracts for select
  using (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Optional: Allow admins to update all contracts (for coach signature)
create policy "Admins can update all contracts"
  on public.trader_contracts for update
  using (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );
