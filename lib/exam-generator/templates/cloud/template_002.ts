import type { TemplateConfig } from '../../template-config'

export const cloudTemplate002: TemplateConfig = {
  "domain": "cloud",
  "stem": "For generic public-cloud study (2/80): which statement aligns best with “S3-style object storage buckets” when discussing security ownership boundaries?",
  "variables": {},
  "correct": "Policies, monitoring, and architecture choices around S3-style object storage buckets should explicitly address security ownership boundaries under a shared-responsibility model.",
  "distractors": [
    "It means tenants never share physical hosts.",
    "It removes encryption requirements for data at rest.",
    "It forbids using multiple regions together."
  ]
}
