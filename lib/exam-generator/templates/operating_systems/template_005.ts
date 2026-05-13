import type { TemplateConfig } from '../../template-config'

export const operatingsystemsTemplate005: TemplateConfig = {
  "domain": "operating_systems",
  "stem": "Operating systems (5/80): which statement best matches system calls as controlled gates when prioritizing security with emphasis on {focus}?",
  "variables": {
    "focus": [
      "segmentation design",
      "patch cadence",
      "credential rotation"
    ]
  },
  "correct": "Kernel design ties system calls as controlled gates to measurable security characteristics for workloads and policies. (Emphasis: {focus}.)",
  "distractors": [
    "It guarantees swap eliminates the need for RAM sizing.",
    "It removes the benefit of cgroup limits for fairness.",
    "It implies page faults are always errors to ignore."
  ]
}
