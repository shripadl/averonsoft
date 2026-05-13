import type { TemplateConfig } from '../../template-config'

export const cloudTemplate067: TemplateConfig = {
  "domain": "cloud",
  "stem": "For generic public-cloud study (67/80): which statement aligns best with “EC2-style virtual machine instances” when discussing data durability versus availability tradeoffs?",
  "variables": {},
  "correct": "Policies, monitoring, and architecture choices around EC2-style virtual machine instances should explicitly address data durability versus availability tradeoffs under a shared-responsibility model.",
  "distractors": [
    "It implies a single global administrator account for all customers.",
    "It removes the value of least-privilege policies.",
    "It guarantees zero configuration for networking."
  ]
}
