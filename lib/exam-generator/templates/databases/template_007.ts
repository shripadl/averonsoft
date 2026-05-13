import type { TemplateConfig } from '../../template-config'

export const databasesTemplate007: TemplateConfig = {
  "domain": "databases",
  "stem": "Database concepts (7/80): which answer best reflects SQL injection mitigation with parameterization in relation to consistency?",
  "variables": {},
  "correct": "Practitioners should connect SQL injection mitigation with parameterization to concrete consistency outcomes when designing schemas and operations.",
  "distractors": [
    "It guarantees partial indexes are always larger than full indexes.",
    "It removes the benefit of read replicas for scaling reads.",
    "It implies transactions cannot span multiple statements."
  ]
}
