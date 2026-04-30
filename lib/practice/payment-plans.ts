export type ExamPlanType = 'single_exam_pack' | 'three_exam_bundle' | 'five_exam_bundle'

export interface ExamPlanConfig {
  type: ExamPlanType
  name: string
  priceUsd: number
  examCount: number
  attemptsPerExam: number
  validityMonths: number
  paddleProductEnvKey: string
  gumroadProductEnvKey: string
}

export const EXAM_PLANS: Record<ExamPlanType, ExamPlanConfig> = {
  single_exam_pack: {
    type: 'single_exam_pack',
    name: 'Single Exam Pack',
    priceUsd: 9.99,
    examCount: 1,
    attemptsPerExam: 5,
    validityMonths: 12,
    paddleProductEnvKey: 'PADDLE_PRODUCT_SINGLE_EXAM_PACK',
    gumroadProductEnvKey: 'GUMROAD_PRODUCT_SINGLE_EXAM_PACK',
  },
  three_exam_bundle: {
    type: 'three_exam_bundle',
    name: '3-Exam Bundle',
    priceUsd: 19.99,
    examCount: 3,
    attemptsPerExam: 5,
    validityMonths: 12,
    paddleProductEnvKey: 'PADDLE_PRODUCT_THREE_EXAM_BUNDLE',
    gumroadProductEnvKey: 'GUMROAD_PRODUCT_THREE_EXAM_BUNDLE',
  },
  five_exam_bundle: {
    type: 'five_exam_bundle',
    name: '5-Exam Bundle',
    priceUsd: 29.99,
    examCount: 5,
    attemptsPerExam: 5,
    validityMonths: 12,
    paddleProductEnvKey: 'PADDLE_PRODUCT_FIVE_EXAM_BUNDLE',
    gumroadProductEnvKey: 'GUMROAD_PRODUCT_FIVE_EXAM_BUNDLE',
  },
}

export function getExamPlan(type: string | null | undefined): ExamPlanConfig | null {
  if (!type) return null
  if (type === 'single_exam_pack' || type === 'three_exam_bundle' || type === 'five_exam_bundle') {
    return EXAM_PLANS[type]
  }
  return null
}

export function getPaddleProductIdForPlan(plan: ExamPlanConfig): string | null {
  const value = process.env[plan.paddleProductEnvKey]
  return value && value.trim().length > 0 ? value.trim() : null
}

export function getGumroadProductPermalinkForPlan(plan: ExamPlanConfig): string | null {
  const value = process.env[plan.gumroadProductEnvKey]
  return value && value.trim().length > 0 ? value.trim() : null
}

export function getExamPlanByProductRef(provider: 'gumroad' | 'paddle', productRef: string | null | undefined): ExamPlanConfig | null {
  const ref = (productRef || '').trim()
  if (!ref) return null

  for (const plan of Object.values(EXAM_PLANS)) {
    const configured =
      provider === 'gumroad'
        ? process.env[plan.gumroadProductEnvKey]
        : process.env[plan.paddleProductEnvKey]
    if ((configured || '').trim() === ref) {
      return plan
    }
  }
  return null
}
