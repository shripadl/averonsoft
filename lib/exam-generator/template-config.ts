import type { QuestionTemplate } from '@/lib/exam-generator/types'

/**
 * Authoring shape for per-file templates. Engine uses {@link templateConfigToQuestionTemplate}.
 */
export interface TemplateConfig {
  domain: string
  stem: string
  variables: Record<string, string[]>
  correct: string
  distractors: [string, string, string]
}

export function templateConfigToQuestionTemplate(
  config: TemplateConfig,
  id: string
): QuestionTemplate {
  return {
    id,
    domain: config.domain,
    stem: config.stem,
    variables: config.variables,
    correctTemplate: config.correct,
    distractors: [...config.distractors],
  }
}
