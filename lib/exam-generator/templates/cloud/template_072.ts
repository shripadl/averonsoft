import type { TemplateConfig } from '../../template-config'

export const cloudTemplate072: TemplateConfig = {
  "domain": "cloud",
  "stem": "For generic public-cloud study (72/80): which statement aligns best with “regional pairs and failover concepts” when discussing data durability versus availability tradeoffs?",
  "variables": {},
  "correct": "Policies, monitoring, and architecture choices around regional pairs and failover concepts should explicitly address data durability versus availability tradeoffs under a shared-responsibility model.",
  "distractors": [
    "It removes the need for any authentication boundary.",
    "It guarantees identical latency on every continent.",
    "It implies unlimited free egress by default."
  ]
}
