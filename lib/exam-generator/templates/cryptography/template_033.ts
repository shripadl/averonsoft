import type { TemplateConfig } from '../../template-config'

export const cryptographyTemplate033: TemplateConfig = {
  "domain": "cryptography",
  "stem": "Cryptography study (33/80): which statement is most accurate about cryptographic hash properties regarding key lifecycle hygiene?",
  "variables": {},
  "correct": "Well-scoped designs use cryptographic hash properties deliberately to meet key lifecycle hygiene without confusing hashing with encryption.",
  "distractors": [
    "It means MACs provide confidentiality without encryption.",
    "It eliminates nonce requirements for all modes.",
    "It implies RSA keys never need rotation."
  ]
}
