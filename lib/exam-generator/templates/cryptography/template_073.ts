import type { TemplateConfig } from '../../template-config'

export const cryptographyTemplate073: TemplateConfig = {
  "domain": "cryptography",
  "stem": "Cryptography study (73/80): which statement is most accurate about MAC versus encryption regarding deployment and configuration hazards?",
  "variables": {},
  "correct": "Well-scoped designs use MAC versus encryption deliberately to meet deployment and configuration hazards without confusing hashing with encryption.",
  "distractors": [
    "It means MACs provide confidentiality without encryption.",
    "It eliminates nonce requirements for all modes.",
    "It implies RSA keys never need rotation."
  ]
}
