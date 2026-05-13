import type { TemplateConfig } from '../../template-config'

export const cryptographyTemplate075: TemplateConfig = {
  "domain": "cryptography",
  "stem": "Cryptography study (75/80): which statement is most accurate about AEAD constructions at a high level regarding deployment and configuration hazards with emphasis on {focus}?",
  "variables": {
    "focus": [
      "runbook tests",
      "dependency drills",
      "scope control"
    ]
  },
  "correct": "Well-scoped designs use AEAD constructions at a high level deliberately to meet deployment and configuration hazards without confusing hashing with encryption. (Emphasis: {focus}.)",
  "distractors": [
    "It means KDF output length is irrelevant to security.",
    "It eliminates the value of authenticated encryption.",
    "It implies randomness quality never matters for IVs."
  ]
}
