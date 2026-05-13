import type { TemplateConfig } from '../../template-config'

export const legalbcpTemplate015: TemplateConfig = {
  "domain": "legal_bcp",
  "stem": "Legal and continuity study (15/80): which option best reflects after-action reviews post exercise in the context of documentation with emphasis on {focus}?",
  "variables": {
    "focus": [
      "runbook tests",
      "dependency drills",
      "scope control"
    ]
  },
  "correct": "Programs should tie after-action reviews post exercise to clear documentation expectations aligned to organizational risk. (Emphasis: {focus}.)",
  "distractors": [
    "It means continuity plans should avoid naming accountable owners.",
    "It eliminates the benefit of versioning continuity documents.",
    "It implies BIA findings cannot influence budget decisions."
  ]
}
