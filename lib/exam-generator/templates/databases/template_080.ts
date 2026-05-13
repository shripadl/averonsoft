import type { TemplateConfig } from '../../template-config'

export const databasesTemplate080: TemplateConfig = {
  "domain": "databases",
  "stem": "Database concepts (80/80): which answer best reflects read replicas and read-your-writes tradeoffs (introductory) in relation to observability of workloads with emphasis on {focus}?",
  "variables": {
    "focus": [
      "access reviews",
      "encryption coverage",
      "logging retention"
    ]
  },
  "correct": "Practitioners should connect read replicas and read-your-writes tradeoffs (introductory) to concrete observability of workloads outcomes when designing schemas and operations. (Emphasis: {focus}.)",
  "distractors": [
    "It means every table must have exactly one column.",
    "It removes the need for primary keys in relational models.",
    "It implies indexes always slow down reads."
  ]
}
