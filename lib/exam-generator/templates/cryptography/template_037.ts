import type { TemplateConfig } from '../../template-config'

export const cryptographyTemplate037: TemplateConfig = {
  "domain": "cryptography",
  "stem": "Cryptography study (37/80): which statement is most accurate about AES block cipher usage (introductory) regarding key lifecycle hygiene?",
  "variables": {},
  "correct": "Well-scoped designs use AES block cipher usage (introductory) deliberately to meet key lifecycle hygiene without confusing hashing with encryption.",
  "distractors": [
    "It means IV reuse is safe if throughput is high.",
    "It eliminates the need for secure random nonces.",
    "It implies signing keys can be shared across tenants."
  ]
}
