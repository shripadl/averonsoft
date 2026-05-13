import type { TemplateConfig } from '../../template-config'

export const cryptographyTemplate013: TemplateConfig = {
  "domain": "cryptography",
  "stem": "Cryptography study (13/80): which statement is most accurate about certificate chain validation goals regarding confidentiality goals?",
  "variables": {},
  "correct": "Well-scoped designs use certificate chain validation goals deliberately to meet confidentiality goals without confusing hashing with encryption.",
  "distractors": [
    "It means IV reuse is safe if throughput is high.",
    "It eliminates the need for secure random nonces.",
    "It implies signing keys can be shared across tenants."
  ]
}
