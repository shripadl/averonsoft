import type { TemplateConfig } from '../../template-config'

export const databasesTemplate035: TemplateConfig = {
  "domain": "databases",
  "stem": "Database concepts (35/80): which answer best reflects index selectivity and covering indexes in relation to operational risk with emphasis on {focus}?",
  "variables": {
    "focus": [
      "segmentation design",
      "patch cadence",
      "credential rotation"
    ]
  },
  "correct": "Practitioners should connect index selectivity and covering indexes to concrete operational risk outcomes when designing schemas and operations. (Emphasis: {focus}.)",
  "distractors": [
    "It guarantees denormalization never risks update anomalies.",
    "It eliminates the need for connection pooling.",
    "It implies prepared statements hurt security."
  ]
}
