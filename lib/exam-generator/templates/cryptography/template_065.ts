import type { TemplateConfig } from '../../template-config'

export const cryptographyTemplate065: TemplateConfig = {
  "domain": "cryptography",
  "stem": "Cryptography study (65/80): which statement is most accurate about cryptographic hash properties regarding deployment and configuration hazards with emphasis on {focus}?",
  "variables": {
    "focus": [
      "segmentation design",
      "patch cadence",
      "credential rotation"
    ]
  },
  "correct": "Well-scoped designs use cryptographic hash properties deliberately to meet deployment and configuration hazards without confusing hashing with encryption. (Emphasis: {focus}.)",
  "distractors": [
    "It means MACs provide confidentiality without encryption.",
    "It eliminates nonce requirements for all modes.",
    "It implies RSA keys never need rotation."
  ]
}
