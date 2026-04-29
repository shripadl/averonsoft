-- Practice exams schema for averonsoft.com
-- All content stored here must be original and legally safe.

create extension if not exists pgcrypto;

create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  provider text not null,
  description text not null,
  total_questions int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.exam_questions (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams(id) on delete cascade,
  question_text text not null,
  options jsonb not null,
  correct_option_id text not null,
  explanation text not null,
  difficulty text not null default 'medium',
  is_outdated boolean not null default false,
  last_reviewed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_exam_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_id uuid not null references public.exams(id) on delete cascade,
  score int not null,
  total_questions int not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz null,
  attempt_number_for_exam int not null
);

create table if not exists public.user_exam_responses (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.user_exam_attempts(id) on delete cascade,
  question_id uuid not null references public.exam_questions(id) on delete cascade,
  selected_option_id text null,
  is_correct boolean not null default false,
  unique(attempt_id, question_id)
);

create table if not exists public.user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_id uuid null references public.exams(id) on delete cascade,
  provider text not null,
  status text not null,
  started_at timestamptz not null default now(),
  expires_at timestamptz null
);

create table if not exists public.question_feedback (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.exam_questions(id) on delete cascade,
  user_id uuid null references auth.users(id) on delete set null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.exams enable row level security;
alter table public.exam_questions enable row level security;
alter table public.user_exam_attempts enable row level security;
alter table public.user_exam_responses enable row level security;
alter table public.user_subscriptions enable row level security;
alter table public.question_feedback enable row level security;

-- PostgreSQL has no CREATE POLICY IF NOT EXISTS; use drop + create for re-runs.
drop policy if exists "Active exams visible to all" on public.exams;
create policy "Active exams visible to all"
  on public.exams
  for select
  using (is_active = true);

drop policy if exists "Questions visible to authenticated users" on public.exam_questions;
create policy "Questions visible to authenticated users"
  on public.exam_questions
  for select
  using (auth.role() = 'authenticated');

drop policy if exists "Users read own attempts" on public.user_exam_attempts;
create policy "Users read own attempts"
  on public.user_exam_attempts
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users create own attempts" on public.user_exam_attempts;
create policy "Users create own attempts"
  on public.user_exam_attempts
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own attempts" on public.user_exam_attempts;
create policy "Users update own attempts"
  on public.user_exam_attempts
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users read own responses" on public.user_exam_responses;
create policy "Users read own responses"
  on public.user_exam_responses
  for select
  using (
    exists (
      select 1
      from public.user_exam_attempts a
      where a.id = attempt_id and a.user_id = auth.uid()
    )
  );

drop policy if exists "Users create responses for own attempts" on public.user_exam_responses;
create policy "Users create responses for own attempts"
  on public.user_exam_responses
  for insert
  with check (
    exists (
      select 1
      from public.user_exam_attempts a
      where a.id = attempt_id and a.user_id = auth.uid()
    )
  );

drop policy if exists "Users read own subscriptions" on public.user_subscriptions;
create policy "Users read own subscriptions"
  on public.user_subscriptions
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can submit feedback" on public.question_feedback;
create policy "Users can submit feedback"
  on public.question_feedback
  for insert
  with check (auth.uid() = user_id or user_id is null);

drop policy if exists "Admins manage exams" on public.exams;
create policy "Admins manage exams"
  on public.exams
  for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'super_admin'))
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'super_admin'))
  );

drop policy if exists "Admins manage questions" on public.exam_questions;
create policy "Admins manage questions"
  on public.exam_questions
  for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'super_admin'))
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'super_admin'))
  );

drop policy if exists "Admins view feedback" on public.question_feedback;
create policy "Admins view feedback"
  on public.question_feedback
  for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'super_admin'))
  );
