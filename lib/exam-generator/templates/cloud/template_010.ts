import type { TemplateConfig } from '../../template-config'

export const cloudTemplate010: TemplateConfig = {
  "domain": "cloud",
  "stem": "For generic public-cloud study (10/80): which statement aligns best with “edge caching and content delivery” when discussing security ownership boundaries with emphasis on {focus}?",
  "variables": {
    "focus": [
      "policy attestation",
      "training records",
      "control testing"
    ]
  },
  "correct": "Policies, monitoring, and architecture choices around edge caching and content delivery should explicitly address security ownership boundaries under a shared-responsibility model. (Emphasis: {focus}.)",
  "distractors": [
    "It means tenants never share physical hosts.",
    "It removes encryption requirements for data at rest.",
    "It forbids using multiple regions together."
  ]
}
