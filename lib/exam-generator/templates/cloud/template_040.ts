import type { TemplateConfig } from '../../template-config'

export const cloudTemplate040: TemplateConfig = {
  "domain": "cloud",
  "stem": "For generic public-cloud study (40/80): which statement aligns best with “regional pairs and failover concepts” when discussing availability and fault-isolation assumptions with emphasis on {focus}?",
  "variables": {
    "focus": [
      "policy attestation",
      "training records",
      "control testing"
    ]
  },
  "correct": "Policies, monitoring, and architecture choices around regional pairs and failover concepts should explicitly address availability and fault-isolation assumptions under a shared-responsibility model. (Emphasis: {focus}.)",
  "distractors": [
    "It removes the need for any authentication boundary.",
    "It guarantees identical latency on every continent.",
    "It implies unlimited free egress by default."
  ]
}
