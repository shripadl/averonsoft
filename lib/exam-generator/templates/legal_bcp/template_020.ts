import type { TemplateConfig } from '../../template-config'

export const legalbcpTemplate020: TemplateConfig = {
  "domain": "legal_bcp",
  "stem": "Legal and continuity study (20/80): which option best reflects DRP scope for IT restoration in the context of governance with emphasis on {focus}?",
  "variables": {
    "focus": [
      "access reviews",
      "encryption coverage",
      "logging retention"
    ]
  },
  "correct": "Programs should tie DRP scope for IT restoration to clear governance expectations aligned to organizational risk. (Emphasis: {focus}.)",
  "distractors": [
    "It guarantees continuity plans never need executive sign-off.",
    "It removes the distinction between incident response and recovery.",
    "It implies third-party processors need no contractual clauses."
  ]
}
