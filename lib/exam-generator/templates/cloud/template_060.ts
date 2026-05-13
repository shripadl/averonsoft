import type { TemplateConfig } from '../../template-config'

export const cloudTemplate060: TemplateConfig = {
  "domain": "cloud",
  "stem": "For generic public-cloud study (60/80): which statement aligns best with “bucket policies versus identity policies” when discussing operational monitoring expectations with emphasis on {focus}?",
  "variables": {
    "focus": [
      "design review",
      "tabletop exercise",
      "evidence sampling"
    ]
  },
  "correct": "Policies, monitoring, and architecture choices around bucket policies versus identity policies should explicitly address operational monitoring expectations under a shared-responsibility model. (Emphasis: {focus}.)",
  "distractors": [
    "It means object storage cannot version objects.",
    "It implies compute instances never need patching.",
    "It removes the concept of availability zones."
  ]
}
