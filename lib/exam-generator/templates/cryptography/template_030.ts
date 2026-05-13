import type { TemplateConfig } from '../../template-config'

export const cryptographyTemplate030: TemplateConfig = {
  "domain": "cryptography",
  "stem": "Cryptography study (30/80): which statement is most accurate about side-channel awareness (introductory) regarding integrity and authenticity goals with emphasis on {focus}?",
  "variables": {
    "focus": [
      "design review",
      "tabletop exercise",
      "evidence sampling"
    ]
  },
  "correct": "Well-scoped designs use side-channel awareness (introductory) deliberately to meet integrity and authenticity goals without confusing hashing with encryption. (Emphasis: {focus}.)",
  "distractors": [
    "It guarantees ciphertext length reveals no information.",
    "It removes the distinction between encryption and encoding.",
    "It implies MAC tags should be truncated to one byte always."
  ]
}
