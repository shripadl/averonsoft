import type { TemplateConfig } from '../../template-config'

export const cryptographyTemplate060: TemplateConfig = {
  "domain": "cryptography",
  "stem": "Cryptography study (60/80): which statement is most accurate about downgrade resistance concepts regarding protocol negotiation hazards with emphasis on {focus}?",
  "variables": {
    "focus": [
      "design review",
      "tabletop exercise",
      "evidence sampling"
    ]
  },
  "correct": "Well-scoped designs use downgrade resistance concepts deliberately to meet protocol negotiation hazards without confusing hashing with encryption. (Emphasis: {focus}.)",
  "distractors": [
    "It guarantees asymmetric encryption is always faster than symmetric.",
    "It removes the need to verify certificate chains.",
    "It implies HMAC can replace encryption for secrecy."
  ]
}
