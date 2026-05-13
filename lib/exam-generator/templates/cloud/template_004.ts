import type { TemplateConfig } from '../../template-config'

export const cloudTemplate004: TemplateConfig = {
  "domain": "cloud",
  "stem": "For generic public-cloud study (4/80): which statement aligns best with “VPC-style isolated virtual networks” when discussing security ownership boundaries?",
  "variables": {},
  "correct": "Policies, monitoring, and architecture choices around VPC-style isolated virtual networks should explicitly address security ownership boundaries under a shared-responsibility model.",
  "distractors": [
    "It means object storage cannot version objects.",
    "It implies compute instances never need patching.",
    "It removes the concept of availability zones."
  ]
}
