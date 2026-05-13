import type { TemplateConfig } from '../../template-config'

export const databasesTemplate040: TemplateConfig = {
  "domain": "databases",
  "stem": "Database concepts (40/80): which answer best reflects query plans and cost-based optimization (introductory) in relation to operational risk with emphasis on {focus}?",
  "variables": {
    "focus": [
      "policy attestation",
      "training records",
      "control testing"
    ]
  },
  "correct": "Practitioners should connect query plans and cost-based optimization (introductory) to concrete operational risk outcomes when designing schemas and operations. (Emphasis: {focus}.)",
  "distractors": [
    "It means every table must have exactly one column.",
    "It removes the need for primary keys in relational models.",
    "It implies indexes always slow down reads."
  ]
}
