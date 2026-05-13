import type { TemplateConfig } from '../../template-config'

export const cryptographyTemplate080: TemplateConfig = {
  "domain": "cryptography",
  "stem": "Cryptography study (80/80): which statement is most accurate about post-quantum migration planning (introductory) regarding deployment and configuration hazards with emphasis on {focus}?",
  "variables": {
    "focus": [
      "access reviews",
      "encryption coverage",
      "logging retention"
    ]
  },
  "correct": "Well-scoped designs use post-quantum migration planning (introductory) deliberately to meet deployment and configuration hazards without confusing hashing with encryption. (Emphasis: {focus}.)",
  "distractors": [
    "It guarantees ciphertext is always shorter than plaintext.",
    "It removes the need for any key material.",
    "It implies identical keys for every user globally."
  ]
}
