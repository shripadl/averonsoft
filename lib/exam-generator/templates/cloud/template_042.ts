import type { TemplateConfig } from '../../template-config'

export const cloudTemplate042: TemplateConfig = {
  "domain": "cloud",
  "stem": "For generic public-cloud study (42/80): which statement aligns best with “edge caching and content delivery” when discussing availability and fault-isolation assumptions?",
  "variables": {},
  "correct": "Policies, monitoring, and architecture choices around edge caching and content delivery should explicitly address availability and fault-isolation assumptions under a shared-responsibility model.",
  "distractors": [
    "It means tenants never share physical hosts.",
    "It removes encryption requirements for data at rest.",
    "It forbids using multiple regions together."
  ]
}
