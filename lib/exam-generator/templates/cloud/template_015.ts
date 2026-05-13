import type { TemplateConfig } from '../../template-config'

export const cloudTemplate015: TemplateConfig = {
  "domain": "cloud",
  "stem": "For generic public-cloud study (15/80): which statement aligns best with “provider-managed encryption of data at rest” when discussing security ownership boundaries with emphasis on {focus}?",
  "variables": {
    "focus": [
      "runbook tests",
      "dependency drills",
      "scope control"
    ]
  },
  "correct": "Policies, monitoring, and architecture choices around provider-managed encryption of data at rest should explicitly address security ownership boundaries under a shared-responsibility model. (Emphasis: {focus}.)",
  "distractors": [
    "It guarantees multi-region writes are always strongly consistent.",
    "It means IAM policies replace network segmentation entirely.",
    "It implies object storage cannot enforce per-object access rules."
  ]
}
