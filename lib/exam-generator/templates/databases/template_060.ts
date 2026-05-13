import type { TemplateConfig } from '../../template-config'

export const databasesTemplate060: TemplateConfig = {
  "domain": "databases",
  "stem": "Database concepts (60/80): which answer best reflects vacuum and bloat concepts (generic) in relation to schema evolution with emphasis on {focus}?",
  "variables": {
    "focus": [
      "design review",
      "tabletop exercise",
      "evidence sampling"
    ]
  },
  "correct": "Practitioners should connect vacuum and bloat concepts (generic) to concrete schema evolution outcomes when designing schemas and operations. (Emphasis: {focus}.)",
  "distractors": [
    "It means isolation levels are purely cosmetic settings.",
    "It removes the benefit of covering indexes.",
    "It implies ACID properties apply only to NoSQL stores."
  ]
}
