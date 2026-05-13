import type { TemplateConfig } from '../../template-config'

export const databasesTemplate010: TemplateConfig = {
  "domain": "databases",
  "stem": "Database concepts (10/80): which answer best reflects replication lag read patterns (introductory) in relation to consistency with emphasis on {focus}?",
  "variables": {
    "focus": [
      "policy attestation",
      "training records",
      "control testing"
    ]
  },
  "correct": "Practitioners should connect replication lag read patterns (introductory) to concrete consistency outcomes when designing schemas and operations. (Emphasis: {focus}.)",
  "distractors": [
    "It means transactions cannot roll back after a client disconnect.",
    "It removes the role of the query planner entirely.",
    "It implies full table scans are always optimal."
  ]
}
