import type { TemplateConfig } from '../../template-config'

export const legalbcpTemplate040: TemplateConfig = {
  "domain": "legal_bcp",
  "stem": "Legal and continuity study (40/80): which option best reflects risk appetite statements in the context of testing cadence with emphasis on {focus}?",
  "variables": {
    "focus": [
      "policy attestation",
      "training records",
      "control testing"
    ]
  },
  "correct": "Programs should tie risk appetite statements to clear testing cadence expectations aligned to organizational risk. (Emphasis: {focus}.)",
  "distractors": [
    "It removes the need for any written procedures.",
    "It guarantees zero regulatory interest in processing.",
    "It implies consent never needs documentation."
  ]
}
