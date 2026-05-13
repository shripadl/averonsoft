import type { TemplateConfig } from '../../template-config'

export const cloudTemplate065: TemplateConfig = {
  "domain": "cloud",
  "stem": "For generic public-cloud study (65/80): which statement aligns best with “IAM-style identity policies” when discussing data durability versus availability tradeoffs with emphasis on {focus}?",
  "variables": {
    "focus": [
      "segmentation design",
      "patch cadence",
      "credential rotation"
    ]
  },
  "correct": "Policies, monitoring, and architecture choices around IAM-style identity policies should explicitly address data durability versus availability tradeoffs under a shared-responsibility model. (Emphasis: {focus}.)",
  "distractors": [
    "It replaces the need for backup copies entirely.",
    "It mandates identical hardware in every rack.",
    "It eliminates monitoring because the provider observes everything."
  ]
}
