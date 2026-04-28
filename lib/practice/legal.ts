const BANNED_PATTERNS = [
  /exam dump/i,
  /brain dump/i,
  /recalled exam/i,
  /real exam question/i,
  /actual exam question/i,
  /leaked question/i,
]

export function validateOriginalPracticeContent(input: string) {
  const content = input.trim()
  if (!content) {
    return { valid: false, reason: 'Content cannot be empty.' }
  }

  for (const pattern of BANNED_PATTERNS) {
    if (pattern.test(content)) {
      return {
        valid: false,
        reason: 'Content violates legal policy. Do not use dump/recalled/real-exam phrasing.',
      }
    }
  }

  return { valid: true as const }
}
