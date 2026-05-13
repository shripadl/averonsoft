import type { TemplateConfig } from '../../template-config'

export const databasesTemplate011: TemplateConfig = {
  "domain": "databases",
  "stem": "Database concepts (11/80): which answer best reflects two-phase commit intuition in relation to consistency?",
  "variables": {},
  "correct": "Practitioners should connect two-phase commit intuition to concrete consistency outcomes when designing schemas and operations.",
  "distractors": [
    "It guarantees denormalization never risks update anomalies.",
    "It eliminates the need for connection pooling.",
    "It implies prepared statements hurt security."
  ]
}
