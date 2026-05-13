import type { TemplateConfig } from '../../template-config'

export const cloudTemplate007: TemplateConfig = {
  "domain": "cloud",
  "stem": "For generic public-cloud study (7/80): which statement aligns best with “multi-tenant resource isolation” when discussing security ownership boundaries?",
  "variables": {},
  "correct": "Policies, monitoring, and architecture choices around multi-tenant resource isolation should explicitly address security ownership boundaries under a shared-responsibility model.",
  "distractors": [
    "It guarantees multi-region writes are always strongly consistent.",
    "It means IAM policies replace network segmentation entirely.",
    "It implies object storage cannot enforce per-object access rules."
  ]
}
