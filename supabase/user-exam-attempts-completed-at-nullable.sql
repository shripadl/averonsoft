-- In-progress attempts use completed_at = NULL until the user submits.
-- Run in Supabase SQL Editor if your table was created with NOT NULL on completed_at.

alter table public.user_exam_attempts
  alter column completed_at drop not null;

alter table public.user_exam_attempts
  alter column completed_at drop default;
