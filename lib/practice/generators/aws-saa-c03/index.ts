import { stemForTemplateId, STEM_COUNT } from './stems'
import { variationForCombo } from './types'
import type { GeneratedQuestionRow } from './types'

/**
 * These questions are original and unofficial. Not affiliated with AWS, Microsoft, or Google.
 *
 * 1000 unique (template × variation) pairs: 20 templates × 50 combination indices (0–49).
 * globalIndex: 0..999 maps to templateId = index % 20, combo = floor(index / 20).
 */
export const AWS_SAA_C03_EXAM_SLUG = 'aws-saa-c03'
export const AWS_SAA_C03_TARGET_COUNT = 1000
export const AWS_SAA_C03_BATCH_SIZE = 50
export { STEM_COUNT }

export function buildAwsSaaC03Question(globalIndex: number): GeneratedQuestionRow {
  if (globalIndex < 0 || globalIndex > AWS_SAA_C03_TARGET_COUNT - 1) {
    throw new Error(`globalIndex must be 0..${AWS_SAA_C03_TARGET_COUNT - 1}, got ${globalIndex}`)
  }
  const templateId = globalIndex % STEM_COUNT
  const combo = Math.floor(globalIndex / STEM_COUNT)
  const v = variationForCombo(combo)
  const stem = stemForTemplateId(templateId)
  const body = stem(v)
  return {
    globalIndex,
    ...body,
  }
}
