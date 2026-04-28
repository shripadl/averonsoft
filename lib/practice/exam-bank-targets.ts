import { DEVOPS_EXAM_PROFILES, DEVOPS_TARGET_COUNT } from '@/lib/practice/generators/devops-cert'

/** Default full-bank size for most cloud and general practice exams (see seed scripts). */
export const DEFAULT_QUESTION_BANK_TARGET = 1000

/**
 * Expected question count for a "complete" bank for this exam (used in admin coverage UI).
 * DevOps-family banks are generated in smaller batches (see `DEVOPS_TARGET_COUNT`).
 */
export function getQuestionBankTargetForSlug(slug: string): number {
  if (Object.prototype.hasOwnProperty.call(DEVOPS_EXAM_PROFILES, slug)) {
    return DEVOPS_TARGET_COUNT
  }
  return DEFAULT_QUESTION_BANK_TARGET
}

export function isExamBankAtTarget(totalQuestions: number, slug: string): boolean {
  return (totalQuestions || 0) >= getQuestionBankTargetForSlug(slug)
}
