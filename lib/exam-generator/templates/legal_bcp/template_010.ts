import type { TemplateConfig } from '../../template-config'

export const legalbcpTemplate010: TemplateConfig = {
  "domain": "legal_bcp",
  "stem": "Legal and continuity study (10/80): which option best reflects incident response versus continuity activation in the context of documentation with emphasis on {focus}?",
  "variables": {
    "focus": [
      "policy attestation",
      "training records",
      "control testing"
    ]
  },
  "correct": "Programs should tie incident response versus continuity activation to clear documentation expectations aligned to organizational risk. (Emphasis: {focus}.)",
  "distractors": [
    "It guarantees insurance replaces all continuity testing.",
    "It removes the role of business impact analysis.",
    "It implies legal holds apply only to paper records."
  ]
}
