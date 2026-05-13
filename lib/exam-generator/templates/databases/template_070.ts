import type { TemplateConfig } from '../../template-config'

export const databasesTemplate070: TemplateConfig = {
  "domain": "databases",
  "stem": "Database concepts (70/80): which answer best reflects pessimistic versus optimistic concurrency in relation to observability of workloads with emphasis on {focus}?",
  "variables": {
    "focus": [
      "policy attestation",
      "training records",
      "control testing"
    ]
  },
  "correct": "Practitioners should connect pessimistic versus optimistic concurrency to concrete observability of workloads outcomes when designing schemas and operations. (Emphasis: {focus}.)",
  "distractors": [
    "It means backups never need restore drills.",
    "It eliminates the role of connection limits.",
    "It implies vacuum operations never affect latency."
  ]
}
