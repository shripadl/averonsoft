import type { TemplateConfig } from '../../template-config'

export const cryptographyTemplate050: TemplateConfig = {
  "domain": "cryptography",
  "stem": "Cryptography study (50/80): which statement is most accurate about symmetric encryption roles regarding protocol negotiation hazards with emphasis on {focus}?",
  "variables": {
    "focus": [
      "access reviews",
      "encryption coverage",
      "logging retention"
    ]
  },
  "correct": "Well-scoped designs use symmetric encryption roles deliberately to meet protocol negotiation hazards without confusing hashing with encryption. (Emphasis: {focus}.)",
  "distractors": [
    "It guarantees perfect secrecy without any secrets.",
    "It removes the distinction between hashing and encryption.",
    "It implies digital signatures hide message content."
  ]
}
