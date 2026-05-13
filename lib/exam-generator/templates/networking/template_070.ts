import type { TemplateConfig } from '../../template-config'

export const networkingTemplate070: TemplateConfig = {
  "domain": "networking",
  "stem": "Networking study item (70/80): which option best fits “VLAN segmentation and trunks” in the context of security policy insertion points with emphasis on {focus}?",
  "variables": {
    "focus": [
      "policy attestation",
      "training records",
      "control testing"
    ]
  },
  "correct": "Understanding VLAN segmentation and trunks helps place controls and performance decisions correctly when analyzing security policy insertion points. (Emphasis: {focus}.)",
  "distractors": [
    "It removes the value of ECMP for resilience.",
    "It guarantees Wi-Fi channels never overlap.",
    "It implies ARP resolves hostnames directly."
  ]
}
