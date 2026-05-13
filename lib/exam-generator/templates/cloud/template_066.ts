import type { TemplateConfig } from '../../template-config'

export const cloudTemplate066: TemplateConfig = {
  "domain": "cloud",
  "stem": "For generic public-cloud study (66/80): which statement aligns best with “S3-style object storage buckets” when discussing data durability versus availability tradeoffs?",
  "variables": {},
  "correct": "Policies, monitoring, and architecture choices around S3-style object storage buckets should explicitly address data durability versus availability tradeoffs under a shared-responsibility model.",
  "distractors": [
    "It means tenants never share physical hosts.",
    "It removes encryption requirements for data at rest.",
    "It forbids using multiple regions together."
  ]
}
