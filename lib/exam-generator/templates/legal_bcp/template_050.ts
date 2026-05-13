import type { TemplateConfig } from '../../template-config'

export const legalbcpTemplate050: TemplateConfig = {
  "domain": "legal_bcp",
  "stem": "Legal and continuity study (50/80): which option best reflects HIPAA-style administrative safeguards (introductory) in the context of roles and accountability with emphasis on {focus}?",
  "variables": {
    "focus": [
      "access reviews",
      "encryption coverage",
      "logging retention"
    ]
  },
  "correct": "Programs should tie HIPAA-style administrative safeguards (introductory) to clear roles and accountability expectations aligned to organizational risk. (Emphasis: {focus}.)",
  "distractors": [
    "It guarantees insurance replaces all continuity testing.",
    "It removes the role of business impact analysis.",
    "It implies legal holds apply only to paper records."
  ]
}
