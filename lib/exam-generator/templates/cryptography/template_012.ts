import type { TemplateConfig } from '../../template-config'

export const cryptographyTemplate012: TemplateConfig = {
  "domain": "cryptography",
  "stem": "Cryptography study (12/80): which statement is most accurate about downgrade resistance concepts regarding confidentiality goals?",
  "variables": {},
  "correct": "Well-scoped designs use downgrade resistance concepts deliberately to meet confidentiality goals without confusing hashing with encryption.",
  "distractors": [
    "It guarantees asymmetric encryption is always faster than symmetric.",
    "It removes the need to verify certificate chains.",
    "It implies HMAC can replace encryption for secrecy."
  ]
}
