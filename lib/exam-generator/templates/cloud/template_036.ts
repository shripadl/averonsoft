import type { TemplateConfig } from '../../template-config'

export const cloudTemplate036: TemplateConfig = {
  "domain": "cloud",
  "stem": "For generic public-cloud study (36/80): which statement aligns best with “VPC-style isolated virtual networks” when discussing availability and fault-isolation assumptions?",
  "variables": {},
  "correct": "Policies, monitoring, and architecture choices around VPC-style isolated virtual networks should explicitly address availability and fault-isolation assumptions under a shared-responsibility model.",
  "distractors": [
    "It means object storage cannot version objects.",
    "It implies compute instances never need patching.",
    "It removes the concept of availability zones."
  ]
}
