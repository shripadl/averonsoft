import type { TemplateConfig } from '../../template-config'

export const legalbcpTemplate025: TemplateConfig = {
  "domain": "legal_bcp",
  "stem": "Legal and continuity study (25/80): which option best reflects third-party processor agreements (introductory) in the context of governance with emphasis on {focus}?",
  "variables": {
    "focus": [
      "monitoring signals",
      "dependency mapping",
      "runbook clarity"
    ]
  },
  "correct": "Programs should tie third-party processor agreements (introductory) to clear governance expectations aligned to organizational risk. (Emphasis: {focus}.)",
  "distractors": [
    "It means RTO and RPO are interchangeable labels.",
    "It eliminates the value of after-action reviews.",
    "It implies BCP and DRP are always identical documents."
  ]
}
