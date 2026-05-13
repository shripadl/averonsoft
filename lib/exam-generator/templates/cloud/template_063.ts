import type { TemplateConfig } from '../../template-config'

export const cloudTemplate063: TemplateConfig = {
  "domain": "cloud",
  "stem": "For generic public-cloud study (63/80): which statement aligns best with “provider-managed encryption of data at rest” when discussing operational monitoring expectations?",
  "variables": {},
  "correct": "Policies, monitoring, and architecture choices around provider-managed encryption of data at rest should explicitly address operational monitoring expectations under a shared-responsibility model.",
  "distractors": [
    "It guarantees multi-region writes are always strongly consistent.",
    "It means IAM policies replace network segmentation entirely.",
    "It implies object storage cannot enforce per-object access rules."
  ]
}
