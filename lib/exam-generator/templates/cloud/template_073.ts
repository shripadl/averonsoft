import type { TemplateConfig } from '../../template-config'

export const cloudTemplate073: TemplateConfig = {
  "domain": "cloud",
  "stem": "For generic public-cloud study (73/80): which statement aligns best with “object lifecycle and storage classes” when discussing data durability versus availability tradeoffs?",
  "variables": {},
  "correct": "Policies, monitoring, and architecture choices around object lifecycle and storage classes should explicitly address data durability versus availability tradeoffs under a shared-responsibility model.",
  "distractors": [
    "It replaces the need for backup copies entirely.",
    "It mandates identical hardware in every rack.",
    "It eliminates monitoring because the provider observes everything."
  ]
}
