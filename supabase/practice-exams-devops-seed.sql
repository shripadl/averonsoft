-- These questions are original and unofficial. Not affiliated with CNCF, Red Hat, Docker, or Ansible.
-- Seed only exam metadata (question banks are generated via admin seed pipeline in batches).

insert into public.exams (slug, name, provider, description, total_questions, is_active)
values
  ('kubernetes-cka', 'Kubernetes Certified Administrator (CKA) (practice)', 'Kubernetes', 'Unofficial CKA-style practice exam for learning and preparation.', 0, true),
  ('kubernetes-ckad', 'Kubernetes Certified Application Developer (CKAD) (practice)', 'Kubernetes', 'Unofficial CKAD-style practice exam for learning and preparation.', 0, true),
  ('kubernetes-kcna', 'Kubernetes and Cloud Native Associate (KCNA) (practice)', 'Kubernetes', 'Unofficial KCNA-style practice exam for learning and preparation.', 0, true),
  ('openshift-admin', 'Red Hat OpenShift Administrator (practice)', 'OpenShift', 'Unofficial OpenShift admin-style practice exam for learning and preparation.', 0, true),
  ('openshift-developer', 'Red Hat OpenShift Developer (practice)', 'OpenShift', 'Unofficial OpenShift developer-style practice exam for learning and preparation.', 0, true),
  ('docker-dca', 'Docker Certified Associate (DCA) (practice)', 'Docker', 'Unofficial DCA-style practice exam for learning and preparation.', 0, true),
  ('ansible-basics', 'Ansible Automation Essentials (practice)', 'Ansible', 'Unofficial Ansible basics-style practice exam for learning and preparation.', 0, true),
  ('ansible-advanced', 'Advanced Ansible Automation (practice)', 'Ansible', 'Unofficial advanced Ansible practice exam for learning and preparation.', 0, true)
on conflict (slug) do update set
  name = excluded.name,
  provider = excluded.provider,
  description = excluded.description,
  is_active = true,
  updated_at = now();

