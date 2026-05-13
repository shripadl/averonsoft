import type { TemplateConfig } from '../../template-config'

export const cloudTemplate022: TemplateConfig = {
  "domain": "cloud",
  "stem": "For generic public-cloud study (22/80): which statement aligns best with “horizontal autoscaling groups” when discussing cost drivers for egress and requests?",
  "variables": {},
  "correct": "Policies, monitoring, and architecture choices around horizontal autoscaling groups should explicitly address cost drivers for egress and requests under a shared-responsibility model.",
  "distractors": [
    "It means private subnets cannot route through NAT.",
    "It implies edge caches always hold authoritative writes.",
    "It removes the need for change windows entirely."
  ]
}
