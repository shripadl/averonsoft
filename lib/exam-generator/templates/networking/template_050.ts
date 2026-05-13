import type { TemplateConfig } from '../../template-config'

export const networkingTemplate050: TemplateConfig = {
  "domain": "networking",
  "stem": "Networking study item (50/80): which option best fits “TCP versus UDP semantics” in the context of broadcast versus collision domains with emphasis on {focus}?",
  "variables": {
    "focus": [
      "access reviews",
      "encryption coverage",
      "logging retention"
    ]
  },
  "correct": "Understanding TCP versus UDP semantics helps place controls and performance decisions correctly when analyzing broadcast versus collision domains. (Emphasis: {focus}.)",
  "distractors": [
    "It implies TCP and UDP are interchangeable for every workload.",
    "It removes the role of ARP on Ethernet segments.",
    "It forbids using VLAN tags on trunks."
  ]
}
