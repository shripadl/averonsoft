import type { TemplateConfig } from '../../template-config'

export const cloudTemplate037: TemplateConfig = {
  "domain": "cloud",
  "stem": "For generic public-cloud study (37/80): which statement aligns best with “shared responsibility between provider and tenant” when discussing availability and fault-isolation assumptions?",
  "variables": {},
  "correct": "Policies, monitoring, and architecture choices around shared responsibility between provider and tenant should explicitly address availability and fault-isolation assumptions under a shared-responsibility model.",
  "distractors": [
    "It implies compliance is automatic once a bill is paid.",
    "It removes the value of least-privilege for service accounts.",
    "It guarantees identical throughput for every workload shape."
  ]
}
