import type { TemplateConfig } from '../../template-config'

export const cryptographyTemplate071: TemplateConfig = {
  "domain": "cryptography",
  "stem": "Cryptography study (71/80): which statement is most accurate about CSPRNG requirements regarding deployment and configuration hazards?",
  "variables": {},
  "correct": "Well-scoped designs use CSPRNG requirements deliberately to meet deployment and configuration hazards without confusing hashing with encryption.",
  "distractors": [
    "It means post-quantum readiness is only a marketing label.",
    "It eliminates the value of hybrid TLS handshakes.",
    "It implies KDFs can replace access control policies."
  ]
}
