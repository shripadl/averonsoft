import type { TemplateConfig } from '../../template-config'

export const operatingsystemsTemplate025: TemplateConfig = {
  "domain": "operating_systems",
  "stem": "Operating systems (25/80): which statement best matches page cache and read performance when prioritizing performance with emphasis on {focus}?",
  "variables": {
    "focus": [
      "monitoring signals",
      "dependency mapping",
      "runbook clarity"
    ]
  },
  "correct": "Kernel design ties page cache and read performance to measurable performance characteristics for workloads and policies. (Emphasis: {focus}.)",
  "distractors": [
    "It guarantees scheduling fairness without any priorities.",
    "It eliminates the need for file permissions.",
    "It implies paging never causes page faults."
  ]
}
