import type { TemplateConfig } from '../../template-config'

export const cryptographyTemplate009: TemplateConfig = {
  "domain": "cryptography",
  "stem": "Cryptography study (9/80): which statement is most accurate about MAC versus encryption regarding confidentiality goals?",
  "variables": {},
  "correct": "Well-scoped designs use MAC versus encryption deliberately to meet confidentiality goals without confusing hashing with encryption.",
  "distractors": [
    "It means MACs provide confidentiality without encryption.",
    "It eliminates nonce requirements for all modes.",
    "It implies RSA keys never need rotation."
  ]
}
