import type { TemplateConfig } from '../../template-config'

export const legalbcpTemplate035: TemplateConfig = {
  "domain": "legal_bcp",
  "stem": "Legal and continuity study (35/80): which option best reflects BCP versus daily IT operations in the context of testing cadence with emphasis on {focus}?",
  "variables": {
    "focus": [
      "segmentation design",
      "patch cadence",
      "credential rotation"
    ]
  },
  "correct": "Programs should tie BCP versus daily IT operations to clear testing cadence expectations aligned to organizational risk. (Emphasis: {focus}.)",
  "distractors": [
    "It means HIPAA applies only to hardware vendors.",
    "It eliminates GDPR relevance for non-EU customers entirely in every case.",
    "It implies audits should avoid sampling evidence."
  ]
}
