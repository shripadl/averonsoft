import type { TemplateConfig } from '../../template-config'

export const networkingTemplate020: TemplateConfig = {
  "domain": "networking",
  "stem": "Networking study item (20/80): which option best fits “default gateways and default routes” in the context of header fields versus payload with emphasis on {focus}?",
  "variables": {
    "focus": [
      "access reviews",
      "encryption coverage",
      "logging retention"
    ]
  },
  "correct": "Understanding default gateways and default routes helps place controls and performance decisions correctly when analyzing header fields versus payload. (Emphasis: {focus}.)",
  "distractors": [
    "It implies firewalls only operate at the physical layer.",
    "It means subnet masks are optional on IPv4 links.",
    "It removes the need for default gateways."
  ]
}
