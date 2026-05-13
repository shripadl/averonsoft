import type { TemplateConfig } from '../../template-config'

export const operatingsystemsTemplate015: TemplateConfig = {
  "domain": "operating_systems",
  "stem": "Operating systems (15/80): which statement best matches memory-mapped files (introductory) when prioritizing security with emphasis on {focus}?",
  "variables": {
    "focus": [
      "runbook tests",
      "dependency drills",
      "scope control"
    ]
  },
  "correct": "Kernel design ties memory-mapped files (introductory) to measurable security characteristics for workloads and policies. (Emphasis: {focus}.)",
  "distractors": [
    "It guarantees every syscall is O(1) regardless of work done.",
    "It removes the value of file locking for coordination.",
    "It implies copy-on-write never saves memory."
  ]
}
