import type { TemplateConfig } from '../../template-config'

export const cloudTemplate009: TemplateConfig = {
  "domain": "cloud",
  "stem": "For generic public-cloud study (9/80): which statement aligns best with “object lifecycle and storage classes” when discussing security ownership boundaries?",
  "variables": {},
  "correct": "Policies, monitoring, and architecture choices around object lifecycle and storage classes should explicitly address security ownership boundaries under a shared-responsibility model.",
  "distractors": [
    "It replaces the need for backup copies entirely.",
    "It mandates identical hardware in every rack.",
    "It eliminates monitoring because the provider observes everything."
  ]
}
