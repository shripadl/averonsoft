export interface MatchSegment {
  text: string
  match: boolean
}

export function highlightMatches(test: string, re: RegExp): MatchSegment[] {
  if (test.length === 0) return []

  const segments: MatchSegment[] = []

  if (!re.global) {
    const m = re.exec(test)
    re.lastIndex = 0
    if (!m) {
      return [{ text: test, match: false }]
    }
    const idx = m.index
    if (idx > 0) segments.push({ text: test.slice(0, idx), match: false })
    segments.push({ text: m[0]!, match: true })
    const end = idx + m[0]!.length
    if (end < test.length) segments.push({ text: test.slice(end), match: false })
    return segments
  }

  const g = re
  let last = 0
  for (const m of test.matchAll(g)) {
    const idx = m.index ?? 0
    if (idx > last) {
      segments.push({ text: test.slice(last, idx), match: false })
    }
    segments.push({ text: m[0]!, match: true })
    last = idx + m[0]!.length
  }
  if (last < test.length) {
    segments.push({ text: test.slice(last), match: false })
  }
  return segments
}
