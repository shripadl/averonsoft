import type { TemplateConfig } from '../../template-config'

export const networkingTemplate010: TemplateConfig = {
  "domain": "networking",
  "stem": "Networking study item (10/80): which option best fits “path MTU and fragmentation” in the context of failure domains with emphasis on {focus}?",
  "variables": {
    "focus": [
      "policy attestation",
      "training records",
      "control testing"
    ]
  },
  "correct": "Understanding path MTU and fragmentation helps place controls and performance decisions correctly when analyzing failure domains. (Emphasis: {focus}.)",
  "distractors": [
    "It implies TCP and UDP are interchangeable for every workload.",
    "It removes the role of ARP on Ethernet segments.",
    "It forbids using VLAN tags on trunks."
  ]
}
