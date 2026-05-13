import type { TemplateConfig } from '../../template-config'

export const cloudTemplate080: TemplateConfig = {
  "domain": "cloud",
  "stem": "For generic public-cloud study (80/80): which statement aligns best with “well-architected reliability pillars (generic)” when discussing data durability versus availability tradeoffs with emphasis on {focus}?",
  "variables": {
    "focus": [
      "access reviews",
      "encryption coverage",
      "logging retention"
    ]
  },
  "correct": "Policies, monitoring, and architecture choices around well-architected reliability pillars (generic) should explicitly address data durability versus availability tradeoffs under a shared-responsibility model. (Emphasis: {focus}.)",
  "distractors": [
    "It removes the need for any authentication boundary.",
    "It guarantees identical latency on every continent.",
    "It implies unlimited free egress by default."
  ]
}
