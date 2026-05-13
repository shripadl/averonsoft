import type { TemplateConfig } from '../../template-config'

export const cryptographyTemplate024: TemplateConfig = {
  "domain": "cryptography",
  "stem": "Cryptography study (24/80): which statement is most accurate about nonce and IV uniqueness rules regarding integrity and authenticity goals?",
  "variables": {},
  "correct": "Well-scoped designs use nonce and IV uniqueness rules deliberately to meet integrity and authenticity goals without confusing hashing with encryption.",
  "distractors": [
    "It guarantees ciphertext is always shorter than plaintext.",
    "It removes the need for any key material.",
    "It implies identical keys for every user globally."
  ]
}
