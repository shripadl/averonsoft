import type { TemplateConfig } from '../../template-config'

export const cryptographyTemplate055: TemplateConfig = {
  "domain": "cryptography",
  "stem": "Cryptography study (55/80): which statement is most accurate about CSPRNG requirements regarding protocol negotiation hazards with emphasis on {focus}?",
  "variables": {
    "focus": [
      "monitoring signals",
      "dependency mapping",
      "runbook clarity"
    ]
  },
  "correct": "Well-scoped designs use CSPRNG requirements deliberately to meet protocol negotiation hazards without confusing hashing with encryption. (Emphasis: {focus}.)",
  "distractors": [
    "It means post-quantum readiness is only a marketing label.",
    "It eliminates the value of hybrid TLS handshakes.",
    "It implies KDFs can replace access control policies."
  ]
}
