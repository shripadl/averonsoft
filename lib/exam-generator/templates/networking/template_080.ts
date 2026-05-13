import type { TemplateConfig } from '../../template-config'

export const networkingTemplate080: TemplateConfig = {
  "domain": "networking",
  "stem": "Networking study item (80/80): which option best fits “SYN flood handling concepts” in the context of security policy insertion points with emphasis on {focus}?",
  "variables": {
    "focus": [
      "access reviews",
      "encryption coverage",
      "logging retention"
    ]
  },
  "correct": "Understanding SYN flood handling concepts helps place controls and performance decisions correctly when analyzing security policy insertion points. (Emphasis: {focus}.)",
  "distractors": [
    "It guarantees infinite bandwidth without congestion.",
    "It removes the need for any link-layer addressing.",
    "It implies DNS always encrypts application payloads."
  ]
}
