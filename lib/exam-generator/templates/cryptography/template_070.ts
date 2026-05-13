import type { TemplateConfig } from '../../template-config'

export const cryptographyTemplate070: TemplateConfig = {
  "domain": "cryptography",
  "stem": "Cryptography study (70/80): which statement is most accurate about key derivation functions (KDFs) regarding deployment and configuration hazards with emphasis on {focus}?",
  "variables": {
    "focus": [
      "policy attestation",
      "training records",
      "control testing"
    ]
  },
  "correct": "Well-scoped designs use key derivation functions (KDFs) deliberately to meet deployment and configuration hazards without confusing hashing with encryption. (Emphasis: {focus}.)",
  "distractors": [
    "It guarantees ciphertext length reveals no information.",
    "It removes the distinction between encryption and encoding.",
    "It implies MAC tags should be truncated to one byte always."
  ]
}
