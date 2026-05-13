import type { TemplateConfig } from '../../template-config'

export const operatingsystemsTemplate035: TemplateConfig = {
  "domain": "operating_systems",
  "stem": "Operating systems (35/80): which statement best matches CPU scheduling goals when prioritizing reliability with emphasis on {focus}?",
  "variables": {
    "focus": [
      "segmentation design",
      "patch cadence",
      "credential rotation"
    ]
  },
  "correct": "Kernel design ties CPU scheduling goals to measurable reliability characteristics for workloads and policies. (Emphasis: {focus}.)",
  "distractors": [
    "It guarantees every process has identical virtual mappings.",
    "It eliminates the role of inode metadata.",
    "It implies swap space is unrelated to performance."
  ]
}
