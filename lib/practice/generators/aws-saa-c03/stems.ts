import type { PracticeOption } from '@/lib/practice/types'
import type { GeneratedQuestionRow, Variation } from './types'

/**
 * These questions are original and unofficial. Not affiliated with AWS, Microsoft, or Google.
 * Educational scenarios only — not derived from real certification exam items.
 */

function opts(
  a: string,
  b: string,
  c: string,
  d: string,
  correct: 'A' | 'B' | 'C' | 'D',
  explanation: string,
  difficulty: GeneratedQuestionRow['difficulty'],
  question_text: string,
): Omit<GeneratedQuestionRow, 'globalIndex'> {
  const options: PracticeOption[] = [
    { id: 'A', text: a },
    { id: 'B', text: b },
    { id: 'C', text: c },
    { id: 'D', text: d },
  ]
  return { question_text, options, correct_option_id: correct, explanation, difficulty }
}

type Stem = (v: Variation) => Omit<GeneratedQuestionRow, 'globalIndex'>

const stems: Stem[] = [
  // 0: HA / failure isolation
  (v) =>
    opts(
      'Deploy the workload across two or more independent failure zones in the same Region, with health checks and automatic traffic shift away from impaired capacity.',
      'Run the application on a single host with manual reboot scripts when it fails.',
      'Disable all monitoring to reduce log volume during traffic spikes.',
      'Store the only data copy on one volume with no replication outside that host.',
      'A',
      'Distributing capacity across isolated zones with automated recovery is a long-standing, vendor-documented way to limit blast radius for regional services.',
      'medium',
      `${v.org} is launching the "${v.project}" in ${v.region} and must maintain availability if an entire data-center campus loses power, while meeting ${v.metric}. What should the ${v.role} recommend?`,
    ),

  // 1: Object storage for static + CDN
  (v) =>
    opts(
      'Store static content in a regional object service with public read via a managed edge cache, using HTTPS from viewers.',
      'Serve files directly from application servers in private subnets on each request.',
      'Run a single FTP server in a Virtual Private Network for the entire internet.',
      'Attach block volumes to the internet and enable anonymous SMB.',
      'A',
      'Static assets often scale best when offloaded to object storage with a content delivery path; this pattern is a common public-cloud architecture teaching point.',
      'medium',
      `The "${v.project}" for ${v.org} must deliver ${v.sizeLabel} of images to global users. What is the most fitting design for scalable static delivery?`,

  ),

  // 2: IAM least privilege
  (v) =>
    opts(
      'Create a group or role for the task with only the few actions and resources the automation needs, using condition keys when possible.',
      'Create one shared long-lived key with administrator rights for the whole organization.',
      'Add every Amazon Resource Name in the project to a blanket deny except star.',
      'Store secrets in a public code repository to simplify CI.',
      'A',
      'Least privilege via scoped roles and minimal actions is a baseline security idea repeated across well-architected guidance in the public domain.',
      'easy',
      `${v.org} is automating a deployment pipeline. Which practice best fits least-privilege for the deploy bot?`,

  ),

  // 3: VPC / subnet tiering
  (v) =>
    opts(
      'Place the application and associated load balancer in a private subnet, allowing ingress only from the edge/ingress tier, with outbound to managed dependencies via a controlled path.',
      'Open all ports on all hosts to the public internet to simplify connect-once debugging.',
      'Run databases with public IP and no access controls for faster queries.',
      'Store primary secrets in a shared spreadsheet linked from the public website.',
      'A',
      'A tiered private-by-default design is a common teaching pattern for public-cloud networking, independent of any exam wording.',
      'hard',
      `A ${v.role} at ${v.org} must prevent direct internet access to the "${v.project}" data tier while still serving public traffic. What pattern fits?`,

  ),

  // 4: RDB / Multi-AZ vs replica (conceptual)
  (v) =>
    opts(
      'For synchronous, automatic failover in the same Region, use a managed database option designed for in-Region high availability, then validate backup and test restore windows.',
      'Rely on weekly emailed backups as the only recovery method with no test restores.',
      'Run two copies in different Regions and route half of writes to each for consistency.',
      'Disable automatic backups to save storage and rely on in-memory data.',
      'A',
      'Managed relational services document synchronous failover and automated backups; understanding intent matters more than memorizing product names in this practice set.',
      'hard',
      `${v.org} runs a stateful line-of-business app on a managed SQL engine. They need automatic failover in ${v.region} and verifiable RPO, targeting ${v.metric}. What is the most aligned approach?`,

  ),

  // 5: Read scale / analytics replica (conceptual)
  (v) =>
    opts(
      'Add read-oriented replicas and route reporting queries to them, keeping the primary writer path dedicated to transaction updates.',
      'Add CPU to the app tier until reporting queries and writes share the same table locks with no change.',
      'Point BI tools at production tables with unbounded ad hoc scans all day without limits.',
      'Store reporting data only on developer laptops to avoid cost.',
      'A',
      'Isolating read traffic from a write primary is a standard way to protect OLTP from heavy reads; the concept is from general database and cloud docs.',
      'medium',
      `The "${v.project}" analytics team runs heavy read workloads that conflict with point-of-sale writes. For ${v.org}, what is the first architectural step?`,

  ),

  // 6: Serverless + events
  (v) =>
    opts(
      'Use a function-as-a-service unit to handle each message with automatic scaling, idempotent design, and dead-letter handling for poison messages.',
      'Run a fixed t4-size cluster 24/7 to poll one at a time regardless of load.',
      'Log every event to a single local file and tail it in production for processing.',
      'Block all background jobs during business hours only.',
      'A',
      'Event-driven, auto-scaling compute is a well-known pattern for variable queue depth in public cloud documentation in generic terms.',
      'medium',
      `For ${v.org}, events arrive in an asynchronous stream for "${v.project}". Processing must scale to zero on idle and burst on spikes (${v.metric}). What approach fits?`,

  ),

  // 7: S3 durability vs your backup strategy
  (v) =>
    opts(
      'Treat the object service’s built-in durability as the baseline, then add version protection and a separate test restore schedule for the application’s data loss scenarios.',
      'Delete all versions and rely on local laptop copies as the source of truth.',
      'Rely on RAM-only storage for the authoritative data store.',
      'Disable all encryption “for performance” with no other controls.',
      'A',
      'Durable object storage is not a replacement for an organization’s data governance, versioning, and restore tests—common architecture teaching.',
      'easy',
      `A ${v.role} is reviewing disaster recovery for ${v.org}. Object storage in ${v.region} holds ${v.sizeLabel} for "${v.project}". What is the most responsible design principle?`,

  ),

  // 8: Cost / purchasing strategy (generic)
  (v) =>
    opts(
      'For steady, forecastable long-running resources, use committed purchase options; for spiky, unknown length workloads, use flexible on-demand and tune after measuring.',
      'Over-provision everything at the largest size available year-round to avoid all planning.',
      'Run production without budgets or cost allocation tags because tags can add typing time.',
      'Use only the most expensive storage class for all objects regardless of access pattern.',
      'A',
      'Blending purchase models based on profile is generic FinOps and cloud economics teaching, not vendor test material.',
      'medium',
      `${v.org} is optimizing spend for "${v.project}" with ${v.metric} as a constraint. Which strategy best reflects a balanced approach?`,

  ),

  // 9: API protection / throttling
  (v) =>
    opts(
      'Apply request quotas, throttling, and an authentication model at a managed entry point in front of compute, with WAF if HTTP attacks are a risk.',
      'Let clients open unlimited long-lived database connections to the data tier for convenience.',
      'Return raw stack traces in HTTP responses to help all users self-diagnose issues.',
      'Run public APIs on non-standard database ports and disable TLS.',
      'A',
      'A managed edge entry with limits and WAF in front of APIs is standard secure architecture teaching at a high level.',
      'hard',
      `A public API for ${v.org}'s "${v.project}" faces abuse and must enforce ${v.metric}. What is the first-line defense pattern?`,

  ),

  // 10: Dynamo / partition key design (conceptual)
  (v) =>
    opts(
      'Model access patterns and choose a partition key that spreads write/read distribution for expected traffic, and avoid hot keys through naming or sharding in the data model.',
      'Always use a constant partition key to keep data “together for simplicity”.',
      'Set retention to 1 day for all tables without considering recovery needs.',
      'Disable all metrics so application logs never show hot key symptoms.',
      'A',
      'Data modeling for even distribution is a widely taught concept for wide-column designs in public materials and workshops.',
      'hard',
      `The "${v.project}" team reports uneven traffic on a key-value data store, risking throttling. What is the most relevant guidance for a ${v.role} at ${v.org}?`,

  ),

  // 11: Logging vs audit
  (v) =>
    opts(
      'Use a regional logging pipeline for health and app diagnostics, and a separate immutable activity record for who changed which control-plane settings and when.',
      'Turn off all access logs in production to reduce line noise in dashboards.',
      'Store the only change history in a developer’s email outbox as the system of record.',
      'Rely on verbal confirmation for production changes with no write-down.',
      'A',
      'Separating operability logging from user and API change auditing is a routine compliance teaching point, described generically in cloud docs.',
      'medium',
      `${v.org} must satisfy internal audit for who modified identity and access policies, separate from app logs for "${v.project}". What pattern should the ${v.role} separate?`,

  ),

  // 12: ELB + ASG
  (v) =>
    opts(
      'Put a load balancer in front of an autoscaling group that scales on signals tied to the workload, and register only healthy members.',
      'Add instances manually for each traffic spike and remove them the next day by guess.',
      'Point DNS at random IPs in the subnet and skip health checks.',
      'Set maximum group size to one to guarantee simplicity.',
      'A',
      'Load balancing and auto scaling is classic elastic architecture, taught generally in public cloud overviews.',
      'easy',
      `Traffic for ${v.org}'s "${v.project}" varies widely (${v.metric}). The ${v.role} must serve HTTP behind a single stable endpoint. What is the most appropriate combination?`,

  ),

  // 13: Decouple with queue
  (v) =>
    opts(
      'Place a managed queue between producers and consumers, using visibility timeout and back-pressure so spikes do not topple the service tier.',
      'Use synchronous end-to-end calls from every user click through every system with no buffer.',
      'Add sleep() calls in the web app to “slow down” peaks.',
      'Require users to resubmit the same work until it succeeds, with no idempotency.',
      'A',
      'Queues to absorb bursts and decouple components are a fundamental integration pattern, described in public integration guides in vendor-neutral form.',
      'medium',
      `A seasonal spike in "${v.project}" could exceed downstream capacity at ${v.org}. What is the first integration pattern a ${v.role} should add?`,

  ),

  // 14: Backup / restore test
  (v) =>
    opts(
      'Run periodic restore tests into an isolated path, and record actual recovery time to validate targets instead of only assuming the backup job finished.',
      'Assume a green checkmark in a console is sufficient proof of recoverability for leadership.',
      'Back up to the same account root without access separation from daily admin activity.',
      'Rely on snapshots without understanding application-consistent state needs for databases.',
      'A',
      'Proving recovery with test restores is generic reliability engineering practice, not certification-specific phrasing.',
      'medium',
      `Leadership for ${v.org} asks to prove the "${v.project}" RPO. What is the most credible evidence?`,

  ),

  // 15: Caching
  (v) =>
    opts(
      'Use an in-memory or edge cache for read-heavy reference data, with a defined TTL and invalidation story when the source of truth changes.',
      'Cache for months without a strategy when the underlying data changes every minute.',
      'Point every read at the most authoritative database table with no read scaling strategy.',
      'Cache personally identifiable data indefinitely without a retention plan.',
      'A',
      'Strategic caching to reduce read load and latency is basic performance architecture, taught in generic performance workshops.',
      'easy',
      `A ${v.role} is improving latency for the "${v.project}" product catalog. Which statement reflects sound caching design for ${v.org}?`,

  ),

  // 16: Data encryption at rest (principle)
  (v) =>
    opts(
      'Enable encryption of managed storage at rest with keys managed in a way that supports rotation and access boundaries aligned to the team’s policy.',
      'Store sensitive fields as plain text in a shared object bucket to simplify support.',
      'Distribute a single static encryption password in chat for all environments.',
      'Rely on clients to encrypt, but never verify server storage practices.',
      'A',
      'At-rest encryption with a clear key model is a baseline in public well-architected and security content at a high level.',
      'easy',
      `What general practice should a ${v.role} apply to sensitive data at rest in ${v.region} for ${v.org}'s "${v.project}"?`,

  ),

  // 17: DNS and routing
  (v) =>
    opts(
      'Use a managed DNS with routing features appropriate to the scenario (e.g. weighted or latency-based) and health checks, rather than a single unverified static record.',
      'Set TTL to 0 for every name globally and point multiple continents at one private IP in one Region.',
      'Rely on IP addresses in marketing brochures as the only routing update channel.',
      'Block DNS for internal users to reduce ticket volume.',
      'A',
      'Global routing with health-aware DNS behavior is a standard concept in public networking documentation phrased generically here.',
      'hard',
      `${v.org} runs "${v.project}" in multiple areas and must steer users toward a healthy stack while balancing experiments (${v.metric}). What is the first-line managed approach?`,

  ),

  // 18: Observability: golden signals
  (v) =>
    opts(
      'Instrument latency, traffic, error rate, and saturation on critical paths, with alerts tied to SLOs rather than to raw CPU alone.',
      'Page on single-host CPU 1% for one second as the only alert.',
      'Log everything at the highest detail forever with no cost planning.',
      'Rely on users to call when the site is down as the only signal.',
      'A',
      'SRE-style golden signals and SLOs are a widely available concept from public SRE and observability material in generic form.',
      'medium',
      `A ${v.role} at ${v.org} is defining observability for "${v.project}". What framework best supports meaningful alerts for ${v.metric}?`,

  ),

  // 19: Drift and IaC
  (v) =>
    opts(
      'Describe the desired infrastructure in versioned templates, apply with review pipelines, and detect unapproved manual changes in production accounts.',
      'Rely on clicking in the web console in production and memorizing the order of changes.',
      'Run production and development in the same account to reduce account sprawl with no role separation.',
      'Share root credentials in a private wiki to speed up weekends.',
      'A',
      'IaC with change review and drift control is a generic modern operations practice taught widely outside any exam text.',
      'medium',
      `${v.org} is tired of "snowflake" changes that break the "${v.project}" stack. What operating model should the ${v.role} promote?`,

  ),
]

export function stemForTemplateId(id: number): Stem {
  const safe = ((id % 20) + 20) % 20
  return stems[safe]!
}

export const STEM_COUNT = 20
