import type { TemplateConfig } from '../../template-config'

export const databasesTemplate009: TemplateConfig = {
  "domain": "databases",
  "stem": "Database concepts (9/80): which answer best reflects materialized views tradeoffs in relation to consistency?",
  "variables": {},
  "correct": "Practitioners should connect materialized views tradeoffs to concrete consistency outcomes when designing schemas and operations.",
  "distractors": [
    "It guarantees serializable isolation without any locking.",
    "It eliminates the value of foreign key constraints.",
    "It implies normalization always increases redundancy."
  ]
}
