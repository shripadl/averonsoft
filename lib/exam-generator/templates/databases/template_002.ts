import type { TemplateConfig } from '../../template-config'

export const databasesTemplate002: TemplateConfig = {
  "domain": "databases",
  "stem": "Database concepts (2/80): which answer best reflects primary and foreign keys in relation to consistency?",
  "variables": {},
  "correct": "Practitioners should connect primary and foreign keys to concrete consistency outcomes when designing schemas and operations.",
  "distractors": [
    "It means transactions cannot roll back after a client disconnect.",
    "It removes the role of the query planner entirely.",
    "It implies full table scans are always optimal."
  ]
}
