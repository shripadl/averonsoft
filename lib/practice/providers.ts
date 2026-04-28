export const PRACTICE_PROVIDER_SECTIONS = [
  {
    slug: 'aws',
    provider: 'AWS',
    title: 'AWS',
    description: 'Architecture, reliability, security, and cost-focused cloud practice exams.',
  },
  {
    slug: 'azure',
    provider: 'Azure',
    title: 'Azure',
    description: 'Identity, networking, operations, and developer-focused Microsoft cloud practice exams.',
  },
  {
    slug: 'gcp',
    provider: 'GCP',
    title: 'GCP',
    description: 'Platform, infrastructure, observability, and architecture-focused Google cloud practice exams.',
  },
  {
    slug: 'kubernetes',
    provider: 'Kubernetes',
    title: 'Kubernetes',
    description: 'Cluster administration, app development, and cloud-native fundamentals practice exams.',
  },
  {
    slug: 'openshift',
    provider: 'OpenShift',
    title: 'OpenShift',
    description: 'Platform administration and developer workflow practice exams for OpenShift ecosystems.',
  },
  {
    slug: 'docker',
    provider: 'Docker',
    title: 'Docker',
    description: 'Container runtime, image workflows, networking, and registry practice exams.',
  },
  {
    slug: 'ansible',
    provider: 'Ansible',
    title: 'Ansible',
    description: 'Automation playbooks, roles, inventory, and enterprise orchestration practice exams.',
  },
] as const

export type PracticeProviderSlug = (typeof PRACTICE_PROVIDER_SECTIONS)[number]['slug']

export function getProviderSectionBySlug(slug: string) {
  return PRACTICE_PROVIDER_SECTIONS.find((item) => item.slug === slug) || null
}

