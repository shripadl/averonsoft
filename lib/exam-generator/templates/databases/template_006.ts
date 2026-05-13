import type { TemplateConfig } from '../../template-config'

export const databasesTemplate006: TemplateConfig = {
  "domain": "databases",
  "stem": "Database concepts (6/80): which answer best reflects pessimistic versus optimistic concurrency in relation to consistency?",
  "variables": {},
  "correct": "Practitioners should connect pessimistic versus optimistic concurrency to concrete consistency outcomes when designing schemas and operations.",
  "distractors": [
    "It means backups never need restore drills.",
    "It eliminates the role of connection limits.",
    "It implies vacuum operations never affect latency."
  ]
}
