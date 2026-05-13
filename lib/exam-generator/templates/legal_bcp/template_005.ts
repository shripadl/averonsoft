import type { TemplateConfig } from '../../template-config'

export const legalbcpTemplate005: TemplateConfig = {
  "domain": "legal_bcp",
  "stem": "Legal and continuity study (5/80): which option best reflects RTO definitions in the context of documentation with emphasis on {focus}?",
  "variables": {
    "focus": [
      "segmentation design",
      "patch cadence",
      "credential rotation"
    ]
  },
  "correct": "Programs should tie RTO definitions to clear documentation expectations aligned to organizational risk. (Emphasis: {focus}.)",
  "distractors": [
    "It means DPIAs are optional for all high-risk processing.",
    "It eliminates the value of tabletop exercises for DRP.",
    "It implies RPO can be set without referencing data loss tolerance."
  ]
}
