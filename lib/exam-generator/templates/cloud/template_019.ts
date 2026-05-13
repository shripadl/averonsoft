import type { TemplateConfig } from '../../template-config'

export const cloudTemplate019: TemplateConfig = {
  "domain": "cloud",
  "stem": "For generic public-cloud study (19/80): which statement aligns best with “EC2-style virtual machine instances” when discussing cost drivers for egress and requests?",
  "variables": {},
  "correct": "Policies, monitoring, and architecture choices around EC2-style virtual machine instances should explicitly address cost drivers for egress and requests under a shared-responsibility model.",
  "distractors": [
    "It implies a single global administrator account for all customers.",
    "It removes the value of least-privilege policies.",
    "It guarantees zero configuration for networking."
  ]
}
