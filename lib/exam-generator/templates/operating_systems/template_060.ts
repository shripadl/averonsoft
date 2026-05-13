import type { TemplateConfig } from '../../template-config'

export const operatingsystemsTemplate060: TemplateConfig = {
  "domain": "operating_systems",
  "stem": "Operating systems (60/80): which statement best matches namespaces and isolation (generic) when prioritizing debuggability with emphasis on {focus}?",
  "variables": {
    "focus": [
      "design review",
      "tabletop exercise",
      "evidence sampling"
    ]
  },
  "correct": "Kernel design ties namespaces and isolation (generic) to measurable debuggability characteristics for workloads and policies. (Emphasis: {focus}.)",
  "distractors": [
    "It means real-time tasks never need priority inversion handling.",
    "It removes the value of journaling file systems.",
    "It implies threads and processes are identical terms."
  ]
}
