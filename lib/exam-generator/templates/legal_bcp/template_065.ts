import type { TemplateConfig } from '../../template-config'

export const legalbcpTemplate065: TemplateConfig = {
  "domain": "legal_bcp",
  "stem": "Legal and continuity study (65/80): which option best reflects GDPR-style data minimization ideas in the context of supplier due diligence with emphasis on {focus}?",
  "variables": {
    "focus": [
      "segmentation design",
      "patch cadence",
      "credential rotation"
    ]
  },
  "correct": "Programs should tie GDPR-style data minimization ideas to clear supplier due diligence expectations aligned to organizational risk. (Emphasis: {focus}.)",
  "distractors": [
    "It means RTO and RPO are interchangeable labels.",
    "It eliminates the value of after-action reviews.",
    "It implies BCP and DRP are always identical documents."
  ]
}
