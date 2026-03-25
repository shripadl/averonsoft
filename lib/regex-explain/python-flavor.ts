export type RegexFlavor = 'javascript' | 'python' | 'pcre'

export function pythonFlagsToJs(pythonFlagLetters: string): string {
  let out = ''
  const s = pythonFlagLetters.toLowerCase()
  if (s.includes('i')) out += 'i'
  if (s.includes('m')) out += 'm'
  if (s.includes('s')) out += 's'
  return out
}

export function describePythonReFlags(pythonFlagLetters: string): string {
  const s = pythonFlagLetters.toLowerCase()
  const parts: string[] = []
  if (s.includes('i')) parts.push('re.IGNORECASE')
  if (s.includes('m')) parts.push('re.MULTILINE')
  if (s.includes('s')) parts.push('re.DOTALL')
  if (s.includes('a')) parts.push('re.ASCII (not emulated in browser preview)')
  if (s.includes('x')) parts.push('re.VERBOSE (not emulated in browser preview)')
  return parts.length ? parts.join('; ') : 'no flags'
}

export const PYTHON_RE_NOTES = [
  'Live match highlighting uses JavaScript’s `RegExp` with equivalent `i` / `m` / `s` flags. `re.ASCII` and `re.VERBOSE` are not fully emulated.',
  'Pattern parsing follows JavaScript rules (same engine as `regexpp`). Most common `re` patterns match; edge cases (e.g. `\\Z`, `(?P<name>)`) may differ.',
  'In Python, prefer raw strings: `r"pattern"` so backslashes are handled as in the explainer.',
] as const
