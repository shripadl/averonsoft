export interface QuestionTemplate {
  id: string
  /** Canonical domain key from domain-map (e.g. legal_bcp, networking). */
  domain: string
  stem: string
  variables: Record<string, string[]>
  correctTemplate: string
  distractors: string[]
}

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface McqOption {
  label: string
  text: string
}

export interface GeneratedMcq {
  id: string
  stem: string
  options: McqOption[]
  correctLabel: string
  domain: string
}
