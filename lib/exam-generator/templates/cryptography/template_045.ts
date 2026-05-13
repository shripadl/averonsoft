import type { TemplateConfig } from '../../template-config'

export const cryptographyTemplate045: TemplateConfig = {
  "domain": "cryptography",
  "stem": "Cryptography study (45/80): which statement is most accurate about certificate chain validation goals regarding key lifecycle hygiene with emphasis on {focus}?",
  "variables": {
    "focus": [
      "runbook tests",
      "dependency drills",
      "scope control"
    ]
  },
  "correct": "Well-scoped designs use certificate chain validation goals deliberately to meet key lifecycle hygiene without confusing hashing with encryption. (Emphasis: {focus}.)",
  "distractors": [
    "It means IV reuse is safe if throughput is high.",
    "It eliminates the need for secure random nonces.",
    "It implies signing keys can be shared across tenants."
  ]
}
