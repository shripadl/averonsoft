import type { QuestionDifficulty } from '@/lib/practice/types'

/**
 * These questions are original and unofficial. Not affiliated with CNCF, Red Hat, Docker, or Ansible.
 */

export const DEVOPS_TARGET_COUNT = 500
export const DEVOPS_BATCH_SIZE = 50
const TEMPLATE_COUNT = 10

type Profile = {
  provider: 'Kubernetes' | 'OpenShift' | 'Docker' | 'Ansible'
  name: string
  description: string
  domains: string[]
  product: string
  orchestration: string
  networking: string
  storage: string
  security: string
}

export const DEVOPS_EXAM_PROFILES: Record<string, Profile> = {
  'kubernetes-cka': {
    provider: 'Kubernetes',
    name: 'Kubernetes Certified Administrator (CKA) (practice)',
    description: 'Unofficial CKA-style practice bank for learning. Questions are original and for preparation only.',
    domains: ['Cluster Architecture & Installation', 'Workloads & Scheduling', 'Services & Networking', 'Storage', 'Troubleshooting'],
    product: 'Kubernetes',
    orchestration: 'kube-scheduler',
    networking: 'Services and CNI networking',
    storage: 'PersistentVolume and StorageClass',
    security: 'RBAC and admission controls',
  },
  'kubernetes-ckad': {
    provider: 'Kubernetes',
    name: 'Kubernetes Certified Application Developer (CKAD) (practice)',
    description: 'Unofficial CKAD-style practice bank for learning. Questions are original and for preparation only.',
    domains: ['Application Design & Build', 'Configuration', 'Observability', 'Services & Networking', 'State Persistence', 'Multi-container Patterns'],
    product: 'Kubernetes',
    orchestration: 'deployment and rollout strategy',
    networking: 'Service discovery and ingress',
    storage: 'persistent claims and volume mounts',
    security: 'namespace-scoped policy and service accounts',
  },
  'kubernetes-kcna': {
    provider: 'Kubernetes',
    name: 'Kubernetes and Cloud Native Associate (KCNA) (practice)',
    description: 'Unofficial KCNA-style practice bank for learning. Questions are original and for preparation only.',
    domains: ['Kubernetes Basics', 'Cloud-Native Fundamentals', 'Containers', 'CNCF Ecosystem'],
    product: 'Kubernetes',
    orchestration: 'control plane components',
    networking: 'pod-to-service connectivity',
    storage: 'stateful workload persistence',
    security: 'identity, policy, and least privilege',
  },
  'openshift-admin': {
    provider: 'OpenShift',
    name: 'Red Hat OpenShift Administrator (practice)',
    description: 'Unofficial OpenShift administrator-style practice bank for learning. Questions are original and for preparation only.',
    domains: ['Installation', 'Operators', 'Networking & Routing', 'Storage', 'Security (SCCs, RBAC)', 'Troubleshooting'],
    product: 'OpenShift',
    orchestration: 'cluster operator lifecycle',
    networking: 'Routes and cluster ingress',
    storage: 'dynamic provisioning and classes',
    security: 'SCC and RBAC controls',
  },
  'openshift-developer': {
    provider: 'OpenShift',
    name: 'Red Hat OpenShift Developer (practice)',
    description: 'Unofficial OpenShift developer-style practice bank for learning. Questions are original and for preparation only.',
    domains: ['BuildConfigs & ImageStreams', 'Deployment Workflows', 'Routes & Networking', 'Operators', 'CI/CD', 'Application Debugging'],
    product: 'OpenShift',
    orchestration: 'deployment workflows',
    networking: 'route exposure strategy',
    storage: 'stateful app volume patterns',
    security: 'project-level RBAC',
  },
  'docker-dca': {
    provider: 'Docker',
    name: 'Docker Certified Associate (DCA) (practice)',
    description: 'Unofficial DCA-style practice bank for learning. Questions are original and for preparation only.',
    domains: ['Images & Containers', 'Dockerfiles', 'Networking', 'Volumes', 'Compose', 'Registries'],
    product: 'Docker',
    orchestration: 'container runtime operations',
    networking: 'bridge and overlay networks',
    storage: 'volume and bind-mount patterns',
    security: 'image provenance and runtime controls',
  },
  'ansible-basics': {
    provider: 'Ansible',
    name: 'Ansible Automation Essentials (practice)',
    description: 'Unofficial Ansible basics-style practice bank for learning. Questions are original and for preparation only.',
    domains: ['Playbooks', 'Inventory', 'Modules', 'Roles', 'Idempotency'],
    product: 'Ansible',
    orchestration: 'playbook task sequencing',
    networking: 'network module automation',
    storage: 'file and package state management',
    security: 'credential and privilege handling',
  },
  'ansible-advanced': {
    provider: 'Ansible',
    name: 'Advanced Ansible Automation (practice)',
    description: 'Unofficial advanced Ansible-style practice bank for learning. Questions are original and for preparation only.',
    domains: ['Jinja2', 'Dynamic Inventory', 'Vault', 'Error Handling', 'Orchestration', 'Enterprise Patterns'],
    product: 'Ansible',
    orchestration: 'multi-system orchestration',
    networking: 'dynamic inventory + targeting',
    storage: 'state-driven configuration',
    security: 'vault and secret governance',
  },
}

type Built = {
  question_text: string
  options: Array<{ id: 'A' | 'B' | 'C' | 'D'; text: string }>
  correct_option_id: 'A' | 'B' | 'C' | 'D'
  explanation: string
  difficulty: QuestionDifficulty
  domain: string
}

const TEAMS = ['platform', 'sre', 'release', 'security', 'application', 'operations']
const ENVS = ['dev', 'staging', 'production']

export function buildDevOpsQuestion(examSlug: string, globalIndex: number): Built {
  const profile = DEVOPS_EXAM_PROFILES[examSlug]
  if (!profile) throw new Error(`Unsupported exam slug: ${examSlug}`)
  if (globalIndex < 0 || globalIndex >= DEVOPS_TARGET_COUNT) {
    throw new Error(`globalIndex must be 0..${DEVOPS_TARGET_COUNT - 1}`)
  }

  const templateId = globalIndex % TEMPLATE_COUNT
  const combo = Math.floor(globalIndex / TEMPLATE_COUNT)
  const team = TEAMS[combo % TEAMS.length]!
  const env = ENVS[(combo + templateId) % ENVS.length]!
  const domain = profile.domains[(globalIndex * 7) % profile.domains.length]!

  const stem = buildStem(profile, templateId, team, env, domain)
  return rotate(stem, globalIndex % 4)
}

function buildStem(profile: Profile, id: number, team: string, env: string, domain: string) {
  const wrong = [
    'Use one shared administrator credential for all users and environments to simplify troubleshooting.',
    'Disable observability and policy checks to speed up delivery in all environments.',
    'Expose internal control endpoints publicly by default and add restrictions later if needed.',
  ]

  const templates = [
    [`The ${team} team must improve ${profile.product} reliability in ${env}. Which design choice best aligns with ${domain}?`, `Use documented architecture patterns for ${profile.orchestration}, paired with automated health checks and controlled rollout behavior.`, 'medium'],
    [`A release introduced intermittent failures in ${env}. What is the most practical first step under ${domain}?`, `Collect targeted telemetry and events, then isolate a minimal reproducible path before applying rollback or remediation.`, 'hard'],
    [`The team is defining baseline networking for a new workload. Which approach best fits ${domain}?`, `Apply least-privilege connectivity for ${profile.networking} and validate paths with explicit policy tests.`, 'medium'],
    [`Stateful components are being onboarded. What aligns best with ${domain}?`, `Use ${profile.storage} patterns with backup/restore validation and clear data lifecycle policies.`, 'medium'],
    [`Security asks for stronger controls without blocking developers. What should be prioritized for ${domain}?`, `Implement guardrails through ${profile.security}, with reusable policy templates and environment-scoped access.`, 'hard'],
    [`A new service is being containerized. Which practice best supports ${domain}?`, `Define reproducible build/deploy workflows and verify runtime behavior through deterministic configuration and versioned manifests.`, 'easy'],
    [`The ${team} team needs safer change promotion to ${env}. What should they do first?`, `Use staged rollout with automated checks and rollback criteria tied to service indicators.`, 'easy'],
    [`A platform audit found inconsistent setup across clusters/hosts. What is the right direction for ${domain}?`, `Standardize via declarative configuration and periodic drift detection with documented remediation steps.`, 'medium'],
    [`Application teams report delayed incident response. Which capability most improves outcomes for ${domain}?`, `Define alerting around service-level signals and link runbooks to diagnosis paths for common failure modes.`, 'easy'],
    [`Scaling events create operational risk during peak periods. What design principle best fits ${domain}?`, `Predefine capacity and recovery behavior with validated failover/queue handling under load tests.`, 'hard'],
  ] as const

  const [q, correct, difficulty] = templates[id]!
  return {
    question_text: q,
    correctText: correct,
    wrong,
    explanation: `${domain}: this choice preserves operability and governance while using public best-practice patterns for ${profile.product}.`,
    difficulty: difficulty as QuestionDifficulty,
    domain,
  }
}

function rotate(
  raw: { question_text: string; correctText: string; wrong: string[]; explanation: string; difficulty: QuestionDifficulty; domain: string },
  rotation: number,
): Built {
  const labels: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D']
  const idx = ((rotation % 4) + 4) % 4
  const values = [...raw.wrong]
  values.splice(idx, 0, raw.correctText)
  return {
    question_text: raw.question_text,
    options: labels.map((id, i) => ({ id, text: values[i]! })),
    correct_option_id: labels[idx]!,
    explanation: raw.explanation,
    difficulty: raw.difficulty,
    domain: raw.domain,
  }
}

