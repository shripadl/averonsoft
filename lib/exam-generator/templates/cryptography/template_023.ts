import type { TemplateConfig } from '../../template-config'

export const cryptographyTemplate023: TemplateConfig = {
  "domain": "cryptography",
  "stem": "Cryptography study (23/80): which statement is most accurate about CSPRNG requirements regarding integrity and authenticity goals?",
  "variables": {},
  "correct": "Well-scoped designs use CSPRNG requirements deliberately to meet integrity and authenticity goals without confusing hashing with encryption.",
  "distractors": [
    "It means post-quantum readiness is only a marketing label.",
    "It eliminates the value of hybrid TLS handshakes.",
    "It implies KDFs can replace access control policies."
  ]
}
