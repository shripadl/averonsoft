import type { TemplateConfig } from '../../template-config'

export const cloudTemplate016: TemplateConfig = {
  "domain": "cloud",
  "stem": "For generic public-cloud study (16/80): which statement aligns best with “well-architected reliability pillars (generic)” when discussing security ownership boundaries?",
  "variables": {},
  "correct": "Policies, monitoring, and architecture choices around well-architected reliability pillars (generic) should explicitly address security ownership boundaries under a shared-responsibility model.",
  "distractors": [
    "It removes the need for any authentication boundary.",
    "It guarantees identical latency on every continent.",
    "It implies unlimited free egress by default."
  ]
}
