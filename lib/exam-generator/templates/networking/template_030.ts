import type { TemplateConfig } from '../../template-config'

export const networkingTemplate030: TemplateConfig = {
  "domain": "networking",
  "stem": "Networking study item (30/80): which option best fits “link aggregation for bandwidth/redundancy” in the context of header fields versus payload with emphasis on {focus}?",
  "variables": {
    "focus": [
      "design review",
      "tabletop exercise",
      "evidence sampling"
    ]
  },
  "correct": "Understanding link aggregation for bandwidth/redundancy helps place controls and performance decisions correctly when analyzing header fields versus payload. (Emphasis: {focus}.)",
  "distractors": [
    "It removes the value of ECMP for resilience.",
    "It guarantees Wi-Fi channels never overlap.",
    "It implies ARP resolves hostnames directly."
  ]
}
