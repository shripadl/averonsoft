import type { TemplateConfig } from '../../template-config'

export const cloudTemplate035: TemplateConfig = {
  "domain": "cloud",
  "stem": "For generic public-cloud study (35/80): which statement aligns best with “EC2-style virtual machine instances” when discussing availability and fault-isolation assumptions with emphasis on {focus}?",
  "variables": {
    "focus": [
      "segmentation design",
      "patch cadence",
      "credential rotation"
    ]
  },
  "correct": "Policies, monitoring, and architecture choices around EC2-style virtual machine instances should explicitly address availability and fault-isolation assumptions under a shared-responsibility model. (Emphasis: {focus}.)",
  "distractors": [
    "It implies a single global administrator account for all customers.",
    "It removes the value of least-privilege policies.",
    "It guarantees zero configuration for networking."
  ]
}
