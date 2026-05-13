import type { TemplateConfig } from '../../template-config'

export const cryptographyTemplate015: TemplateConfig = {
  "domain": "cryptography",
  "stem": "Cryptography study (15/80): which statement is most accurate about hybrid encryption rationale regarding confidentiality goals with emphasis on {focus}?",
  "variables": {
    "focus": [
      "runbook tests",
      "dependency drills",
      "scope control"
    ]
  },
  "correct": "Well-scoped designs use hybrid encryption rationale deliberately to meet confidentiality goals without confusing hashing with encryption. (Emphasis: {focus}.)",
  "distractors": [
    "It means post-quantum readiness is only a marketing label.",
    "It eliminates the value of hybrid TLS handshakes.",
    "It implies KDFs can replace access control policies."
  ]
}
