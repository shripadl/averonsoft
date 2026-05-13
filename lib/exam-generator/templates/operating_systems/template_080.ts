import type { TemplateConfig } from '../../template-config'

export const operatingsystemsTemplate080: TemplateConfig = {
  "domain": "operating_systems",
  "stem": "Operating systems (80/80): which statement best matches hardware abstraction and drivers (introductory) when prioritizing capacity planning signals with emphasis on {focus}?",
  "variables": {
    "focus": [
      "access reviews",
      "encryption coverage",
      "logging retention"
    ]
  },
  "correct": "Kernel design ties hardware abstraction and drivers (introductory) to measurable capacity planning signals characteristics for workloads and policies. (Emphasis: {focus}.)",
  "distractors": [
    "It means threads never share an address space.",
    "It removes the distinction between kernel and user mode.",
    "It implies virtual memory cannot overcommit physical RAM."
  ]
}
