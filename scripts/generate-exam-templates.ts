/**
 * Generates deterministic per-file TemplateConfig modules under lib/exam-generator/templates/<domain>/
 * Run: npx tsx scripts/generate-exam-templates.ts
 */
import * as fs from 'node:fs'
import * as path from 'node:path'
import type { TemplateConfig } from '../lib/exam-generator/template-config'

const ROOT = path.join(__dirname, '..')
const TEMPLATES = path.join(ROOT, 'lib', 'exam-generator', 'templates')

function pad3(n: number): string {
  return String(n).padStart(3, '0')
}

function escExportName(domain: string, n: number): string {
  const d = domain.replace(/_/g, '')
  return `${d}Template${pad3(n)}`
}

function writeTemplateFile(
  domain: string,
  n: number,
  config: TemplateConfig,
  exportName: string
): void {
  const dir = path.join(TEMPLATES, domain)
  fs.mkdirSync(dir, { recursive: true })
  const filePath = path.join(dir, `template_${pad3(n)}.ts`)
  const body = JSON.stringify(config, null, 2)
  const src = `import type { TemplateConfig } from '../../template-config'

export const ${exportName}: TemplateConfig = ${body}
`
  fs.writeFileSync(filePath, src, 'utf8')
}

function writeDomainIndex(domain: string, count: number): void {
  const dir = path.join(TEMPLATES, domain)
  const imports: string[] = []
  const names: string[] = []
  for (let i = 1; i <= count; i++) {
    const ex = escExportName(domain, i)
    imports.push(`import { ${ex} } from './template_${pad3(i)}'`)
    names.push(ex)
  }
  const src = `${imports.join('\n')}

import type { TemplateConfig } from '../../template-config'

export const ${domain.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_TEMPLATES: TemplateConfig[] = [
${names.map(n => `  ${n},`).join('\n')}
]
`
  fs.writeFileSync(path.join(dir, 'index.ts'), src, 'utf8')
}

/** Deterministic wrong-answer pool slices (no overlap with correct string). */
function wrongPool(domain: string, seed: number): [string, string, string] {
  const pools: Record<string, string[][]> = {
    cloud: [
      ['It removes the need for any authentication boundary.', 'It guarantees identical latency on every continent.', 'It implies unlimited free egress by default.'],
      ['It replaces the need for backup copies entirely.', 'It mandates identical hardware in every rack.', 'It eliminates monitoring because the provider observes everything.'],
      ['It means tenants never share physical hosts.', 'It removes encryption requirements for data at rest.', 'It forbids using multiple regions together.'],
      ['It implies a single global administrator account for all customers.', 'It removes the value of least-privilege policies.', 'It guarantees zero configuration for networking.'],
      ['It means object storage cannot version objects.', 'It implies compute instances never need patching.', 'It removes the concept of availability zones.'],
      ['It implies compliance is automatic once a bill is paid.', 'It removes the value of least-privilege for service accounts.', 'It guarantees identical throughput for every workload shape.'],
      ['It means private subnets cannot route through NAT.', 'It implies edge caches always hold authoritative writes.', 'It removes the need for change windows entirely.'],
      ['It guarantees multi-region writes are always strongly consistent.', 'It means IAM policies replace network segmentation entirely.', 'It implies object storage cannot enforce per-object access rules.'],
    ],
    networking: [
      ['It guarantees infinite bandwidth without congestion.', 'It removes the need for any link-layer addressing.', 'It implies DNS always encrypts application payloads.'],
      ['It means routers learn hostnames instead of prefixes.', 'It eliminates the need for MTU discovery.', 'It requires identical MAC addresses on all hosts.'],
      ['It implies TCP and UDP are interchangeable for every workload.', 'It removes the role of ARP on Ethernet segments.', 'It forbids using VLAN tags on trunks.'],
      ['It guarantees wireless links never experience interference.', 'It means NAT preserves end-to-end transport semantics always.', 'It removes the value of path MTU discovery.'],
      ['It implies firewalls only operate at the physical layer.', 'It means subnet masks are optional on IPv4 links.', 'It removes the need for default gateways.'],
      ['It guarantees jitter is irrelevant for VoIP quality.', 'It means ICMP always carries application payloads.', 'It implies trunks cannot carry more than one VLAN.'],
      ['It removes the value of ECMP for resilience.', 'It guarantees Wi-Fi channels never overlap.', 'It implies ARP resolves hostnames directly.'],
      ['It means routing tables ignore longest-prefix matching.', 'It eliminates the benefit of keep-alive for long-lived TCP.', 'It implies proxies cannot terminate TLS sessions.'],
    ],
    cryptography: [
      ['It guarantees ciphertext is always shorter than plaintext.', 'It removes the need for any key material.', 'It implies identical keys for every user globally.'],
      ['It means MACs provide confidentiality without encryption.', 'It eliminates nonce requirements for all modes.', 'It implies RSA keys never need rotation.'],
      ['It guarantees perfect secrecy without any secrets.', 'It removes the distinction between hashing and encryption.', 'It implies digital signatures hide message content.'],
      ['It means KDF output length is irrelevant to security.', 'It eliminates the value of authenticated encryption.', 'It implies randomness quality never matters for IVs.'],
      ['It guarantees asymmetric encryption is always faster than symmetric.', 'It removes the need to verify certificate chains.', 'It implies HMAC can replace encryption for secrecy.'],
      ['It means IV reuse is safe if throughput is high.', 'It eliminates the need for secure random nonces.', 'It implies signing keys can be shared across tenants.'],
      ['It guarantees ciphertext length reveals no information.', 'It removes the distinction between encryption and encoding.', 'It implies MAC tags should be truncated to one byte always.'],
      ['It means post-quantum readiness is only a marketing label.', 'It eliminates the value of hybrid TLS handshakes.', 'It implies KDFs can replace access control policies.'],
    ],
    databases: [
      ['It means every table must have exactly one column.', 'It removes the need for primary keys in relational models.', 'It implies indexes always slow down reads.'],
      ['It guarantees serializable isolation without any locking.', 'It eliminates the value of foreign key constraints.', 'It implies normalization always increases redundancy.'],
      ['It means transactions cannot roll back after a client disconnect.', 'It removes the role of the query planner entirely.', 'It implies full table scans are always optimal.'],
      ['It guarantees denormalization never risks update anomalies.', 'It eliminates the need for connection pooling.', 'It implies prepared statements hurt security.'],
      ['It means isolation levels are purely cosmetic settings.', 'It removes the benefit of covering indexes.', 'It implies ACID properties apply only to NoSQL stores.'],
      ['It guarantees ORMs always emit optimal SQL.', 'It removes the value of explain plans for tuning.', 'It implies foreign keys are only for documentation.'],
      ['It means backups never need restore drills.', 'It eliminates the role of connection limits.', 'It implies vacuum operations never affect latency.'],
      ['It guarantees partial indexes are always larger than full indexes.', 'It removes the benefit of read replicas for scaling reads.', 'It implies transactions cannot span multiple statements.'],
    ],
    operating_systems: [
      ['It means threads never share an address space.', 'It removes the distinction between kernel and user mode.', 'It implies virtual memory cannot overcommit physical RAM.'],
      ['It guarantees scheduling fairness without any priorities.', 'It eliminates the need for file permissions.', 'It implies paging never causes page faults.'],
      ['It means deadlocks cannot occur with a single mutex.', 'It removes the benefit of copy-on-write after fork.', 'It implies the kernel never mediates hardware access.'],
      ['It guarantees every process has identical virtual mappings.', 'It eliminates the role of inode metadata.', 'It implies swap space is unrelated to performance.'],
      ['It means real-time tasks never need priority inversion handling.', 'It removes the value of journaling file systems.', 'It implies threads and processes are identical terms.'],
      ['It guarantees swap eliminates the need for RAM sizing.', 'It removes the benefit of cgroup limits for fairness.', 'It implies page faults are always errors to ignore.'],
      ['It means user-mode drivers are always preferred for disks.', 'It eliminates the role of TLB shootdowns in performance.', 'It implies scheduling is unrelated to cache locality.'],
      ['It guarantees every syscall is O(1) regardless of work done.', 'It removes the value of file locking for coordination.', 'It implies copy-on-write never saves memory.'],
    ],
    legal_bcp: [
      ['It removes the need for any written procedures.', 'It guarantees zero regulatory interest in processing.', 'It implies consent never needs documentation.'],
      ['It means RTO and RPO are interchangeable labels.', 'It eliminates the value of after-action reviews.', 'It implies BCP and DRP are always identical documents.'],
      ['It guarantees insurance replaces all continuity testing.', 'It removes the role of business impact analysis.', 'It implies legal holds apply only to paper records.'],
      ['It means HIPAA applies only to hardware vendors.', 'It eliminates GDPR relevance for non-EU customers entirely in every case.', 'It implies audits should avoid sampling evidence.'],
      ['It guarantees continuity plans never need executive sign-off.', 'It removes the distinction between incident response and recovery.', 'It implies third-party processors need no contractual clauses.'],
      ['It means DPIAs are optional for all high-risk processing.', 'It eliminates the value of tabletop exercises for DRP.', 'It implies RPO can be set without referencing data loss tolerance.'],
      ['It guarantees cyber insurance replaces internal security controls.', 'It removes the need to document processor subprocessors.', 'It implies legal holds apply only after a final court judgment.'],
      ['It means continuity plans should avoid naming accountable owners.', 'It eliminates the benefit of versioning continuity documents.', 'It implies BIA findings cannot influence budget decisions.'],
    ],
  }
  const p = pools[domain]!
  const row = p[seed % p.length]!
  return [row[0]!, row[1]!, row[2]!]
}

// --- Cloud: 80 unique (theme × angle) ---
const CLOUD_THEMES = [
  'IAM-style identity policies',
  'S3-style object storage buckets',
  'EC2-style virtual machine instances',
  'VPC-style isolated virtual networks',
  'shared responsibility between provider and tenant',
  'horizontal autoscaling groups',
  'multi-tenant resource isolation',
  'regional pairs and failover concepts',
  'object lifecycle and storage classes',
  'edge caching and content delivery',
  'cloud IAM federation patterns',
  'bucket policies versus identity policies',
  'instance profiles and temporary credentials',
  'private subnets and route tables',
  'provider-managed encryption of data at rest',
  'well-architected reliability pillars (generic)',
] as const

const CLOUD_ANGLES = [
  'security ownership boundaries',
  'cost drivers for egress and requests',
  'availability and fault-isolation assumptions',
  'operational monitoring expectations',
  'data durability versus availability tradeoffs',
  'baseline hardening defaults',
  'change management across environments',
  'capacity planning signals',
] as const

function cloudTemplate(i: number): TemplateConfig {
  const theme = CLOUD_THEMES[(i - 1) % CLOUD_THEMES.length]!
  const angle = CLOUD_ANGLES[Math.floor((i - 1) / CLOUD_THEMES.length)]!
  const stem = `For generic public-cloud study (${i}/80): which statement aligns best with “${theme}” when discussing ${angle}?`
  const correct = `Policies, monitoring, and architecture choices around ${theme} should explicitly address ${angle} under a shared-responsibility model.`
  const w = wrongPool('cloud', i)
  return {
    domain: 'cloud',
    stem,
    variables: {},
    correct,
    distractors: w,
  }
}

// --- Networking: 80 ---
const NET_THEMES = [
  'OSI layering vocabulary',
  'TCP versus UDP semantics',
  'IPv4 subnetting and CIDR',
  'default gateways and default routes',
  'DNS resolution roles',
  'VLAN segmentation and trunks',
  'NAT and port translation',
  'stateful versus stateless firewalls',
  'ARP on Ethernet segments',
  'path MTU and fragmentation',
  'wireless association and encryption modes (generic)',
  'BGP at a high level between autonomous systems',
  'OSPF area concepts (introductory)',
  'link aggregation for bandwidth/redundancy',
  'reverse proxies and TLS termination',
  'SYN flood handling concepts',
] as const

const NET_ANGLES = [
  'failure domains',
  'header fields versus payload',
  'latency versus reliability tradeoffs',
  'broadcast versus collision domains',
  'security policy insertion points',
] as const

function networkingTemplate(i: number): TemplateConfig {
  const theme = NET_THEMES[(i - 1) % NET_THEMES.length]!
  const angle = NET_ANGLES[Math.floor((i - 1) / NET_THEMES.length)]!
  const stem = `Networking study item (${i}/80): which option best fits “${theme}” in the context of ${angle}?`
  const correct = `Understanding ${theme} helps place controls and performance decisions correctly when analyzing ${angle}.`
  return { domain: 'networking', stem, variables: {}, correct, distractors: wrongPool('networking', i) }
}

// --- Cryptography: 80 (16 themes × 5 angles) ---
const CRYPTO_THEMES = [
  'cryptographic hash properties',
  'symmetric encryption roles',
  'asymmetric encryption and key pairs',
  'RSA-style public-key ideas (introductory)',
  'AES block cipher usage (introductory)',
  'key derivation functions (KDFs)',
  'CSPRNG requirements',
  'nonce and IV uniqueness rules',
  'MAC versus encryption',
  'digital signatures and integrity',
  'AEAD constructions at a high level',
  'downgrade resistance concepts',
  'certificate chain validation goals',
  'side-channel awareness (introductory)',
  'hybrid encryption rationale',
  'post-quantum migration planning (introductory)',
] as const

const CRYPTO_ANGLES = [
  'confidentiality goals',
  'integrity and authenticity goals',
  'key lifecycle hygiene',
  'protocol negotiation hazards',
  'deployment and configuration hazards',
] as const

function cryptographyTemplate(i: number): TemplateConfig {
  const theme = CRYPTO_THEMES[(i - 1) % CRYPTO_THEMES.length]!
  const angle = CRYPTO_ANGLES[Math.floor((i - 1) / CRYPTO_THEMES.length)]!
  const stem = `Cryptography study (${i}/80): which statement is most accurate about ${theme} regarding ${angle}?`
  const correct = `Well-scoped designs use ${theme} deliberately to meet ${angle} without confusing hashing with encryption.`
  return { domain: 'cryptography', stem, variables: {}, correct, distractors: wrongPool('cryptography', i) }
}

// --- Databases: 80 (16 themes × 5 angles) ---
const DB_THEMES = [
  'ACID transaction expectations',
  'primary and foreign keys',
  'index selectivity and covering indexes',
  'normalization and redundancy control',
  'isolation levels (introductory)',
  'pessimistic versus optimistic concurrency',
  'SQL injection mitigation with parameterization',
  'query plans and cost-based optimization (introductory)',
  'materialized views tradeoffs',
  'replication lag read patterns (introductory)',
  'two-phase commit intuition',
  'vacuum and bloat concepts (generic)',
  'partitioning for large tables (introductory)',
  'OLTP versus OLAP workloads (introductory)',
  'backup versus restore testing',
  'read replicas and read-your-writes tradeoffs (introductory)',
] as const

const DB_ANGLES = ['consistency', 'performance', 'operational risk', 'schema evolution', 'observability of workloads'] as const

function databasesTemplate(i: number): TemplateConfig {
  const theme = DB_THEMES[(i - 1) % DB_THEMES.length]!
  const angle = DB_ANGLES[Math.floor((i - 1) / DB_THEMES.length)]!
  const stem = `Database concepts (${i}/80): which answer best reflects ${theme} in relation to ${angle}?`
  const correct = `Practitioners should connect ${theme} to concrete ${angle} outcomes when designing schemas and operations.`
  return { domain: 'databases', stem, variables: {}, correct, distractors: wrongPool('databases', i) }
}

// --- Operating systems: 80 (16 themes × 5 angles) ---
const OS_THEMES = [
  'process versus thread models',
  'virtual memory and paging',
  'CPU scheduling goals',
  'kernel versus user mode',
  'system calls as controlled gates',
  'file descriptors and inode metadata (introductory)',
  'deadlock prerequisites',
  'copy-on-write after fork',
  'page cache and read performance',
  'thrashing and memory pressure',
  'real-time priority inversion (introductory)',
  'namespaces and isolation (generic)',
  'signal delivery (introductory)',
  'I/O scheduling queues (introductory)',
  'memory-mapped files (introductory)',
  'hardware abstraction and drivers (introductory)',
] as const

const OS_ANGLES = ['security', 'performance', 'reliability', 'debuggability', 'capacity planning signals'] as const

function operatingSystemsTemplate(i: number): TemplateConfig {
  const theme = OS_THEMES[(i - 1) % OS_THEMES.length]!
  const angle = OS_ANGLES[Math.floor((i - 1) / OS_THEMES.length)]!
  const stem = `Operating systems (${i}/80): which statement best matches ${theme} when prioritizing ${angle}?`
  const correct = `Kernel design ties ${theme} to measurable ${angle} characteristics for workloads and policies.`
  return { domain: 'operating_systems', stem, variables: {}, correct, distractors: wrongPool('operating_systems', i) }
}

// --- Legal / BCP: 80 (16 themes × 5 angles) ---
const LEGAL_THEMES = [
  'GDPR-style data minimization ideas',
  'HIPAA-style administrative safeguards (introductory)',
  'BCP versus daily IT operations',
  'DRP scope for IT restoration',
  'RTO definitions',
  'RPO definitions',
  'business impact analysis goals',
  'risk appetite statements',
  'third-party processor agreements (introductory)',
  'incident response versus continuity activation',
  'legal hold preservation duties (introductory)',
  'privacy impact assessments (introductory)',
  'cyber insurance questionnaires (introductory)',
  'ISO 27001 ISMS framing (introductory)',
  'after-action reviews post exercise',
  'cross-border transfer assessments (introductory)',
] as const

const LEGAL_ANGLES = [
  'documentation',
  'governance',
  'testing cadence',
  'roles and accountability',
  'supplier due diligence',
] as const

function legalBcpTemplate(i: number): TemplateConfig {
  const theme = LEGAL_THEMES[(i - 1) % LEGAL_THEMES.length]!
  const angle = LEGAL_ANGLES[Math.floor((i - 1) / LEGAL_THEMES.length)]!
  const stem = `Legal and continuity study (${i}/80): which option best reflects ${theme} in the context of ${angle}?`
  const correct = `Programs should tie ${theme} to clear ${angle} expectations aligned to organizational risk.`
  return { domain: 'legal_bcp', stem, variables: {}, correct, distractors: wrongPool('legal_bcp', i) }
}

// --- Optional variables on subset: rotate every 5th template ---
function withVariables(domain: string, base: TemplateConfig, i: number): TemplateConfig {
  if (i % 5 !== 0) return base
  const vname = 'focus'
  const opts = [
    ['design review', 'tabletop exercise', 'evidence sampling'],
    ['monitoring signals', 'dependency mapping', 'runbook clarity'],
    ['access reviews', 'encryption coverage', 'logging retention'],
    ['runbook tests', 'dependency drills', 'scope control'],
    ['policy attestation', 'training records', 'control testing'],
    ['segmentation design', 'patch cadence', 'credential rotation'],
  ][i % 6]! as [string, string, string]
  return {
    ...base,
    stem: base.stem.replace(/\?$/, ` with emphasis on {${vname}}?`),
    variables: { [vname]: [...opts] },
    correct: `${base.correct} (Emphasis: {${vname}}.)`,
  }
}

function build(domain: string, i: number): TemplateConfig {
  let t: TemplateConfig
  switch (domain) {
    case 'cloud':
      t = cloudTemplate(i)
      break
    case 'networking':
      t = networkingTemplate(i)
      break
    case 'cryptography':
      t = cryptographyTemplate(i)
      break
    case 'databases':
      t = databasesTemplate(i)
      break
    case 'operating_systems':
      t = operatingSystemsTemplate(i)
      break
    case 'legal_bcp':
      t = legalBcpTemplate(i)
      break
    default:
      throw new Error(domain)
  }
  return withVariables(domain, t, i)
}

function validateUniqueStems(): void {
  const stems = new Set<string>()
  const domains: { d: string; c: number }[] = [
    { d: 'cloud', c: 80 },
    { d: 'networking', c: 80 },
    { d: 'cryptography', c: 60 },
    { d: 'databases', c: 60 },
    { d: 'operating_systems', c: 60 },
    { d: 'legal_bcp', c: 60 },
  ]
  for (const { d, c } of domains) {
    for (let i = 1; i <= c; i++) {
      const s = build(d, i).stem
      if (stems.has(s)) throw new Error(`Duplicate stem: ${d} ${i}`)
      stems.add(s)
    }
  }
}

function main(): void {
  validateUniqueStems()

  const plan: { domain: string; count: number }[] = [
    { domain: 'cloud', count: 80 },
    { domain: 'networking', count: 80 },
    { domain: 'cryptography', count: 80 },
    { domain: 'databases', count: 80 },
    { domain: 'operating_systems', count: 80 },
    { domain: 'legal_bcp', count: 80 },
  ]

  for (const { domain, count } of plan) {
    const dir = path.join(TEMPLATES, domain)
    if (fs.existsSync(dir)) {
      for (const f of fs.readdirSync(dir)) {
        fs.unlinkSync(path.join(dir, f))
      }
    }
    for (let i = 1; i <= count; i++) {
      const cfg = build(domain, i)
      writeTemplateFile(domain, i, cfg, escExportName(domain, i))
    }
    writeDomainIndex(domain, count)
  }

  // Root aggregator
  const agg = `import {
  templateConfigToQuestionTemplate,
  type TemplateConfig,
} from '../template-config'
import { CLOUD_TEMPLATES } from './cloud'
import { CRYPTOGRAPHY_TEMPLATES } from './cryptography'
import { DATABASES_TEMPLATES } from './databases'
import { LEGAL_BCP_TEMPLATES } from './legal_bcp'
import { NETWORKING_TEMPLATES } from './networking'
import { OPERATING_SYSTEMS_TEMPLATES } from './operating_systems'
import type { QuestionTemplate } from '../types'

function asQuestions(configs: TemplateConfig[], domainPrefix: string): QuestionTemplate[] {
  return configs.map((c, idx) =>
    templateConfigToQuestionTemplate(c, \`\${domainPrefix}-\${String(idx + 1).padStart(3, '0')}\`)
  )
}

export const ALL_TEMPLATES: QuestionTemplate[] = [
  ...asQuestions(CLOUD_TEMPLATES, 'cloud'),
  ...asQuestions(NETWORKING_TEMPLATES, 'networking'),
  ...asQuestions(CRYPTOGRAPHY_TEMPLATES, 'cryptography'),
  ...asQuestions(DATABASES_TEMPLATES, 'databases'),
  ...asQuestions(OPERATING_SYSTEMS_TEMPLATES, 'operating_systems'),
  ...asQuestions(LEGAL_BCP_TEMPLATES, 'legal_bcp'),
]

export const TEMPLATE_COUNT = ALL_TEMPLATES.length
`
  fs.writeFileSync(path.join(TEMPLATES, 'index.ts'), agg, 'utf8')

  console.log('Generated templates. TEMPLATE_COUNT will be', 80 * 6)
}

main()
