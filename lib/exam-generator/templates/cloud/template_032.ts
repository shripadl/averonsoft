import type { TemplateConfig } from '../../template-config'

export const cloudTemplate032: TemplateConfig = {
  "domain": "cloud",
  "stem": "For generic public-cloud study (32/80): which statement aligns best with “well-architected reliability pillars (generic)” when discussing cost drivers for egress and requests?",
  "variables": {},
  "correct": "Policies, monitoring, and architecture choices around well-architected reliability pillars (generic) should explicitly address cost drivers for egress and requests under a shared-responsibility model.",
  "distractors": [
    "It removes the need for any authentication boundary.",
    "It guarantees identical latency on every continent.",
    "It implies unlimited free egress by default."
  ]
}
