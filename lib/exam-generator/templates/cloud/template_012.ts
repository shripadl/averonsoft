import type { TemplateConfig } from '../../template-config'

export const cloudTemplate012: TemplateConfig = {
  "domain": "cloud",
  "stem": "For generic public-cloud study (12/80): which statement aligns best with “bucket policies versus identity policies” when discussing security ownership boundaries?",
  "variables": {},
  "correct": "Policies, monitoring, and architecture choices around bucket policies versus identity policies should explicitly address security ownership boundaries under a shared-responsibility model.",
  "distractors": [
    "It means object storage cannot version objects.",
    "It implies compute instances never need patching.",
    "It removes the concept of availability zones."
  ]
}
