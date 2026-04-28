import type { QuestionDifficulty } from '@/lib/practice/types'

/**
 * These questions are original and unofficial. Not affiliated with AWS, Microsoft, or Google.
 */

export const TARGET_COUNT = 1000
export const BATCH_SIZE = 50
const TEMPLATE_COUNT = 20

type Provider = 'AWS' | 'Azure' | 'GCP'

type ExamProfile = {
  provider: Provider
  name: string
  description: string
  identity: string
  network: string
  vm: string
  objectStorage: string
  metrics: string
  audit: string
  serverless: string
  kubernetes: string
  sql: string
  nosql: string
}

export const EXAM_PROFILES: Record<string, ExamProfile> = {
  'azure-az-900': {
    provider: 'Azure',
    name: 'Microsoft Azure Fundamentals (practice)',
    description: 'Unofficial AZ-900 style practice bank for learning. Questions are original and for preparation only.',
    identity: 'Microsoft Entra ID',
    network: 'Azure Virtual Network',
    vm: 'Azure Virtual Machines',
    objectStorage: 'Azure Blob Storage',
    metrics: 'Azure Monitor',
    audit: 'Azure Activity Log',
    serverless: 'Azure Functions',
    kubernetes: 'Azure Kubernetes Service',
    sql: 'Azure SQL Database',
    nosql: 'Azure Cosmos DB',
  },
  'azure-az-104': {
    provider: 'Azure',
    name: 'Microsoft Azure Administrator (practice)',
    description: 'Unofficial AZ-104 style practice bank for learning. Questions are original and for preparation only.',
    identity: 'Microsoft Entra ID',
    network: 'Azure Virtual Network',
    vm: 'Azure Virtual Machines',
    objectStorage: 'Azure Blob Storage',
    metrics: 'Azure Monitor',
    audit: 'Azure Activity Log',
    serverless: 'Azure Functions',
    kubernetes: 'Azure Kubernetes Service',
    sql: 'Azure SQL Database',
    nosql: 'Azure Cosmos DB',
  },
  'azure-az-204': {
    provider: 'Azure',
    name: 'Microsoft Azure Developer (practice)',
    description: 'Unofficial AZ-204 style practice bank for learning. Questions are original and for preparation only.',
    identity: 'Microsoft Entra ID',
    network: 'Azure Virtual Network',
    vm: 'Azure Virtual Machines',
    objectStorage: 'Azure Blob Storage',
    metrics: 'Azure Monitor',
    audit: 'Azure Activity Log',
    serverless: 'Azure Functions',
    kubernetes: 'Azure Kubernetes Service',
    sql: 'Azure SQL Database',
    nosql: 'Azure Cosmos DB',
  },
  'gcp-cdl': {
    provider: 'GCP',
    name: 'Google Cloud Digital Leader (practice)',
    description: 'Unofficial CDL style practice bank for learning. Questions are original and for preparation only.',
    identity: 'Cloud IAM',
    network: 'Virtual Private Cloud (VPC)',
    vm: 'Compute Engine',
    objectStorage: 'Cloud Storage',
    metrics: 'Cloud Monitoring',
    audit: 'Cloud Audit Logs',
    serverless: 'Cloud Run',
    kubernetes: 'Google Kubernetes Engine',
    sql: 'Cloud SQL',
    nosql: 'Firestore',
  },
  'gcp-ace': {
    provider: 'GCP',
    name: 'Google Associate Cloud Engineer (practice)',
    description: 'Unofficial ACE style practice bank for learning. Questions are original and for preparation only.',
    identity: 'Cloud IAM',
    network: 'Virtual Private Cloud (VPC)',
    vm: 'Compute Engine',
    objectStorage: 'Cloud Storage',
    metrics: 'Cloud Monitoring',
    audit: 'Cloud Audit Logs',
    serverless: 'Cloud Run',
    kubernetes: 'Google Kubernetes Engine',
    sql: 'Cloud SQL',
    nosql: 'Firestore',
  },
  'gcp-pca': {
    provider: 'GCP',
    name: 'Google Professional Cloud Architect (practice)',
    description: 'Unofficial PCA style practice bank for learning. Questions are original and for preparation only.',
    identity: 'Cloud IAM',
    network: 'Virtual Private Cloud (VPC)',
    vm: 'Compute Engine',
    objectStorage: 'Cloud Storage',
    metrics: 'Cloud Monitoring',
    audit: 'Cloud Audit Logs',
    serverless: 'Cloud Run',
    kubernetes: 'Google Kubernetes Engine',
    sql: 'Cloud SQL',
    nosql: 'Firestore',
  },
}

const ORGS = ['Northwind Labs', 'Blue River Retail', 'Cedar Health', 'Beacon Learning', 'Ridge Freight', 'Nova Media']
const PROJECTS = ['customer portal', 'order pipeline', 'telemetry service', 'reporting stack', 'mobile backend', 'analytics API']

type BuiltQuestion = {
  question_text: string
  options: Array<{ id: 'A' | 'B' | 'C' | 'D'; text: string }>
  correct_option_id: 'A' | 'B' | 'C' | 'D'
  explanation: string
  difficulty: QuestionDifficulty
}

export function buildCloudQuestion(examSlug: string, globalIndex: number): BuiltQuestion {
  const profile = EXAM_PROFILES[examSlug]
  if (!profile) {
    throw new Error(`Unsupported exam slug: ${examSlug}`)
  }
  if (globalIndex < 0 || globalIndex >= TARGET_COUNT) {
    throw new Error(`globalIndex must be 0..${TARGET_COUNT - 1}`)
  }

  const templateId = globalIndex % TEMPLATE_COUNT
  const combo = Math.floor(globalIndex / TEMPLATE_COUNT)
  const org = ORGS[combo % ORGS.length]!
  const project = PROJECTS[(combo + templateId) % PROJECTS.length]!

  const t = template(profile, templateId, org, project)
  return withRotatedOptions(t, globalIndex % 4)
}

function template(profile: ExamProfile, id: number, org: string, project: string) {
  const p = profile
  const common = {
    b: 'Use one shared owner credential for all teams to reduce setup time.',
    c: 'Disable logs and alerts in production to simplify operations.',
    d: 'Expose internal data systems directly to the public internet by default.',
  }

  const templates = [
    [`${org} needs least-privilege access for the ${project}. Which approach is most appropriate?`, `Create role-based access with scoped permissions using ${p.identity}.`, common.b, common.c, common.d, `Scoped role-based access is a standard least-privilege practice in public cloud architecture guidance.`, 'easy'],
    [`${org} wants to isolate application tiers for ${project}. What network pattern is best?`, `Use segmented subnets and controlled routing within ${p.network}, with private-by-default access.`, common.b, common.c, common.d, `Tiered segmentation and private-by-default networking reduces blast radius and is a common best practice.`, 'medium'],
    [`Traffic for ${project} changes throughout the day. What compute strategy is most efficient?`, `Use autoscaling on ${p.vm} (or equivalent managed compute) based on workload signals.`, common.b, common.c, common.d, `Autoscaling aligns capacity to demand and is foundational for both resilience and cost control.`, 'easy'],
    [`${org} serves static assets globally for ${project}. What storage and delivery approach fits?`, `Store assets in ${p.objectStorage} and deliver through an edge caching/CDN layer.`, common.b, common.c, common.d, `Object storage plus CDN is a common design for scalable static content delivery.`, 'easy'],
    [`A team must detect production issues quickly in ${project}. What should they prioritize?`, `Define actionable dashboards and alerts in ${p.metrics} around latency, errors, and saturation.`, common.b, common.c, common.d, `Observability should focus on service signals tied to user impact, not only infrastructure snapshots.`, 'medium'],
    [`Audit requires traceability for control-plane changes in ${project}. What is required?`, `Retain and review immutable administrative events using ${p.audit}.`, common.b, common.c, common.d, `Administrative audit trails are essential for governance and incident forensics.`, 'medium'],
    [`${org} processes event-driven tasks for ${project}. Which service model best matches bursty demand?`, `Use ${p.serverless} for event-triggered execution with retry and idempotency design.`, common.b, common.c, common.d, `Event-driven serverless processing handles variable throughput without always-on capacity.`, 'medium'],
    [`The platform team wants portable container orchestration for ${project}. Which option is best?`, `Run managed Kubernetes with ${p.kubernetes} and enforce deployment guardrails.`, common.b, common.c, common.d, `Managed Kubernetes offers control with reduced operational overhead for control plane management.`, 'hard'],
    [`${project} needs relational transactions and managed backups. Which data service category fits?`, `Use a managed relational service such as ${p.sql} with tested restore procedures.`, common.b, common.c, common.d, `Managed relational databases are suitable for transactional workloads with backup/restore requirements.`, 'easy'],
    [`${project} stores flexible JSON-like user profiles at scale. Which datastore type is likely appropriate?`, `Use a managed NoSQL option such as ${p.nosql} designed for schema flexibility and throughput scale.`, common.b, common.c, common.d, `NoSQL services are commonly used for flexible schemas and horizontal scale access patterns.`, 'easy'],
    [`${org} must reduce downtime risk for ${project}. What architecture principle should lead?`, `Distribute workloads across isolated failure domains and automate health-based recovery.`, common.b, common.c, common.d, `Failure isolation with automated recovery is central to high-availability design.`, 'hard'],
    [`The team wants safer infrastructure changes in ${project}. What operating model is best?`, `Manage infrastructure as version-controlled code with peer review and automated drift detection.`, common.b, common.c, common.d, `Infrastructure as code improves consistency, auditability, and controlled rollout.`, 'medium'],
    [`${org} needs lower read latency for ${project} without overloading primary data stores. What helps most?`, `Introduce a cache layer with explicit TTL and invalidation strategy for hot read paths.`, common.b, common.c, common.d, `Caching is a core approach to reduce read pressure and improve latency when managed carefully.`, 'medium'],
    [`The security team asks for better data protection at rest in ${project}. Which baseline control should be enabled?`, `Enable encryption at rest with managed key controls and defined key access boundaries.`, common.b, common.c, common.d, `Encryption at rest with proper key governance is a baseline cloud security measure.`, 'easy'],
    [`${org} is introducing public APIs for ${project}. What edge control is most important first?`, `Apply authentication, rate limiting, and request filtering at a managed ingress layer.`, common.b, common.c, common.d, `Ingress protection with identity and throttling reduces abuse and protects backend systems.`, 'hard'],
    [`Cost has increased for ${project}. What should be done first?`, `Measure workload patterns, right-size resources, and align pricing models to usage characteristics.`, common.b, common.c, common.d, `FinOps starts with visibility and optimization based on real usage patterns.`, 'medium'],
    [`${project} handles asynchronous tasks and downstream systems lag during spikes. What design improves resilience?`, `Place a managed queue between producers and consumers with retry and dead-letter handling.`, common.b, common.c, common.d, `Queue-based decoupling absorbs bursts and protects downstream services.`, 'medium'],
    [`${org} must meet recovery objectives for ${project}. What proof should be produced regularly?`, `Run periodic restore tests and record measured recovery times against targets.`, common.b, common.c, common.d, `Recovery readiness requires tested restores, not only backup job success signals.`, 'hard'],
    [`A global user base accesses ${project}. What routing pattern improves user experience and resilience?`, `Use managed DNS with health-aware and policy-based routing across healthy deployments.`, common.b, common.c, common.d, `Health-aware DNS and traffic steering are common patterns for multi-region reliability.`, 'medium'],
    [`Development teams want safe production operations for ${project}. What account/project strategy helps?`, `Separate environments with clear access boundaries and independent release controls.`, common.b, common.c, common.d, `Environment separation reduces accidental impact and supports stronger governance.`, 'easy'],
  ] as const

  const item = templates[id]!
  return {
    question_text: item[0],
    correctText: item[1],
    wrong: [item[2], item[3], item[4]],
    explanation: item[5],
    difficulty: item[6] as QuestionDifficulty,
  }
}

function withRotatedOptions(
  raw: { question_text: string; correctText: string; wrong: string[]; explanation: string; difficulty: QuestionDifficulty },
  rotation: number,
): BuiltQuestion {
  const labels: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D']
  const index = ((rotation % 4) + 4) % 4
  const values = [...raw.wrong]
  values.splice(index, 0, raw.correctText)
  const options = labels.map((id, i) => ({ id, text: values[i]! }))
  return {
    question_text: raw.question_text,
    options,
    correct_option_id: labels[index]!,
    explanation: raw.explanation,
    difficulty: raw.difficulty,
  }
}

