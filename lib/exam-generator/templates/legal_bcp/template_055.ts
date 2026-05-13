import type { TemplateConfig } from '../../template-config'

export const legalbcpTemplate055: TemplateConfig = {
  "domain": "legal_bcp",
  "stem": "Legal and continuity study (55/80): which option best reflects business impact analysis goals in the context of roles and accountability with emphasis on {focus}?",
  "variables": {
    "focus": [
      "monitoring signals",
      "dependency mapping",
      "runbook clarity"
    ]
  },
  "correct": "Programs should tie business impact analysis goals to clear roles and accountability expectations aligned to organizational risk. (Emphasis: {focus}.)",
  "distractors": [
    "It means continuity plans should avoid naming accountable owners.",
    "It eliminates the benefit of versioning continuity documents.",
    "It implies BIA findings cannot influence budget decisions."
  ]
}
