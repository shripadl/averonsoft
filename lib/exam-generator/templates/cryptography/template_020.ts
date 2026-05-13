import type { TemplateConfig } from '../../template-config'

export const cryptographyTemplate020: TemplateConfig = {
  "domain": "cryptography",
  "stem": "Cryptography study (20/80): which statement is most accurate about RSA-style public-key ideas (introductory) regarding integrity and authenticity goals with emphasis on {focus}?",
  "variables": {
    "focus": [
      "access reviews",
      "encryption coverage",
      "logging retention"
    ]
  },
  "correct": "Well-scoped designs use RSA-style public-key ideas (introductory) deliberately to meet integrity and authenticity goals without confusing hashing with encryption. (Emphasis: {focus}.)",
  "distractors": [
    "It guarantees asymmetric encryption is always faster than symmetric.",
    "It removes the need to verify certificate chains.",
    "It implies HMAC can replace encryption for secrecy."
  ]
}
