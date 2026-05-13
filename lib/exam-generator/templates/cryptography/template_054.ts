import type { TemplateConfig } from '../../template-config'

export const cryptographyTemplate054: TemplateConfig = {
  "domain": "cryptography",
  "stem": "Cryptography study (54/80): which statement is most accurate about key derivation functions (KDFs) regarding protocol negotiation hazards?",
  "variables": {},
  "correct": "Well-scoped designs use key derivation functions (KDFs) deliberately to meet protocol negotiation hazards without confusing hashing with encryption.",
  "distractors": [
    "It guarantees ciphertext length reveals no information.",
    "It removes the distinction between encryption and encoding.",
    "It implies MAC tags should be truncated to one byte always."
  ]
}
