import type { TemplateConfig } from '../../template-config'

export const networkingTemplate005: TemplateConfig = {
  "domain": "networking",
  "stem": "Networking study item (5/80): which option best fits “DNS resolution roles” in the context of failure domains with emphasis on {focus}?",
  "variables": {
    "focus": [
      "segmentation design",
      "patch cadence",
      "credential rotation"
    ]
  },
  "correct": "Understanding DNS resolution roles helps place controls and performance decisions correctly when analyzing failure domains. (Emphasis: {focus}.)",
  "distractors": [
    "It guarantees jitter is irrelevant for VoIP quality.",
    "It means ICMP always carries application payloads.",
    "It implies trunks cannot carry more than one VLAN."
  ]
}
