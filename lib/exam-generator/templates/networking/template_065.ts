import type { TemplateConfig } from '../../template-config'

export const networkingTemplate065: TemplateConfig = {
  "domain": "networking",
  "stem": "Networking study item (65/80): which option best fits “OSI layering vocabulary” in the context of security policy insertion points with emphasis on {focus}?",
  "variables": {
    "focus": [
      "segmentation design",
      "patch cadence",
      "credential rotation"
    ]
  },
  "correct": "Understanding OSI layering vocabulary helps place controls and performance decisions correctly when analyzing security policy insertion points. (Emphasis: {focus}.)",
  "distractors": [
    "It means routers learn hostnames instead of prefixes.",
    "It eliminates the need for MTU discovery.",
    "It requires identical MAC addresses on all hosts."
  ]
}
