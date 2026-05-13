import type { TemplateConfig } from '../../template-config'

export const cloudTemplate024: TemplateConfig = {
  "domain": "cloud",
  "stem": "For generic public-cloud study (24/80): which statement aligns best with “regional pairs and failover concepts” when discussing cost drivers for egress and requests?",
  "variables": {},
  "correct": "Policies, monitoring, and architecture choices around regional pairs and failover concepts should explicitly address cost drivers for egress and requests under a shared-responsibility model.",
  "distractors": [
    "It removes the need for any authentication boundary.",
    "It guarantees identical latency on every continent.",
    "It implies unlimited free egress by default."
  ]
}
