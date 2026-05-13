import type { TemplateConfig } from '../../template-config'

export const cryptographyTemplate003: TemplateConfig = {
  "domain": "cryptography",
  "stem": "Cryptography study (3/80): which statement is most accurate about asymmetric encryption and key pairs regarding confidentiality goals?",
  "variables": {},
  "correct": "Well-scoped designs use asymmetric encryption and key pairs deliberately to meet confidentiality goals without confusing hashing with encryption.",
  "distractors": [
    "It means KDF output length is irrelevant to security.",
    "It eliminates the value of authenticated encryption.",
    "It implies randomness quality never matters for IVs."
  ]
}
