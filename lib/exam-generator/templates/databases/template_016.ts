import type { TemplateConfig } from '../../template-config'

export const databasesTemplate016: TemplateConfig = {
  "domain": "databases",
  "stem": "Database concepts (16/80): which answer best reflects read replicas and read-your-writes tradeoffs (introductory) in relation to consistency?",
  "variables": {},
  "correct": "Practitioners should connect read replicas and read-your-writes tradeoffs (introductory) to concrete consistency outcomes when designing schemas and operations.",
  "distractors": [
    "It means every table must have exactly one column.",
    "It removes the need for primary keys in relational models.",
    "It implies indexes always slow down reads."
  ]
}
