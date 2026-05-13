import type { TemplateConfig } from '../../template-config'

export const cloudTemplate018: TemplateConfig = {
  "domain": "cloud",
  "stem": "For generic public-cloud study (18/80): which statement aligns best with “S3-style object storage buckets” when discussing cost drivers for egress and requests?",
  "variables": {},
  "correct": "Policies, monitoring, and architecture choices around S3-style object storage buckets should explicitly address cost drivers for egress and requests under a shared-responsibility model.",
  "distractors": [
    "It means tenants never share physical hosts.",
    "It removes encryption requirements for data at rest.",
    "It forbids using multiple regions together."
  ]
}
