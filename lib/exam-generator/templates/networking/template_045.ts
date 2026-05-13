import type { TemplateConfig } from '../../template-config'

export const networkingTemplate045: TemplateConfig = {
  "domain": "networking",
  "stem": "Networking study item (45/80): which option best fits “OSPF area concepts (introductory)” in the context of latency versus reliability tradeoffs with emphasis on {focus}?",
  "variables": {
    "focus": [
      "runbook tests",
      "dependency drills",
      "scope control"
    ]
  },
  "correct": "Understanding OSPF area concepts (introductory) helps place controls and performance decisions correctly when analyzing latency versus reliability tradeoffs. (Emphasis: {focus}.)",
  "distractors": [
    "It guarantees jitter is irrelevant for VoIP quality.",
    "It means ICMP always carries application payloads.",
    "It implies trunks cannot carry more than one VLAN."
  ]
}
