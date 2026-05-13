import type { TemplateConfig } from '../../template-config'

export const cryptographyTemplate035: TemplateConfig = {
  "domain": "cryptography",
  "stem": "Cryptography study (35/80): which statement is most accurate about asymmetric encryption and key pairs regarding key lifecycle hygiene with emphasis on {focus}?",
  "variables": {
    "focus": [
      "segmentation design",
      "patch cadence",
      "credential rotation"
    ]
  },
  "correct": "Well-scoped designs use asymmetric encryption and key pairs deliberately to meet key lifecycle hygiene without confusing hashing with encryption. (Emphasis: {focus}.)",
  "distractors": [
    "It means KDF output length is irrelevant to security.",
    "It eliminates the value of authenticated encryption.",
    "It implies randomness quality never matters for IVs."
  ]
}
