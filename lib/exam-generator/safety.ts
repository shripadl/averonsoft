/**
 * Deterministic safety filters: block sensitive topics, vendor-cert trivia,
 * and trademark-heavy phrasing. Does not call external services.
 */

const BLOCKED_TOPIC_PATTERNS: RegExp[] = [
  /\b(make\s+bomb|terrorism|suicide|self[-\s]?harm)\b/i,
  /\b(how\s+to\s+hack|ddos\s+attack\s+tutorial|ransomware\s+kit)\b/i,
  /\b(prescription\s+dosage|diagnos(e|is)\s+your|medical\s+advice)\b/i,
]

const BLOCKED_CONTENT_PATTERNS: RegExp[] = [
  // Vendor names OK for generic study; block dump / marketing exam phrasing only.
  /\b(Amazon\s+Web\s+Services|Google\s+Cloud\s+Platform|past\s+paper\s+from|official\s+certification\s+dump)\b/i,
  /\b(SAA-C0\d|CLF-C0\d|AZ-900\s+exam\s+dump|past\s+paper\s+from)\b/i,
  /\b(vote\s+for|campaign\s+platform|political\s+party)\b/i,
  /\b(CISSP\s+exam\s+dump|official\s+SAT\s+questions?|proprietary\s+exam\s+bank)\b/i,
]

const SENSITIVE_MEDICAL: RegExp[] = [
  /\b(prescribe|dosage\s+mg|clinical\s+trial\s+data|patient\s+identifiable)\b/i,
]

export interface SafetyResult {
  ok: boolean
  reason?: string
}

export function validateTopic(topic: string): SafetyResult {
  const t = topic.trim()
  if (t.length === 0) return { ok: false, reason: 'Topic is required.' }
  if (t.length > 200) return { ok: false, reason: 'Topic is too long.' }
  for (const re of BLOCKED_TOPIC_PATTERNS) {
    if (re.test(t)) return { ok: false, reason: 'This topic cannot be used.' }
  }
  return { ok: true }
}

export function isGeneratedTextSafe(text: string): SafetyResult {
  for (const re of [...BLOCKED_CONTENT_PATTERNS, ...SENSITIVE_MEDICAL]) {
    if (re.test(text)) return { ok: false, reason: 'Generated item was filtered.' }
  }
  return { ok: true }
}

export function sanitizeTemplateForLibrary(template: QuestionTemplateInput): boolean {
  const blob = `${template.stem}\n${template.correctTemplate}\n${template.distractors.join('\n')}`
  return isGeneratedTextSafe(blob).ok
}

/** Minimal shape for pre-publish checks in template authoring */
export interface QuestionTemplateInput {
  stem: string
  correctTemplate: string
  distractors: string[]
}
