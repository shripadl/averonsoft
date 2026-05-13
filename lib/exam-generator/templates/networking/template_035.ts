import type { TemplateConfig } from '../../template-config'

export const networkingTemplate035: TemplateConfig = {
  "domain": "networking",
  "stem": "Networking study item (35/80): which option best fits “IPv4 subnetting and CIDR” in the context of latency versus reliability tradeoffs with emphasis on {focus}?",
  "variables": {
    "focus": [
      "segmentation design",
      "patch cadence",
      "credential rotation"
    ]
  },
  "correct": "Understanding IPv4 subnetting and CIDR helps place controls and performance decisions correctly when analyzing latency versus reliability tradeoffs. (Emphasis: {focus}.)",
  "distractors": [
    "It guarantees wireless links never experience interference.",
    "It means NAT preserves end-to-end transport semantics always.",
    "It removes the value of path MTU discovery."
  ]
}
