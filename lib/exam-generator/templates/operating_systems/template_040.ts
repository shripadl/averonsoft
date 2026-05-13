import type { TemplateConfig } from '../../template-config'

export const operatingsystemsTemplate040: TemplateConfig = {
  "domain": "operating_systems",
  "stem": "Operating systems (40/80): which statement best matches copy-on-write after fork when prioritizing reliability with emphasis on {focus}?",
  "variables": {
    "focus": [
      "policy attestation",
      "training records",
      "control testing"
    ]
  },
  "correct": "Kernel design ties copy-on-write after fork to measurable reliability characteristics for workloads and policies. (Emphasis: {focus}.)",
  "distractors": [
    "It means threads never share an address space.",
    "It removes the distinction between kernel and user mode.",
    "It implies virtual memory cannot overcommit physical RAM."
  ]
}
