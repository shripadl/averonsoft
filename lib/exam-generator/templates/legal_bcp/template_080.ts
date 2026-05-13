import type { TemplateConfig } from '../../template-config'

export const legalbcpTemplate080: TemplateConfig = {
  "domain": "legal_bcp",
  "stem": "Legal and continuity study (80/80): which option best reflects cross-border transfer assessments (introductory) in the context of supplier due diligence with emphasis on {focus}?",
  "variables": {
    "focus": [
      "access reviews",
      "encryption coverage",
      "logging retention"
    ]
  },
  "correct": "Programs should tie cross-border transfer assessments (introductory) to clear supplier due diligence expectations aligned to organizational risk. (Emphasis: {focus}.)",
  "distractors": [
    "It removes the need for any written procedures.",
    "It guarantees zero regulatory interest in processing.",
    "It implies consent never needs documentation."
  ]
}
