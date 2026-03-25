import { RegExpParser } from 'regexpp'
import type * as AST from 'regexpp/ast'

export interface ExplainLine {
  raw: string
  text: string
}

export interface ExplainResult {
  ok: true
  flagsSummary: string
  lines: ExplainLine[]
}

export interface ExplainError {
  ok: false
  message: string
}

function charPhrase(code: number): string {
  const ch = String.fromCodePoint(code)
  const map: Record<string, string> = {
    '\n': 'a newline',
    '\r': 'a carriage return',
    '\t': 'a tab',
    ' ': 'a space',
  }
  if (map[ch]) return map[ch]!
  if (code < 32 || code === 127) return `Unicode code point U+${code.toString(16).toUpperCase().padStart(4, '0')}`
  if (ch === '"' || ch === "'") return `the character ${ch}`
  return `the character "${ch}"`
}

function quantPhrase(min: number, max: number, greedy: boolean): string {
  const lazy = greedy ? '' : ' (lazy)'
  if (min === 0 && max === 1) return `optional${lazy}`
  if (min === 0 && max === Infinity) return `repeated zero or more times${lazy}`
  if (min === 1 && max === Infinity) return `repeated one or more times${lazy}`
  if (min === max) return `repeated exactly ${min} time${min === 1 ? '' : 's'}${lazy}`
  return `repeated between ${min} and ${max === Infinity ? '∞' : max} times${lazy}`
}

function escapeSetPhrase(node: AST.EscapeCharacterSet): string {
  const { kind, negate } = node
  const n = negate ? 'non-' : ''
  if (kind === 'digit') return `${n}digit character (0–9)`
  if (kind === 'word') return `${n}word character (letter, digit, or _)`
  return `${n}whitespace character`
}

function unicodePropPhrase(node: AST.UnicodePropertyCharacterSet): string {
  const { key, value, negate } = node
  const neg = negate ? 'not ' : ''
  if (value) return `${neg}Unicode property \\p{${key}=${value}}`
  return `${neg}Unicode property \\p{${key}}`
}

function classElementPhrase(el: AST.CharacterClassElement): string {
  if (el.type === 'CharacterClassRange') {
    return `characters from ${charPhrase(el.min.value)} to ${charPhrase(el.max.value)}`
  }
  if (el.type === 'Character') {
    return charPhrase(el.value)
  }
  if (el.type === 'CharacterSet' && el.kind === 'property') {
    return unicodePropPhrase(el as AST.UnicodePropertyCharacterSet)
  }
  if (el.type === 'CharacterSet') {
    return escapeSetPhrase(el as AST.EscapeCharacterSet)
  }
  return 'element'
}

function characterClassPhrase(node: AST.CharacterClass): string {
  const parts = node.elements.map(classElementPhrase)
  const inner = parts.join(', ')
  if (node.negate) {
    return `any single character that is not one of: ${inner}`
  }
  return `one character from: ${inner}`
}

function boundaryPhrase(node: AST.BoundaryAssertion): string {
  if (node.kind === 'start') return 'start of string (or line in multiline mode)'
  if (node.kind === 'end') return 'end of string (or line in multiline mode)'
  const wb = node as AST.WordBoundaryAssertion
  return wb.negate ? 'position not at a word boundary' : 'a word boundary'
}

function explainQuantifiable(node: AST.QuantifiableElement): string {
  switch (node.type) {
    case 'Character':
      return `Match ${charPhrase(node.value)}.`
    case 'CharacterSet':
      if (node.kind === 'any') {
        return 'Match any single character (line terminators only match when the `s` / dotAll flag is on).'
      }
      if (node.kind === 'property') {
        return `Match ${unicodePropPhrase(node as AST.UnicodePropertyCharacterSet)}.`
      }
      return `Match ${escapeSetPhrase(node as AST.EscapeCharacterSet)}.`
    case 'CharacterClass':
      return `Match ${characterClassPhrase(node)}.`
    case 'Group':
      return explainGroup(node, false)
    case 'CapturingGroup':
      return explainGroup(node, true)
    case 'Backreference': {
      const ref = typeof node.ref === 'number' ? `group ${node.ref}` : `group "${node.ref}"`
      return `Match the same text as ${ref}.`
    }
    default:
      return 'Match (unsupported construct in this explainer).'
  }
}

function explainGroup(node: AST.Group | AST.CapturingGroup, capturing: boolean): string {
  const alts = node.alternatives
  if (alts.length === 1) {
    const inner = explainAlternative(alts[0]!)
    const cap =
      capturing &&
      node.type === 'CapturingGroup' &&
      (node as AST.CapturingGroup).name
        ? ` (named "${(node as AST.CapturingGroup).name}")`
        : capturing
          ? ' (capturing)'
          : ' (non-capturing)'
    return `Match${cap}: ${inner}`
  }
  const parts = alts.map((a, i) => `(${i + 1}) ${explainAlternative(a)}`)
  return `Match one of: ${parts.join(' OR ')}`
}

function explainAssertion(node: AST.Assertion): string {
  if (node.kind === 'lookahead' || node.kind === 'lookbehind') {
    const dir = node.kind === 'lookahead' ? 'ahead' : 'behind'
    const neg = node.negate ? 'not ' : ''
    const inner = node.alternatives.map((a) => explainAlternative(a)).join(' OR ')
    return `Assert ${neg}looking${dir}: ${inner}`
  }
  return boundaryPhrase(node as AST.BoundaryAssertion)
}

function explainElement(el: AST.Element): string {
  if (el.type === 'Quantifier') {
    const inner = explainQuantifiable(el.element)
    const q = quantPhrase(el.min, el.max, el.greedy)
    const base = inner.replace(/\.$/, '')
    return `${base}, ${q}.`
  }
  if (el.type === 'Assertion') {
    return explainAssertion(el)
  }
  return explainQuantifiable(el as AST.QuantifiableElement)
}

function explainAlternative(alt: AST.Alternative): string {
  if (alt.elements.length === 0) return 'empty (matches empty string)'
  return alt.elements.map(explainElement).join(' Then ')
}

function flagsSummary(flags: AST.Flags): string {
  const parts: string[] = []
  if (flags.global) parts.push('g (find all matches)')
  if (flags.ignoreCase) parts.push('i (ignore case)')
  if (flags.multiline) parts.push('m (^ and $ match line breaks)')
  if (flags.dotAll) parts.push('s (. matches newlines)')
  if (flags.unicode) parts.push('u (Unicode mode)')
  if (flags.sticky) parts.push('y (sticky)')
  if (flags.hasIndices) parts.push('d (indices for submatches)')
  return parts.length ? parts.join('; ') : 'no flags'
}

function patternLines(pattern: AST.Pattern): ExplainLine[] {
  const lines: ExplainLine[] = []
  for (const alt of pattern.alternatives) {
    lines.push({
      raw: alt.raw,
      text: explainAlternative(alt),
    })
  }
  return lines
}

export function explainRegex(patternSource: string, flagsStr: string): ExplainResult | ExplainError {
  const parser = new RegExpParser({ ecmaVersion: 2022 })
  try {
    const flags = parser.parseFlags(flagsStr, 0, flagsStr.length)
    const u = flags.unicode
    const pattern = parser.parsePattern(patternSource, 0, patternSource.length, u)
    const lines = patternLines(pattern)
    return {
      ok: true,
      flagsSummary: flagsSummary(flags),
      lines,
    }
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : 'Invalid regular expression',
    }
  }
}

export function tryBuildRegExp(patternSource: string, flagsStr: string): RegExp | null {
  try {
    return new RegExp(patternSource, flagsStr)
  } catch {
    return null
  }
}
