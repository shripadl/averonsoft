import type { TemplateConfig } from '../../template-config'

export const cloudTemplate069: TemplateConfig = {
  "domain": "cloud",
  "stem": "For generic public-cloud study (69/80): which statement aligns best with “shared responsibility between provider and tenant” when discussing data durability versus availability tradeoffs?",
  "variables": {},
  "correct": "Policies, monitoring, and architecture choices around shared responsibility between provider and tenant should explicitly address data durability versus availability tradeoffs under a shared-responsibility model.",
  "distractors": [
    "It implies compliance is automatic once a bill is paid.",
    "It removes the value of least-privilege for service accounts.",
    "It guarantees identical throughput for every workload shape."
  ]
}
