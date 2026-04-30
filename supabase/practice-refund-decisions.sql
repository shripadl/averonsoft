create table if not exists public.practice_payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_type text not null,
  exam_slugs jsonb not null,
  attempts_per_exam int not null,
  status text not null default 'paid', -- paid | refunded
  refund_decision text null, -- null | pending | revoked | allowed
  refund_note text null,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists practice_payment_events_user_idx on public.practice_payment_events(user_id);
create index if not exists practice_payment_events_status_idx on public.practice_payment_events(status, refund_decision);

alter table public.practice_payment_events enable row level security;

drop policy if exists "Users can view own practice payment events" on public.practice_payment_events;
create policy "Users can view own practice payment events"
  on public.practice_payment_events
  for select
  using (auth.uid() = user_id);

drop policy if exists "Service role manages practice payment events" on public.practice_payment_events;
create policy "Service role manages practice payment events"
  on public.practice_payment_events
  for all
  using (auth.jwt() ->> 'role' = 'service_role')
  with check (auth.jwt() ->> 'role' = 'service_role');
