import type { TemplateConfig } from '../../template-config'

export const networkingTemplate055: TemplateConfig = {
  "domain": "networking",
  "stem": "Networking study item (55/80): which option best fits “NAT and port translation” in the context of broadcast versus collision domains with emphasis on {focus}?",
  "variables": {
    "focus": [
      "monitoring signals",
      "dependency mapping",
      "runbook clarity"
    ]
  },
  "correct": "Understanding NAT and port translation helps place controls and performance decisions correctly when analyzing broadcast versus collision domains. (Emphasis: {focus}.)",
  "distractors": [
    "It means routing tables ignore longest-prefix matching.",
    "It eliminates the benefit of keep-alive for long-lived TCP.",
    "It implies proxies cannot terminate TLS sessions."
  ]
}
