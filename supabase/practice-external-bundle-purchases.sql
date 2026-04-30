create table if not exists public.practice_external_bundle_purchases (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null unique,
  buyer_email text not null,
  plan_type text not null, -- three_exam_bundle | five_exam_bundle
  attempts_per_exam int not null default 5,
  remaining_exam_slots int not null,
  validity_months int not null default 12,
  expires_at timestamptz not null,
  status text not null default 'active', -- active | exhausted | refunded
  claimed_user_id uuid null references auth.users(id) on delete set null,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists practice_external_bundle_purchases_email_idx
  on public.practice_external_bundle_purchases (buyer_email, status);

create table if not exists public.practice_external_bundle_allocations (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null references public.practice_external_bundle_purchases(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_slug text not null,
  created_at timestamptz not null default now(),
  unique(purchase_id, exam_slug)
);

alter table public.practice_external_bundle_purchases enable row level security;
alter table public.practice_external_bundle_allocations enable row level security;

drop policy if exists "Service role manages external bundle purchases" on public.practice_external_bundle_purchases;
create policy "Service role manages external bundle purchases"
  on public.practice_external_bundle_purchases
  for all
  using (auth.jwt() ->> 'role' = 'service_role')
  with check (auth.jwt() ->> 'role' = 'service_role');

drop policy if exists "Service role manages external bundle allocations" on public.practice_external_bundle_allocations;
create policy "Service role manages external bundle allocations"
  on public.practice_external_bundle_allocations
  for all
  using (auth.jwt() ->> 'role' = 'service_role')
  with check (auth.jwt() ->> 'role' = 'service_role');
