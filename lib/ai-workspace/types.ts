/**
 * Structured AI output types for the coding assistant.
 * All AI responses must return JSON matching these schemas.
 */

export type AIActionType =
  | 'create_file'
  | 'update_file'
  | 'modify_file'
  | 'delete_file'
  | 'rename_file'
  | 'multi_file_plan'

export interface CreateFileAction {
  action: 'create_file'
  path: string
  content: string
  explanation?: string
}

export interface UpdateFileAction {
  action: 'update_file'
  path: string
  content: string
  explanation?: string
}

export interface ModifyFileAction {
  action: 'modify_file'
  path: string
  diff: string
  explanation?: string
}

export interface DeleteFileAction {
  action: 'delete_file'
  path: string
  explanation?: string
}

export interface RenameFileAction {
  action: 'rename_file'
  path: string
  newPath: string
  explanation?: string
}

export interface MultiFilePlanAction {
  action: 'multi_file_plan'
  plan: AIFileAction[]
  explanation?: string
}

export type AIFileAction =
  | CreateFileAction
  | UpdateFileAction
  | ModifyFileAction
  | DeleteFileAction
  | RenameFileAction

export interface AIResponseSchema {
  actions: AIFileAction[]
  explanation?: string
}

export interface ParsedAIResponse {
  success: true
  actions: AIFileAction[]
  explanation?: string
}

export interface ParseError {
  success: false
  error: string
  rawContent?: string
  fallback?: string
}

export type ParseResult = ParsedAIResponse | ParseError

export function isParseSuccess(result: ParseResult): result is ParsedAIResponse {
  return result.success === true
}

export function isParseError(result: ParseResult): result is ParseError {
  return result.success === false
}
