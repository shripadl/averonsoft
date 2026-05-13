import type { TemplateConfig } from '../../template-config'

export const operatingsystemsTemplate050: TemplateConfig = {
  "domain": "operating_systems",
  "stem": "Operating systems (50/80): which statement best matches virtual memory and paging when prioritizing debuggability with emphasis on {focus}?",
  "variables": {
    "focus": [
      "access reviews",
      "encryption coverage",
      "logging retention"
    ]
  },
  "correct": "Kernel design ties virtual memory and paging to measurable debuggability characteristics for workloads and policies. (Emphasis: {focus}.)",
  "distractors": [
    "It means deadlocks cannot occur with a single mutex.",
    "It removes the benefit of copy-on-write after fork.",
    "It implies the kernel never mediates hardware access."
  ]
}
