import type { TemplateConfig } from '../../template-config'

export const databasesTemplate030: TemplateConfig = {
  "domain": "databases",
  "stem": "Database concepts (30/80): which answer best reflects OLTP versus OLAP workloads (introductory) in relation to performance with emphasis on {focus}?",
  "variables": {
    "focus": [
      "design review",
      "tabletop exercise",
      "evidence sampling"
    ]
  },
  "correct": "Practitioners should connect OLTP versus OLAP workloads (introductory) to concrete performance outcomes when designing schemas and operations. (Emphasis: {focus}.)",
  "distractors": [
    "It means backups never need restore drills.",
    "It eliminates the role of connection limits.",
    "It implies vacuum operations never affect latency."
  ]
}
