import type { TemplateConfig } from '../../template-config'

export const cryptographyTemplate010: TemplateConfig = {
  "domain": "cryptography",
  "stem": "Cryptography study (10/80): which statement is most accurate about digital signatures and integrity regarding confidentiality goals with emphasis on {focus}?",
  "variables": {
    "focus": [
      "policy attestation",
      "training records",
      "control testing"
    ]
  },
  "correct": "Well-scoped designs use digital signatures and integrity deliberately to meet confidentiality goals without confusing hashing with encryption. (Emphasis: {focus}.)",
  "distractors": [
    "It guarantees perfect secrecy without any secrets.",
    "It removes the distinction between hashing and encryption.",
    "It implies digital signatures hide message content."
  ]
}
