import type { TemplateConfig } from '../../template-config'

export const operatingsystemsTemplate010: TemplateConfig = {
  "domain": "operating_systems",
  "stem": "Operating systems (10/80): which statement best matches thrashing and memory pressure when prioritizing security with emphasis on {focus}?",
  "variables": {
    "focus": [
      "policy attestation",
      "training records",
      "control testing"
    ]
  },
  "correct": "Kernel design ties thrashing and memory pressure to measurable security characteristics for workloads and policies. (Emphasis: {focus}.)",
  "distractors": [
    "It means deadlocks cannot occur with a single mutex.",
    "It removes the benefit of copy-on-write after fork.",
    "It implies the kernel never mediates hardware access."
  ]
}
