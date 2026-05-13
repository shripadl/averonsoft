import type { TemplateConfig } from '../../template-config'

export const cloudTemplate013: TemplateConfig = {
  "domain": "cloud",
  "stem": "For generic public-cloud study (13/80): which statement aligns best with “instance profiles and temporary credentials” when discussing security ownership boundaries?",
  "variables": {},
  "correct": "Policies, monitoring, and architecture choices around instance profiles and temporary credentials should explicitly address security ownership boundaries under a shared-responsibility model.",
  "distractors": [
    "It implies compliance is automatic once a bill is paid.",
    "It removes the value of least-privilege for service accounts.",
    "It guarantees identical throughput for every workload shape."
  ]
}
