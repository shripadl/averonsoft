import type { TemplateConfig } from '../../template-config'

export const cloudTemplate050: TemplateConfig = {
  "domain": "cloud",
  "stem": "For generic public-cloud study (50/80): which statement aligns best with “S3-style object storage buckets” when discussing operational monitoring expectations with emphasis on {focus}?",
  "variables": {
    "focus": [
      "access reviews",
      "encryption coverage",
      "logging retention"
    ]
  },
  "correct": "Policies, monitoring, and architecture choices around S3-style object storage buckets should explicitly address operational monitoring expectations under a shared-responsibility model. (Emphasis: {focus}.)",
  "distractors": [
    "It means tenants never share physical hosts.",
    "It removes encryption requirements for data at rest.",
    "It forbids using multiple regions together."
  ]
}
