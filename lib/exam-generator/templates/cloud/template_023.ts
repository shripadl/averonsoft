import type { TemplateConfig } from '../../template-config'

export const cloudTemplate023: TemplateConfig = {
  "domain": "cloud",
  "stem": "For generic public-cloud study (23/80): which statement aligns best with “multi-tenant resource isolation” when discussing cost drivers for egress and requests?",
  "variables": {},
  "correct": "Policies, monitoring, and architecture choices around multi-tenant resource isolation should explicitly address cost drivers for egress and requests under a shared-responsibility model.",
  "distractors": [
    "It guarantees multi-region writes are always strongly consistent.",
    "It means IAM policies replace network segmentation entirely.",
    "It implies object storage cannot enforce per-object access rules."
  ]
}
