import type { TemplateConfig } from '../../template-config'

export const databasesTemplate025: TemplateConfig = {
  "domain": "databases",
  "stem": "Database concepts (25/80): which answer best reflects materialized views tradeoffs in relation to performance with emphasis on {focus}?",
  "variables": {
    "focus": [
      "monitoring signals",
      "dependency mapping",
      "runbook clarity"
    ]
  },
  "correct": "Practitioners should connect materialized views tradeoffs to concrete performance outcomes when designing schemas and operations. (Emphasis: {focus}.)",
  "distractors": [
    "It guarantees serializable isolation without any locking.",
    "It eliminates the value of foreign key constraints.",
    "It implies normalization always increases redundancy."
  ]
}
