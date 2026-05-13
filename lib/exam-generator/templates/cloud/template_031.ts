import type { TemplateConfig } from '../../template-config'

export const cloudTemplate031: TemplateConfig = {
  "domain": "cloud",
  "stem": "For generic public-cloud study (31/80): which statement aligns best with “provider-managed encryption of data at rest” when discussing cost drivers for egress and requests?",
  "variables": {},
  "correct": "Policies, monitoring, and architecture choices around provider-managed encryption of data at rest should explicitly address cost drivers for egress and requests under a shared-responsibility model.",
  "distractors": [
    "It guarantees multi-region writes are always strongly consistent.",
    "It means IAM policies replace network segmentation entirely.",
    "It implies object storage cannot enforce per-object access rules."
  ]
}
