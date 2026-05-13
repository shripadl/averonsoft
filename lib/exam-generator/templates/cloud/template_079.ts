import type { TemplateConfig } from '../../template-config'

export const cloudTemplate079: TemplateConfig = {
  "domain": "cloud",
  "stem": "For generic public-cloud study (79/80): which statement aligns best with “provider-managed encryption of data at rest” when discussing data durability versus availability tradeoffs?",
  "variables": {},
  "correct": "Policies, monitoring, and architecture choices around provider-managed encryption of data at rest should explicitly address data durability versus availability tradeoffs under a shared-responsibility model.",
  "distractors": [
    "It guarantees multi-region writes are always strongly consistent.",
    "It means IAM policies replace network segmentation entirely.",
    "It implies object storage cannot enforce per-object access rules."
  ]
}
