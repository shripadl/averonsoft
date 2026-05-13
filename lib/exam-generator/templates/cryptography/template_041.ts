import type { TemplateConfig } from '../../template-config'

export const cryptographyTemplate041: TemplateConfig = {
  "domain": "cryptography",
  "stem": "Cryptography study (41/80): which statement is most accurate about MAC versus encryption regarding key lifecycle hygiene?",
  "variables": {},
  "correct": "Well-scoped designs use MAC versus encryption deliberately to meet key lifecycle hygiene without confusing hashing with encryption.",
  "distractors": [
    "It means MACs provide confidentiality without encryption.",
    "It eliminates nonce requirements for all modes.",
    "It implies RSA keys never need rotation."
  ]
}
