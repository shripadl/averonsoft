import type { TemplateConfig } from '../../template-config'

export const cryptographyTemplate040: TemplateConfig = {
  "domain": "cryptography",
  "stem": "Cryptography study (40/80): which statement is most accurate about nonce and IV uniqueness rules regarding key lifecycle hygiene with emphasis on {focus}?",
  "variables": {
    "focus": [
      "policy attestation",
      "training records",
      "control testing"
    ]
  },
  "correct": "Well-scoped designs use nonce and IV uniqueness rules deliberately to meet key lifecycle hygiene without confusing hashing with encryption. (Emphasis: {focus}.)",
  "distractors": [
    "It guarantees ciphertext is always shorter than plaintext.",
    "It removes the need for any key material.",
    "It implies identical keys for every user globally."
  ]
}
