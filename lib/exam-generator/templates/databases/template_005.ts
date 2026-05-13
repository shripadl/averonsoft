import type { TemplateConfig } from '../../template-config'

export const databasesTemplate005: TemplateConfig = {
  "domain": "databases",
  "stem": "Database concepts (5/80): which answer best reflects isolation levels (introductory) in relation to consistency with emphasis on {focus}?",
  "variables": {
    "focus": [
      "segmentation design",
      "patch cadence",
      "credential rotation"
    ]
  },
  "correct": "Practitioners should connect isolation levels (introductory) to concrete consistency outcomes when designing schemas and operations. (Emphasis: {focus}.)",
  "distractors": [
    "It guarantees ORMs always emit optimal SQL.",
    "It removes the value of explain plans for tuning.",
    "It implies foreign keys are only for documentation."
  ]
}
