-- Seed: one demo exam + a few original generic questions (not from any certification exam).
-- Run in Supabase SQL Editor after `practice-exams-schema.sql` (as postgres or a role that can write).

insert into public.exams (slug, name, provider, description, total_questions, is_active)
values (
  'demo-cloud-basics',
  'Demo: Cloud concepts (sample bank)',
  'Demo',
  'Sample content to verify the practice platform. Replace or extend with your own original questions for production.',
  3,
  true
)
on conflict (slug) do update set
  name = excluded.name,
  provider = excluded.provider,
  description = excluded.description,
  total_questions = excluded.total_questions,
  is_active = true,
  updated_at = now();

-- Idempotent: replace demo questions for this exam only
delete from public.exam_questions
where exam_id = (select id from public.exams where slug = 'demo-cloud-basics');

insert into public.exam_questions (
  exam_id,
  question_text,
  options,
  correct_option_id,
  explanation,
  difficulty,
  last_reviewed_at
)
select
  e.id,
  'At a high level, what is a widely recommended way to reduce the risk of accidental changes to live systems?',
  '[
    {"id": "A", "text": "Use separate environments (for example dev/test vs production) with clear access controls"},
    {"id": "B", "text": "Share one administrator password across all systems for convenience"},
    {"id": "C", "text": "Turn off all auditing and logging in production to save cost"},
    {"id": "D", "text": "Store all secrets in public source code repositories"}
  ]'::jsonb,
  'A',
  'Isolating environments and restricting who can change production is a common operational practice described in public cloud documentation and well-architected guidance, in general terms.',
  'easy',
  now()
from public.exams e
where e.slug = 'demo-cloud-basics'
union all
select
  e.id,
  'In typical public cloud documentation, a ''region'' most often refers to which idea?',
  '[
    {"id": "A", "text": "A geographic area where a provider locates data centers and services"},
    {"id": "B", "text": "A single hard drive in one laptop"},
    {"id": "C", "text": "The brand name of an operating system"},
    {"id": "D", "text": "A file format for images only"}
  ]'::jsonb,
  'A',
  'Vendors document regions as broad geographic groupings; wording here is original and for learning only.',
  'easy',
  now()
from public.exams e
where e.slug = 'demo-cloud-basics'
union all
select
  e.id,
  'What does ''encryption in transit'' primarily help protect against?',
  '[
    {"id": "A", "text": "Data being read or altered while it moves over networks"},
    {"id": "B", "text": "Data only when printed on paper"},
    {"id": "C", "text": "Data that is already safely air-gapped with no network connection"},
    {"id": "D", "text": "Physical theft of a monitor"}
  ]'::jsonb,
  'A',
  'Encryption in transit (for example TLS) is a general best practice for network confidentiality and integrity, described in public security documentation in vendor-neutral terms.',
  'medium',
  now()
from public.exams e
where e.slug = 'demo-cloud-basics';

-- Keep catalog count accurate
update public.exams
set
  total_questions = (select count(*)::int from public.exam_questions where exam_id = public.exams.id),
  updated_at = now()
where slug = 'demo-cloud-basics';
