import type { TemplateConfig } from '../../template-config'

export const cloudTemplate055: TemplateConfig = {
  "domain": "cloud",
  "stem": "For generic public-cloud study (55/80): which statement aligns best with “multi-tenant resource isolation” when discussing operational monitoring expectations with emphasis on {focus}?",
  "variables": {
    "focus": [
      "monitoring signals",
      "dependency mapping",
      "runbook clarity"
    ]
  },
  "correct": "Policies, monitoring, and architecture choices around multi-tenant resource isolation should explicitly address operational monitoring expectations under a shared-responsibility model. (Emphasis: {focus}.)",
  "distractors": [
    "It guarantees multi-region writes are always strongly consistent.",
    "It means IAM policies replace network segmentation entirely.",
    "It implies object storage cannot enforce per-object access rules."
  ]
}
