import type { TemplateConfig } from '../../template-config'

export const cloudTemplate001: TemplateConfig = {
  "domain": "cloud",
  "stem": "For generic public-cloud study (1/80): which statement aligns best with “IAM-style identity policies” when discussing security ownership boundaries?",
  "variables": {},
  "correct": "Policies, monitoring, and architecture choices around IAM-style identity policies should explicitly address security ownership boundaries under a shared-responsibility model.",
  "distractors": [
    "It replaces the need for backup copies entirely.",
    "It mandates identical hardware in every rack.",
    "It eliminates monitoring because the provider observes everything."
  ]
}
