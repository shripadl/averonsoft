import type { TemplateConfig } from '../../template-config'

export const operatingsystemsTemplate065: TemplateConfig = {
  "domain": "operating_systems",
  "stem": "Operating systems (65/80): which statement best matches process versus thread models when prioritizing capacity planning signals with emphasis on {focus}?",
  "variables": {
    "focus": [
      "segmentation design",
      "patch cadence",
      "credential rotation"
    ]
  },
  "correct": "Kernel design ties process versus thread models to measurable capacity planning signals characteristics for workloads and policies. (Emphasis: {focus}.)",
  "distractors": [
    "It guarantees scheduling fairness without any priorities.",
    "It eliminates the need for file permissions.",
    "It implies paging never causes page faults."
  ]
}
