import type { TemplateConfig } from '../../template-config'

export const cloudTemplate043: TemplateConfig = {
  "domain": "cloud",
  "stem": "For generic public-cloud study (43/80): which statement aligns best with “cloud IAM federation patterns” when discussing availability and fault-isolation assumptions?",
  "variables": {},
  "correct": "Policies, monitoring, and architecture choices around cloud IAM federation patterns should explicitly address availability and fault-isolation assumptions under a shared-responsibility model.",
  "distractors": [
    "It implies a single global administrator account for all customers.",
    "It removes the value of least-privilege policies.",
    "It guarantees zero configuration for networking."
  ]
}
