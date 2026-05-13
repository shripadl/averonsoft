import type { TemplateConfig } from '../../template-config'

export const databasesTemplate001: TemplateConfig = {
  "domain": "databases",
  "stem": "Database concepts (1/80): which answer best reflects ACID transaction expectations in relation to consistency?",
  "variables": {},
  "correct": "Practitioners should connect ACID transaction expectations to concrete consistency outcomes when designing schemas and operations.",
  "distractors": [
    "It guarantees serializable isolation without any locking.",
    "It eliminates the value of foreign key constraints.",
    "It implies normalization always increases redundancy."
  ]
}
