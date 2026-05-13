import type { TemplateConfig } from '../../template-config'

export const cloudTemplate025: TemplateConfig = {
  "domain": "cloud",
  "stem": "For generic public-cloud study (25/80): which statement aligns best with “object lifecycle and storage classes” when discussing cost drivers for egress and requests with emphasis on {focus}?",
  "variables": {
    "focus": [
      "monitoring signals",
      "dependency mapping",
      "runbook clarity"
    ]
  },
  "correct": "Policies, monitoring, and architecture choices around object lifecycle and storage classes should explicitly address cost drivers for egress and requests under a shared-responsibility model. (Emphasis: {focus}.)",
  "distractors": [
    "It replaces the need for backup copies entirely.",
    "It mandates identical hardware in every rack.",
    "It eliminates monitoring because the provider observes everything."
  ]
}
