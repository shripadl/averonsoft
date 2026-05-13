import type { TemplateConfig } from '../../template-config'

export const cloudTemplate047: TemplateConfig = {
  "domain": "cloud",
  "stem": "For generic public-cloud study (47/80): which statement aligns best with “provider-managed encryption of data at rest” when discussing availability and fault-isolation assumptions?",
  "variables": {},
  "correct": "Policies, monitoring, and architecture choices around provider-managed encryption of data at rest should explicitly address availability and fault-isolation assumptions under a shared-responsibility model.",
  "distractors": [
    "It guarantees multi-region writes are always strongly consistent.",
    "It means IAM policies replace network segmentation entirely.",
    "It implies object storage cannot enforce per-object access rules."
  ]
}
