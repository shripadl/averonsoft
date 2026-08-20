import { createServiceClient } from '@/lib/supabase/server'
import {
  TOOL_CONFIG,
  TOOL_KEYS,
  type ToolConfig,
  type ToolKey,
} from '@/lib/tool-config'

export {
  TOOL_CONFIG,
  TOOL_KEYS,
  type ToolConfig,
  type ToolKey,
} from '@/lib/tool-config'

export interface ToolSettings {
  enabled: boolean
  visible: boolean
  maintenance: boolean
  beta: boolean
}

export interface AllToolSettings {
  [key: string]: ToolSettings
}

function parseBool(val: unknown): boolean {
  if (val === true || val === 'true') return true
  if (typeof val === 'string' && val.startsWith('"')) {
    try {
      return JSON.parse(val) === true
    } catch {
      return false
    }
  }
  return false
}

const TOOL_SETTING_KEYS = TOOL_KEYS.flatMap(k => [
  `tool_${k}_enabled`,
  `tool_${k}_visible`,
  `${k}_maintenance`,
  `tool_${k}_beta`,
])
const SPORTS_HISTORY_PUBLIC_VISIBLE_KEY = 'sports_history_public_visible'
export const RESUME_WORD_EXPORT_PUBLIC_KEY = 'resume_word_export_public'
export const RESUME_AI_PUBLIC_KEY = 'resume_ai_public'

/** Tools off until explicitly enabled in admin (no live data / WIP). */
const DEFAULT_OFF_TOOLS = new Set<ToolKey>(['satbara'])

function defaultEnabled(key: ToolKey): boolean {
  return !DEFAULT_OFF_TOOLS.has(key)
}

/** Fetch all tool settings from admin_settings. Uses service client to bypass RLS. */
export async function getToolSettings(): Promise<AllToolSettings> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('admin_settings')
    .select('key, value')
    .in('key', TOOL_SETTING_KEYS)

  if (error) {
    console.error('Failed to fetch tool settings:', error)
    return {}
  }

  const map = new Map<string, unknown>()
  for (const row of data || []) {
    map.set(row.key, row.value)
  }

  const result: AllToolSettings = {}
  for (const key of TOOL_KEYS) {
    const en = map.get(`tool_${key}_enabled`)
    const vis = map.get(`tool_${key}_visible`)
    const fallback = defaultEnabled(key)
    result[key] = {
      enabled: en == null ? fallback : parseBool(en),
      visible: vis == null ? fallback : parseBool(vis),
      maintenance: parseBool(map.get(`${key}_maintenance`)) ?? false,
      beta: parseBool(map.get(`tool_${key}_beta`)) ?? false,
    }
  }
  return result
}

/** Get tools that are both enabled and visible (for nav, dashboard, footer) */
export function getVisibleTools(settings: AllToolSettings): ToolConfig[] {
  return TOOL_CONFIG.filter(
    t => settings[t.key]?.enabled !== false && settings[t.key]?.visible !== false
  )
}

/** Check if a specific tool is accessible (enabled, not in maintenance) */
export function isToolAccessible(settings: AllToolSettings, key: ToolKey): {
  accessible: boolean
  maintenance: boolean
} {
  const s = settings[key]
  if (!s?.enabled) return { accessible: false, maintenance: false }
  if (s.maintenance) return { accessible: false, maintenance: true }
  return { accessible: true, maintenance: false }
}

/**
 * Separate switch for public visibility of prediction history/results on sports detail pages.
 * Defaults to true when not configured.
 */
export async function getSportsHistoryPublicVisible(): Promise<boolean> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('admin_settings')
    .select('value')
    .eq('key', SPORTS_HISTORY_PUBLIC_VISIBLE_KEY)
    .maybeSingle()

  if (error) {
    console.error('Failed to fetch sports history visibility setting:', error)
    return true
  }
  if (!data) return true
  return parseBool(data.value)
}

/** When true, all users can export resume/cover letter as Word (admins always can). */
export async function getResumeWordExportPublicEnabled(): Promise<boolean> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('admin_settings')
    .select('value')
    .eq('key', RESUME_WORD_EXPORT_PUBLIC_KEY)
    .maybeSingle()

  if (error) {
    console.error('Failed to fetch resume Word export setting:', error)
    return false
  }
  if (!data) return false
  return parseBool(data.value)
}

/** When true, all users get AI assist (smart parse + polish) on the resume builder. */
export async function getResumeAiPublicEnabled(): Promise<boolean> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('admin_settings')
    .select('value')
    .eq('key', RESUME_AI_PUBLIC_KEY)
    .maybeSingle()

  if (error) {
    console.error('Failed to fetch resume AI setting:', error)
    return false
  }
  if (!data) return false
  return parseBool(data.value)
}
