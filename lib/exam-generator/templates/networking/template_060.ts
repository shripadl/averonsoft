import type { TemplateConfig } from '../../template-config'

export const networkingTemplate060: TemplateConfig = {
  "domain": "networking",
  "stem": "Networking study item (60/80): which option best fits “BGP at a high level between autonomous systems” in the context of broadcast versus collision domains with emphasis on {focus}?",
  "variables": {
    "focus": [
      "design review",
      "tabletop exercise",
      "evidence sampling"
    ]
  },
  "correct": "Understanding BGP at a high level between autonomous systems helps place controls and performance decisions correctly when analyzing broadcast versus collision domains. (Emphasis: {focus}.)",
  "distractors": [
    "It implies firewalls only operate at the physical layer.",
    "It means subnet masks are optional on IPv4 links.",
    "It removes the need for default gateways."
  ]
}
