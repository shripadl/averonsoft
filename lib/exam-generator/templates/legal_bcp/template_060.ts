import type { TemplateConfig } from '../../template-config'

export const legalbcpTemplate060: TemplateConfig = {
  "domain": "legal_bcp",
  "stem": "Legal and continuity study (60/80): which option best reflects privacy impact assessments (introductory) in the context of roles and accountability with emphasis on {focus}?",
  "variables": {
    "focus": [
      "design review",
      "tabletop exercise",
      "evidence sampling"
    ]
  },
  "correct": "Programs should tie privacy impact assessments (introductory) to clear roles and accountability expectations aligned to organizational risk. (Emphasis: {focus}.)",
  "distractors": [
    "It guarantees continuity plans never need executive sign-off.",
    "It removes the distinction between incident response and recovery.",
    "It implies third-party processors need no contractual clauses."
  ]
}
