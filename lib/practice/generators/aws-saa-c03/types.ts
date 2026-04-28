import type { QuestionDifficulty } from '@/lib/practice/types'
import type { PracticeOption } from '@/lib/practice/types'

/**
 * These questions are original and unofficial. Not affiliated with AWS, Microsoft, or Google.
 */
export interface GeneratedQuestionRow {
  globalIndex: number
  question_text: string
  options: PracticeOption[]
  correct_option_id: 'A' | 'B' | 'C' | 'D'
  explanation: string
  difficulty: QuestionDifficulty
}

export type Variation = {
  org: string
  project: string
  region: string
  sizeLabel: string
  metric: string
  role: string
  combo: number
}

const ORGS = [
  'FinNorth Trading',
  'Apex Retail Group',
  'Cedar Health Co-op',
  'Harbor Media Labs',
  'Summit EdTech',
  'Northwind Logistics',
  'Lumen Analytics',
  'Kite Mobility',
  'Prairie Manufacturing',
  'Ridge Insurance',
] as const

const PROJECTS = [
  'Revenue service',
  'Order pipeline',
  'Member portal',
  'Video ingest',
  'Classroom app',
  'Load planning',
  'Reporting suite',
  'Rider API',
  'MRP dashboard',
  'Claims workflow',
] as const

const REGIONS = [
  'us-east-1',
  'us-west-2',
  'eu-west-1',
  'ap-southeast-1',
  'ca-central-1',
  'sa-east-1',
  'eu-central-1',
  'ap-northeast-1',
] as const

const SIZES = [
  '50 TB',
  '5 TB',
  '500 GB',
  '2 PB',
  '10 TB',
  '200 GB',
  '1 TB',
  '120 TB',
] as const

const METRICS = [
  'latency p95 under 200 ms',
  'monthly spend cap',
  'RPO of 1 hour',
  'burst traffic to 5× baseline',
  '5,000 TPS at peak',
  'audit findings remediation',
] as const

const ROLES = [
  'solutions architect',
  'platform engineer',
  'engineer on call',
  'security lead',
] as const

export function variationForCombo(combo: number): Variation {
  const c = ((combo % 50) + 50) % 50
  return {
    org: ORGS[c % ORGS.length]!,
    project: PROJECTS[Math.floor(c / 3) % PROJECTS.length]!,
    region: REGIONS[Math.floor(c / 2) % REGIONS.length]!,
    sizeLabel: SIZES[Math.floor(c / 4) % SIZES.length]!,
    metric: METRICS[Math.floor(c / 5) % METRICS.length]!,
    role: ROLES[Math.floor(c / 6) % ROLES.length]!,
    combo: c,
  }
}
