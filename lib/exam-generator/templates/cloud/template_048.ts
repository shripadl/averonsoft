import type { TemplateConfig } from '../../template-config'

export const cloudTemplate048: TemplateConfig = {
  "domain": "cloud",
  "stem": "For generic public-cloud study (48/80): which statement aligns best with “well-architected reliability pillars (generic)” when discussing availability and fault-isolation assumptions?",
  "variables": {},
  "correct": "Policies, monitoring, and architecture choices around well-architected reliability pillars (generic) should explicitly address availability and fault-isolation assumptions under a shared-responsibility model.",
  "distractors": [
    "It removes the need for any authentication boundary.",
    "It guarantees identical latency on every continent.",
    "It implies unlimited free egress by default."
  ]
}
