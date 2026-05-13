import type { TemplateConfig } from '../../template-config'

export const cryptographyTemplate005: TemplateConfig = {
  "domain": "cryptography",
  "stem": "Cryptography study (5/80): which statement is most accurate about AES block cipher usage (introductory) regarding confidentiality goals with emphasis on {focus}?",
  "variables": {
    "focus": [
      "segmentation design",
      "patch cadence",
      "credential rotation"
    ]
  },
  "correct": "Well-scoped designs use AES block cipher usage (introductory) deliberately to meet confidentiality goals without confusing hashing with encryption. (Emphasis: {focus}.)",
  "distractors": [
    "It means IV reuse is safe if throughput is high.",
    "It eliminates the need for secure random nonces.",
    "It implies signing keys can be shared across tenants."
  ]
}
