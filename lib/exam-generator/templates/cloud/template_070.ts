import type { TemplateConfig } from '../../template-config'

export const cloudTemplate070: TemplateConfig = {
  "domain": "cloud",
  "stem": "For generic public-cloud study (70/80): which statement aligns best with “horizontal autoscaling groups” when discussing data durability versus availability tradeoffs with emphasis on {focus}?",
  "variables": {
    "focus": [
      "policy attestation",
      "training records",
      "control testing"
    ]
  },
  "correct": "Policies, monitoring, and architecture choices around horizontal autoscaling groups should explicitly address data durability versus availability tradeoffs under a shared-responsibility model. (Emphasis: {focus}.)",
  "distractors": [
    "It means private subnets cannot route through NAT.",
    "It implies edge caches always hold authoritative writes.",
    "It removes the need for change windows entirely."
  ]
}
