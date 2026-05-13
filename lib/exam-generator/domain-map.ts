/**
 * Strict topic → single template domain. First matching domain in DOMAIN_MATCH_ORDER wins.
 * legal_bcp is checked before cryptography so phrases like "GDPR encryption" map to legal_bcp.
 *
 * Template library covers only: cloud, networking, cryptography, databases, operating_systems, legal_bcp.
 */

export const DOMAIN_MAP: Record<string, readonly string[]> = {
  legal_bcp: [
    'legal',
    'law',
    'bcp',
    'business continuity',
    'drp',
    'disaster recovery',
    'compliance',
    'gdpr',
    'hipaa',
    'iso 27001',
    '27001',
    'business impact',
    'bia',
    'incident response',
    'rto',
    'rpo',
    'regulation',
    'audit',
    'continuity planning',
    'recovery planning',
  ],
  cryptography: ['cipher', 'encryption', 'crypto', 'rsa', 'aes', 'hash', 'hashing', 'sha-', 'hmac', 'bcrypt', 'argon'],
  networking: [
    'osi',
    'tcp',
    'udp',
    'ip',
    'routing',
    'switching',
    'network',
    'router',
    'switch',
    'lan',
    'wan',
    'packet',
    'ethernet',
    'wifi',
    'tls',
    'ssl',
    'http',
    'nat',
    'subnet',
    'gateway',
    'layer 4',
    'layer 3',
    'layer 2',
    'firewall',
    'vlan',
    'arp',
    'mtu',
    'wireless',
  ],
  cloud: [
    'aws',
    'azure',
    'gcp',
    'cloud',
    'kubernetes',
    'container',
    'iaas',
    'paas',
    'saas',
    'serverless',
    'availability zone',
    'region',
    'iam',
    's3',
    'ec2',
    'vpc',
    'multi-tenant',
    'scaling',
    'object storage',
  ],
  databases: ['sql', 'database', 'query', 'transaction', 'index', 'join', 'nosql', 'schema', 'acid', 'normalization'],
  operating_systems: ['linux', 'windows', 'kernel', 'process', 'thread', 'file system', 'memory', 'scheduling', 'shell', 'daemon', 'operating system', 'paging', 'virtual memory'],
}

/** Match order: regulatory before crypto; networking before cloud where both could match. */
export const DOMAIN_MATCH_ORDER = [
  'legal_bcp',
  'cryptography',
  'networking',
  'databases',
  'cloud',
  'operating_systems',
] as const satisfies readonly (keyof typeof DOMAIN_MAP)[]

const HASH_DATA_STRUCTURE_PHRASES = ['hash table', 'hashtable', 'hash map', 'hashmap']

export function mapTopicToDomain(topic: string): string {
  const lower = topic.trim().toLowerCase()
  if (!lower) return 'cloud'

  for (const phrase of HASH_DATA_STRUCTURE_PHRASES) {
    if (lower.includes(phrase)) return 'databases'
  }

  for (const domain of DOMAIN_MATCH_ORDER) {
    const keywords = DOMAIN_MAP[domain]
    if (keywords.some(keyword => lower.includes(keyword))) {
      return domain
    }
  }
  return 'cloud'
}
