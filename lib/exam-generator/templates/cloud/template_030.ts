import type { TemplateConfig } from '../../template-config'

export const cloudTemplate030: TemplateConfig = {
  "domain": "cloud",
  "stem": "For generic public-cloud study (30/80): which statement aligns best with “private subnets and route tables” when discussing cost drivers for egress and requests with emphasis on {focus}?",
  "variables": {
    "focus": [
      "design review",
      "tabletop exercise",
      "evidence sampling"
    ]
  },
  "correct": "Policies, monitoring, and architecture choices around private subnets and route tables should explicitly address cost drivers for egress and requests under a shared-responsibility model. (Emphasis: {focus}.)",
  "distractors": [
    "It means private subnets cannot route through NAT.",
    "It implies edge caches always hold authoritative writes.",
    "It removes the need for change windows entirely."
  ]
}
