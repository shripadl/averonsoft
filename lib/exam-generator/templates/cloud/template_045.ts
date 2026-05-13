import type { TemplateConfig } from '../../template-config'

export const cloudTemplate045: TemplateConfig = {
  "domain": "cloud",
  "stem": "For generic public-cloud study (45/80): which statement aligns best with “instance profiles and temporary credentials” when discussing availability and fault-isolation assumptions with emphasis on {focus}?",
  "variables": {
    "focus": [
      "runbook tests",
      "dependency drills",
      "scope control"
    ]
  },
  "correct": "Policies, monitoring, and architecture choices around instance profiles and temporary credentials should explicitly address availability and fault-isolation assumptions under a shared-responsibility model. (Emphasis: {focus}.)",
  "distractors": [
    "It implies compliance is automatic once a bill is paid.",
    "It removes the value of least-privilege for service accounts.",
    "It guarantees identical throughput for every workload shape."
  ]
}
