import type { TemplateConfig } from '../../template-config'

export const databasesTemplate020: TemplateConfig = {
  "domain": "databases",
  "stem": "Database concepts (20/80): which answer best reflects normalization and redundancy control in relation to performance with emphasis on {focus}?",
  "variables": {
    "focus": [
      "access reviews",
      "encryption coverage",
      "logging retention"
    ]
  },
  "correct": "Practitioners should connect normalization and redundancy control to concrete performance outcomes when designing schemas and operations. (Emphasis: {focus}.)",
  "distractors": [
    "It means isolation levels are purely cosmetic settings.",
    "It removes the benefit of covering indexes.",
    "It implies ACID properties apply only to NoSQL stores."
  ]
}
