import { createServiceClient } from '@/lib/supabase/server'

export const TOOL_KEYS = [
  'pdfconverter',
  'charactercounter',
  'jsonformatter',
  'smartimageresizer',
  'businesscard',
  'aiworkspace',
  'daw',
  'regexexplainer',
  'sportanalytics',
  'practiceexams',
] as const
export type ToolKey = (typeof TOOL_KEYS)[number]

export interface ToolConfig {
  key: ToolKey
  name: string
  href: string
}

export const TOOL_CONFIG: ToolConfig[] = [
  { key: 'pdfconverter', name: 'PDF Converter', href: '/tools/pdf-converter' },
  { key: 'charactercounter', name: 'Character Counter', href: '/tools/character-counter' },
  { key: 'jsonformatter', name: 'JSON Formatter', href: '/tools/json-formatter' },
  { key: 'smartimageresizer', name: 'Smart Image Resizer', href: '/tools/smart-image-resizer' },
  { key: 'businesscard', name: 'Business Card', href: '/tools/business-card' },
  { key: 'aiworkspace', name: 'AI Code Workspace', href: '/tools/ai-workspace' },
  { key: 'daw', name: 'DAW', href: '/tools/daw' },
  { key: 'regexexplainer', name: 'RegExplain', href: '/tools/regex-explainer' },
  { key: 'sportanalytics', name: 'Sports Analytics', href: '/sports' },
  { key: 'practiceexams', name: 'Practice Exams', href: '/practice' },
]

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
    result[key] = {
      enabled: en == null ? true : parseBool(en),
      visible: vis == null ? true : parseBool(vis),
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
