import type { TemplateConfig } from '../../template-config'

export const databasesTemplate055: TemplateConfig = {
  "domain": "databases",
  "stem": "Database concepts (55/80): which answer best reflects SQL injection mitigation with parameterization in relation to schema evolution with emphasis on {focus}?",
  "variables": {
    "focus": [
      "monitoring signals",
      "dependency mapping",
      "runbook clarity"
    ]
  },
  "correct": "Practitioners should connect SQL injection mitigation with parameterization to concrete schema evolution outcomes when designing schemas and operations. (Emphasis: {focus}.)",
  "distractors": [
    "It guarantees partial indexes are always larger than full indexes.",
    "It removes the benefit of read replicas for scaling reads.",
    "It implies transactions cannot span multiple statements."
  ]
}
