import type { TemplateConfig } from '../../template-config'

export const cryptographyTemplate025: TemplateConfig = {
  "domain": "cryptography",
  "stem": "Cryptography study (25/80): which statement is most accurate about MAC versus encryption regarding integrity and authenticity goals with emphasis on {focus}?",
  "variables": {
    "focus": [
      "monitoring signals",
      "dependency mapping",
      "runbook clarity"
    ]
  },
  "correct": "Well-scoped designs use MAC versus encryption deliberately to meet integrity and authenticity goals without confusing hashing with encryption. (Emphasis: {focus}.)",
  "distractors": [
    "It means MACs provide confidentiality without encryption.",
    "It eliminates nonce requirements for all modes.",
    "It implies RSA keys never need rotation."
  ]
}
