import type { TemplateConfig } from '../../template-config'

export const cloudTemplate044: TemplateConfig = {
  "domain": "cloud",
  "stem": "For generic public-cloud study (44/80): which statement aligns best with “bucket policies versus identity policies” when discussing availability and fault-isolation assumptions?",
  "variables": {},
  "correct": "Policies, monitoring, and architecture choices around bucket policies versus identity policies should explicitly address availability and fault-isolation assumptions under a shared-responsibility model.",
  "distractors": [
    "It means object storage cannot version objects.",
    "It implies compute instances never need patching.",
    "It removes the concept of availability zones."
  ]
}
