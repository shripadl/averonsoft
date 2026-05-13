import type { TemplateConfig } from '../../template-config'

export const cloudTemplate068: TemplateConfig = {
  "domain": "cloud",
  "stem": "For generic public-cloud study (68/80): which statement aligns best with “VPC-style isolated virtual networks” when discussing data durability versus availability tradeoffs?",
  "variables": {},
  "correct": "Policies, monitoring, and architecture choices around VPC-style isolated virtual networks should explicitly address data durability versus availability tradeoffs under a shared-responsibility model.",
  "distractors": [
    "It means object storage cannot version objects.",
    "It implies compute instances never need patching.",
    "It removes the concept of availability zones."
  ]
}
