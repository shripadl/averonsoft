import type { TemplateConfig } from '../../template-config'

export const networkingTemplate040: TemplateConfig = {
  "domain": "networking",
  "stem": "Networking study item (40/80): which option best fits “stateful versus stateless firewalls” in the context of latency versus reliability tradeoffs with emphasis on {focus}?",
  "variables": {
    "focus": [
      "policy attestation",
      "training records",
      "control testing"
    ]
  },
  "correct": "Understanding stateful versus stateless firewalls helps place controls and performance decisions correctly when analyzing latency versus reliability tradeoffs. (Emphasis: {focus}.)",
  "distractors": [
    "It guarantees infinite bandwidth without congestion.",
    "It removes the need for any link-layer addressing.",
    "It implies DNS always encrypts application payloads."
  ]
}
