export function pcreFlagsToJs(pcreFlagLetters: string): string {
  let out = ''
  const s = pcreFlagLetters.toLowerCase()
  if (s.includes('i')) out += 'i'
  if (s.includes('m')) out += 'm'
  if (s.includes('s')) out += 's'
  if (s.includes('u')) out += 'u'
  return out
}

export function describePcreFlags(pcreFlagLetters: string): string {
  const s = pcreFlagLetters.toLowerCase()
  const parts: string[] = []
  if (s.includes('i')) parts.push('PCRE_CASELESS')
  if (s.includes('m')) parts.push('PCRE_MULTILINE')
  if (s.includes('s')) parts.push('PCRE_DOTALL')
  if (s.includes('x')) parts.push('PCRE_EXTENDED (not emulated in browser preview)')
  if (s.includes('u')) parts.push('PCRE_UTF8 / Unicode')
  if (s.includes('a')) parts.push('PCRE_ANCHORED (not emulated)')
  if (s.includes('d')) parts.push('PCRE_DOLLAR_ENDONLY (not emulated)')
  if (s.includes('j')) parts.push('PCRE_INFO_JCHANGED (dup names; not emulated)')
  return parts.length ? parts.join('; ') : 'no flags'
}

export const PCRE_NOTES = [
  'Live preview uses JavaScript `RegExp` with mapped `i` / `m` / `s` / `u` flags. Other PCRE modifiers (e.g. `x`, `U`, `A`) are listed but not fully emulated in the browser.',
  'Pattern parsing uses the JavaScript grammar (`regexpp`). Many PCRE patterns match PHP/PCRE; features like `(?P<name>)`, recursive patterns, or `\\K` may differ or fail to parse.',
  'For authoritative PCRE behavior, validate in your runtime (PHP `preg_*`, etc.).',
] as const
