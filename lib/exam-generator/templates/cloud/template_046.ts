import type { TemplateConfig } from '../../template-config'

export const cloudTemplate046: TemplateConfig = {
  "domain": "cloud",
  "stem": "For generic public-cloud study (46/80): which statement aligns best with “private subnets and route tables” when discussing availability and fault-isolation assumptions?",
  "variables": {},
  "correct": "Policies, monitoring, and architecture choices around private subnets and route tables should explicitly address availability and fault-isolation assumptions under a shared-responsibility model.",
  "distractors": [
    "It means private subnets cannot route through NAT.",
    "It implies edge caches always hold authoritative writes.",
    "It removes the need for change windows entirely."
  ]
}
