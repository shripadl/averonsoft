-- Stores admin-run validation history for practice question banks.

create table if not exists public.practice_question_validation_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_slug text not null,
  exam_name text not null,
  provider text not null default '',
  use_gemini boolean not null default true,
  status text not null default 'running' check (status in ('running', 'completed', 'failed')),
  progress_percent int not null default 0 check (progress_percent >= 0 and progress_percent <= 100),
  progress_message text null,
  summary jsonb null,
  issues jsonb null,
  error_message text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz null
);

create index if not exists idx_practice_question_validation_runs_exam_slug_created
  on public.practice_question_validation_runs (exam_slug, created_at desc);

create index if not exists idx_practice_question_validation_runs_user_created
  on public.practice_question_validation_runs (user_id, created_at desc);

alter table public.practice_question_validation_runs enable row level security;

drop policy if exists "Practice validation runs admin read" on public.practice_question_validation_runs;
create policy "Practice validation runs admin read"
  on public.practice_question_validation_runs
  for select
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and coalesce((to_jsonb(p)->>'banned')::boolean, false) = false
        and coalesce(to_jsonb(p)->>'role', to_jsonb(p)->>'user_role', 'user') in ('admin', 'super_admin')
    )
  );

drop policy if exists "Practice validation runs admin write" on public.practice_question_validation_runs;
create policy "Practice validation runs admin write"
  on public.practice_question_validation_runs
  for all
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and coalesce((to_jsonb(p)->>'banned')::boolean, false) = false
        and coalesce(to_jsonb(p)->>'role', to_jsonb(p)->>'user_role', 'user') in ('admin', 'super_admin')
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and coalesce((to_jsonb(p)->>'banned')::boolean, false) = false
        and coalesce(to_jsonb(p)->>'role', to_jsonb(p)->>'user_role', 'user') in ('admin', 'super_admin')
    )
  );
