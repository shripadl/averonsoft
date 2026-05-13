import type { TemplateConfig } from '../../template-config'

export const networkingTemplate015: TemplateConfig = {
  "domain": "networking",
  "stem": "Networking study item (15/80): which option best fits “reverse proxies and TLS termination” in the context of failure domains with emphasis on {focus}?",
  "variables": {
    "focus": [
      "runbook tests",
      "dependency drills",
      "scope control"
    ]
  },
  "correct": "Understanding reverse proxies and TLS termination helps place controls and performance decisions correctly when analyzing failure domains. (Emphasis: {focus}.)",
  "distractors": [
    "It means routing tables ignore longest-prefix matching.",
    "It eliminates the benefit of keep-alive for long-lived TCP.",
    "It implies proxies cannot terminate TLS sessions."
  ]
}
