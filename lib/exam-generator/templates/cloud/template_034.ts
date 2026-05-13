import type { TemplateConfig } from '../../template-config'

export const cloudTemplate034: TemplateConfig = {
  "domain": "cloud",
  "stem": "For generic public-cloud study (34/80): which statement aligns best with “S3-style object storage buckets” when discussing availability and fault-isolation assumptions?",
  "variables": {},
  "correct": "Policies, monitoring, and architecture choices around S3-style object storage buckets should explicitly address availability and fault-isolation assumptions under a shared-responsibility model.",
  "distractors": [
    "It means tenants never share physical hosts.",
    "It removes encryption requirements for data at rest.",
    "It forbids using multiple regions together."
  ]
}
