import type { TemplateConfig } from '../../template-config'

export const databasesTemplate015: TemplateConfig = {
  "domain": "databases",
  "stem": "Database concepts (15/80): which answer best reflects backup versus restore testing in relation to consistency with emphasis on {focus}?",
  "variables": {
    "focus": [
      "runbook tests",
      "dependency drills",
      "scope control"
    ]
  },
  "correct": "Practitioners should connect backup versus restore testing to concrete consistency outcomes when designing schemas and operations. (Emphasis: {focus}.)",
  "distractors": [
    "It guarantees partial indexes are always larger than full indexes.",
    "It removes the benefit of read replicas for scaling reads.",
    "It implies transactions cannot span multiple statements."
  ]
}
