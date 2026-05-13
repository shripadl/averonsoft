import type { TemplateConfig } from '../../template-config'

export const legalbcpTemplate030: TemplateConfig = {
  "domain": "legal_bcp",
  "stem": "Legal and continuity study (30/80): which option best reflects ISO 27001 ISMS framing (introductory) in the context of governance with emphasis on {focus}?",
  "variables": {
    "focus": [
      "design review",
      "tabletop exercise",
      "evidence sampling"
    ]
  },
  "correct": "Programs should tie ISO 27001 ISMS framing (introductory) to clear governance expectations aligned to organizational risk. (Emphasis: {focus}.)",
  "distractors": [
    "It guarantees cyber insurance replaces internal security controls.",
    "It removes the need to document processor subprocessors.",
    "It implies legal holds apply only after a final court judgment."
  ]
}
