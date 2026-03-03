/**
 * Parser for AI structured JSON output.
 * Handles validation, error fallback, and extraction from markdown code blocks.
 */

import type { ParsedAIResponse, ParseError, ParseResult, AIFileAction } from './types'

const ACTION_TYPES = ['create_file', 'update_file', 'modify_file', 'delete_file', 'rename_file', 'multi_file_plan'] as const

function extractJsonFromContent(content: string): string | null {
  const trimmed = content.trim()

  // Try to parse as raw JSON first
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    const jsonStr = jsonMatch[0]
    // Check if it's inside a markdown code block
    const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (codeBlockMatch) {
      return codeBlockMatch[1].trim()
    }
    return jsonStr
  }

  // Extract from markdown code block
  const blockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (blockMatch) {
    return blockMatch[1].trim()
  }

  return null
}

function validateAction(action: unknown): action is AIFileAction {
  if (!action || typeof action !== 'object') return false
  const a = action as Record<string, unknown>
  const act = String(a.action)
  if (!a.action || !(ACTION_TYPES as readonly string[]).includes(act)) return false

  switch (a.action) {
    case 'create_file':
    case 'update_file':
      return typeof a.path === 'string' && typeof a.content === 'string'
    case 'modify_file':
      return typeof a.path === 'string' && typeof a.diff === 'string'
    case 'delete_file':
      return typeof a.path === 'string'
    case 'rename_file':
      return typeof a.path === 'string' && typeof a.newPath === 'string'
    case 'multi_file_plan':
      return Array.isArray(a.plan) && a.plan.every(validateAction)
    default:
      return false
  }
}

function normalizeActions(actions: unknown): AIFileAction[] {
  if (!Array.isArray(actions)) return []

  const result: AIFileAction[] = []
  for (const item of actions) {
    if (validateAction(item)) {
      result.push(item as AIFileAction)
    } else if (item && typeof item === 'object' && (item as Record<string, unknown>).action === 'multi_file_plan') {
      const plan = (item as { plan: unknown[] }).plan
      if (Array.isArray(plan)) {
        result.push(...normalizeActions(plan))
      }
    }
  }
  return result
}

/**
 * Parse AI response content into structured actions.
 * Handles JSON in markdown code blocks, validates, and returns typed result.
 */
export function parseAIResponse(content: string): ParseResult {
  try {
    const jsonStr = extractJsonFromContent(content)
    if (!jsonStr) {
      return {
        success: false,
        error: 'No valid JSON found in response',
        rawContent: content,
        fallback: content,
      } satisfies ParseError
    }

    const parsed = JSON.parse(jsonStr) as Record<string, unknown>

    let actions: AIFileAction[] = []
    if (Array.isArray(parsed.actions)) {
      actions = normalizeActions(parsed.actions)
    } else if (parsed.action === 'multi_file_plan' && Array.isArray(parsed.plan)) {
      actions = normalizeActions(parsed.plan)
    } else if (validateAction(parsed)) {
      actions = [parsed as AIFileAction]
    }

    if (actions.length === 0) {
      return {
        success: false,
        error: 'No valid file actions found in JSON',
        rawContent: content,
        fallback: content,
      } satisfies ParseError
    }

    return {
      success: true,
      actions,
      explanation: typeof parsed.explanation === 'string' ? parsed.explanation : undefined,
    } satisfies ParsedAIResponse
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to parse JSON',
      rawContent: content,
      fallback: content,
    } satisfies ParseError
  }
}

/**
 * Apply a unified diff patch (format: @@ -start,count +start,count @@).
 * If diff doesn't look like a unified patch, treat it as full replacement content.
 */
export function applyDiffPatch(original: string, diff: string): string {
  const trimmed = diff.trim()
  if (!trimmed.includes('@@')) {
    return trimmed
  }

  const lines = original.split('\n')
  const patchLines = diff.split('\n')
  const result: string[] = []
  let lineIndex = 0

  for (let i = 0; i < patchLines.length; i++) {
    const line = patchLines[i]
    const hunkMatch = line.match(/^@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@/)
    if (hunkMatch) {
      const oldStart = Math.max(0, parseInt(hunkMatch[1], 10) - 1)

      while (lineIndex < oldStart && lineIndex < lines.length) {
        result.push(lines[lineIndex])
        lineIndex++
      }

      let j = i + 1
      while (j < patchLines.length) {
        const patchLine = patchLines[j]
        if (patchLine.startsWith('@@')) break
        if (patchLine.startsWith('+') && !patchLine.startsWith('+++')) {
          result.push(patchLine.slice(1))
        } else if (patchLine.startsWith('-') && !patchLine.startsWith('---')) {
          lineIndex++
        } else if (patchLine.startsWith(' ')) {
          result.push(patchLine.slice(1))
          lineIndex++
        }
        j++
      }
      i = j - 1
    }
  }

  while (lineIndex < lines.length) {
    result.push(lines[lineIndex])
    lineIndex++
  }

  return result.join('\n')
}
