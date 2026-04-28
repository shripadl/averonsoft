-- Per-exam paid attempts for practice exams.

create table if not exists public.user_exam_entitlements (
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_slug text not null,
  attempts_remaining int not null default 0,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, exam_slug)
);

create index if not exists user_exam_entitlements_exam_slug_idx on public.user_exam_entitlements (exam_slug);
create index if not exists user_exam_entitlements_expires_at_idx on public.user_exam_entitlements (expires_at);

alter table public.user_exam_entitlements enable row level security;

drop policy if exists "Users can view own exam entitlements" on public.user_exam_entitlements;
create policy "Users can view own exam entitlements"
  on public.user_exam_entitlements
  for select
  using (auth.uid() = user_id);

drop policy if exists "Service role manages exam entitlements" on public.user_exam_entitlements;
create policy "Service role manages exam entitlements"
  on public.user_exam_entitlements
  for all
  using (auth.jwt() ->> 'role' = 'service_role')
  with check (auth.jwt() ->> 'role' = 'service_role');

-- Free attempt state per user and exam.
create table if not exists public.user_exam_access (
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_slug text not null,
  free_attempt_used boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, exam_slug)
);

create index if not exists user_exam_access_exam_slug_idx on public.user_exam_access (exam_slug);

alter table public.user_exam_access enable row level security;

drop policy if exists "Users can view own exam access" on public.user_exam_access;
create policy "Users can view own exam access"
  on public.user_exam_access
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can manage own exam access rows" on public.user_exam_access;
create policy "Users can manage own exam access rows"
  on public.user_exam_access
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
