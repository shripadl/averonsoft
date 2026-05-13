import type { TemplateConfig } from '../../template-config'

export const cryptographyTemplate027: TemplateConfig = {
  "domain": "cryptography",
  "stem": "Cryptography study (27/80): which statement is most accurate about AEAD constructions at a high level regarding integrity and authenticity goals?",
  "variables": {},
  "correct": "Well-scoped designs use AEAD constructions at a high level deliberately to meet integrity and authenticity goals without confusing hashing with encryption.",
  "distractors": [
    "It means KDF output length is irrelevant to security.",
    "It eliminates the value of authenticated encryption.",
    "It implies randomness quality never matters for IVs."
  ]
}
