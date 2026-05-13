import type { TemplateConfig } from '../../template-config'

export const networkingTemplate025: TemplateConfig = {
  "domain": "networking",
  "stem": "Networking study item (25/80): which option best fits “ARP on Ethernet segments” in the context of header fields versus payload with emphasis on {focus}?",
  "variables": {
    "focus": [
      "monitoring signals",
      "dependency mapping",
      "runbook clarity"
    ]
  },
  "correct": "Understanding ARP on Ethernet segments helps place controls and performance decisions correctly when analyzing header fields versus payload. (Emphasis: {focus}.)",
  "distractors": [
    "It means routers learn hostnames instead of prefixes.",
    "It eliminates the need for MTU discovery.",
    "It requires identical MAC addresses on all hosts."
  ]
}
