import type { TemplateConfig } from '../../template-config'

export const operatingsystemsTemplate020: TemplateConfig = {
  "domain": "operating_systems",
  "stem": "Operating systems (20/80): which statement best matches kernel versus user mode when prioritizing performance with emphasis on {focus}?",
  "variables": {
    "focus": [
      "access reviews",
      "encryption coverage",
      "logging retention"
    ]
  },
  "correct": "Kernel design ties kernel versus user mode to measurable performance characteristics for workloads and policies. (Emphasis: {focus}.)",
  "distractors": [
    "It means real-time tasks never need priority inversion handling.",
    "It removes the value of journaling file systems.",
    "It implies threads and processes are identical terms."
  ]
}
