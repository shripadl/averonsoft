-- Practice payments hardening: support exam/provider/global subscription scopes.

alter table public.user_subscriptions
  add column if not exists scope_type text null,
  add column if not exists provider_name text null;

update public.user_subscriptions
set scope_type = case
  when exam_id is null then 'global'
  else 'exam'
end
where scope_type is null;

