import type { TemplateConfig } from '../../template-config'

export const databasesTemplate045: TemplateConfig = {
  "domain": "databases",
  "stem": "Database concepts (45/80): which answer best reflects partitioning for large tables (introductory) in relation to operational risk with emphasis on {focus}?",
  "variables": {
    "focus": [
      "runbook tests",
      "dependency drills",
      "scope control"
    ]
  },
  "correct": "Practitioners should connect partitioning for large tables (introductory) to concrete operational risk outcomes when designing schemas and operations. (Emphasis: {focus}.)",
  "distractors": [
    "It guarantees ORMs always emit optimal SQL.",
    "It removes the value of explain plans for tuning.",
    "It implies foreign keys are only for documentation."
  ]
}
