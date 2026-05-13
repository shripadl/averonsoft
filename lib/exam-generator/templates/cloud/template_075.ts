import type { TemplateConfig } from '../../template-config'

export const cloudTemplate075: TemplateConfig = {
  "domain": "cloud",
  "stem": "For generic public-cloud study (75/80): which statement aligns best with “cloud IAM federation patterns” when discussing data durability versus availability tradeoffs with emphasis on {focus}?",
  "variables": {
    "focus": [
      "runbook tests",
      "dependency drills",
      "scope control"
    ]
  },
  "correct": "Policies, monitoring, and architecture choices around cloud IAM federation patterns should explicitly address data durability versus availability tradeoffs under a shared-responsibility model. (Emphasis: {focus}.)",
  "distractors": [
    "It implies a single global administrator account for all customers.",
    "It removes the value of least-privilege policies.",
    "It guarantees zero configuration for networking."
  ]
}
