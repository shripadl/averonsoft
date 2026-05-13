import type { TemplateConfig } from '../../template-config'

export const cloudTemplate076: TemplateConfig = {
  "domain": "cloud",
  "stem": "For generic public-cloud study (76/80): which statement aligns best with “bucket policies versus identity policies” when discussing data durability versus availability tradeoffs?",
  "variables": {},
  "correct": "Policies, monitoring, and architecture choices around bucket policies versus identity policies should explicitly address data durability versus availability tradeoffs under a shared-responsibility model.",
  "distractors": [
    "It means object storage cannot version objects.",
    "It implies compute instances never need patching.",
    "It removes the concept of availability zones."
  ]
}
