import type { TemplateConfig } from '../../template-config'

export const cryptographyTemplate004: TemplateConfig = {
  "domain": "cryptography",
  "stem": "Cryptography study (4/80): which statement is most accurate about RSA-style public-key ideas (introductory) regarding confidentiality goals?",
  "variables": {},
  "correct": "Well-scoped designs use RSA-style public-key ideas (introductory) deliberately to meet confidentiality goals without confusing hashing with encryption.",
  "distractors": [
    "It guarantees asymmetric encryption is always faster than symmetric.",
    "It removes the need to verify certificate chains.",
    "It implies HMAC can replace encryption for secrecy."
  ]
}
