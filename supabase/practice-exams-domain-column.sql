-- Add domain support for domain-weighted practice question generation.
alter table public.exam_questions
  add column if not exists domain text null;

