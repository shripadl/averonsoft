import type { TemplateConfig } from '../../template-config'

export const legalbcpTemplate070: TemplateConfig = {
  "domain": "legal_bcp",
  "stem": "Legal and continuity study (70/80): which option best reflects RPO definitions in the context of supplier due diligence with emphasis on {focus}?",
  "variables": {
    "focus": [
      "policy attestation",
      "training records",
      "control testing"
    ]
  },
  "correct": "Programs should tie RPO definitions to clear supplier due diligence expectations aligned to organizational risk. (Emphasis: {focus}.)",
  "distractors": [
    "It guarantees cyber insurance replaces internal security controls.",
    "It removes the need to document processor subprocessors.",
    "It implies legal holds apply only after a final court judgment."
  ]
}
