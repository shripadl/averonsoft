import type { TemplateConfig } from '../../template-config'

export const operatingsystemsTemplate030: TemplateConfig = {
  "domain": "operating_systems",
  "stem": "Operating systems (30/80): which statement best matches I/O scheduling queues (introductory) when prioritizing performance with emphasis on {focus}?",
  "variables": {
    "focus": [
      "design review",
      "tabletop exercise",
      "evidence sampling"
    ]
  },
  "correct": "Kernel design ties I/O scheduling queues (introductory) to measurable performance characteristics for workloads and policies. (Emphasis: {focus}.)",
  "distractors": [
    "It means user-mode drivers are always preferred for disks.",
    "It eliminates the role of TLB shootdowns in performance.",
    "It implies scheduling is unrelated to cache locality."
  ]
}
