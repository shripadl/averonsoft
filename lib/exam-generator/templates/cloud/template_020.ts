import type { TemplateConfig } from '../../template-config'

export const cloudTemplate020: TemplateConfig = {
  "domain": "cloud",
  "stem": "For generic public-cloud study (20/80): which statement aligns best with “VPC-style isolated virtual networks” when discussing cost drivers for egress and requests with emphasis on {focus}?",
  "variables": {
    "focus": [
      "access reviews",
      "encryption coverage",
      "logging retention"
    ]
  },
  "correct": "Policies, monitoring, and architecture choices around VPC-style isolated virtual networks should explicitly address cost drivers for egress and requests under a shared-responsibility model. (Emphasis: {focus}.)",
  "distractors": [
    "It means object storage cannot version objects.",
    "It implies compute instances never need patching.",
    "It removes the concept of availability zones."
  ]
}
