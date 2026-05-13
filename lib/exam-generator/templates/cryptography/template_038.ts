import type { TemplateConfig } from '../../template-config'

export const cryptographyTemplate038: TemplateConfig = {
  "domain": "cryptography",
  "stem": "Cryptography study (38/80): which statement is most accurate about key derivation functions (KDFs) regarding key lifecycle hygiene?",
  "variables": {},
  "correct": "Well-scoped designs use key derivation functions (KDFs) deliberately to meet key lifecycle hygiene without confusing hashing with encryption.",
  "distractors": [
    "It guarantees ciphertext length reveals no information.",
    "It removes the distinction between encryption and encoding.",
    "It implies MAC tags should be truncated to one byte always."
  ]
}
