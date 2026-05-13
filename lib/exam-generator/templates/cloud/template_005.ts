import type { TemplateConfig } from '../../template-config'

export const cloudTemplate005: TemplateConfig = {
  "domain": "cloud",
  "stem": "For generic public-cloud study (5/80): which statement aligns best with “shared responsibility between provider and tenant” when discussing security ownership boundaries with emphasis on {focus}?",
  "variables": {
    "focus": [
      "segmentation design",
      "patch cadence",
      "credential rotation"
    ]
  },
  "correct": "Policies, monitoring, and architecture choices around shared responsibility between provider and tenant should explicitly address security ownership boundaries under a shared-responsibility model. (Emphasis: {focus}.)",
  "distractors": [
    "It implies compliance is automatic once a bill is paid.",
    "It removes the value of least-privilege for service accounts.",
    "It guarantees identical throughput for every workload shape."
  ]
}
