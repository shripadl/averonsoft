import type { TemplateConfig } from '../../template-config'

export const cryptographyTemplate021: TemplateConfig = {
  "domain": "cryptography",
  "stem": "Cryptography study (21/80): which statement is most accurate about AES block cipher usage (introductory) regarding integrity and authenticity goals?",
  "variables": {},
  "correct": "Well-scoped designs use AES block cipher usage (introductory) deliberately to meet integrity and authenticity goals without confusing hashing with encryption.",
  "distractors": [
    "It means IV reuse is safe if throughput is high.",
    "It eliminates the need for secure random nonces.",
    "It implies signing keys can be shared across tenants."
  ]
}
