import type { TemplateConfig } from '../../template-config'

export const databasesTemplate003: TemplateConfig = {
  "domain": "databases",
  "stem": "Database concepts (3/80): which answer best reflects index selectivity and covering indexes in relation to consistency?",
  "variables": {},
  "correct": "Practitioners should connect index selectivity and covering indexes to concrete consistency outcomes when designing schemas and operations.",
  "distractors": [
    "It guarantees denormalization never risks update anomalies.",
    "It eliminates the need for connection pooling.",
    "It implies prepared statements hurt security."
  ]
}
