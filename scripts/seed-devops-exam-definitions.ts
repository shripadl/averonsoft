/**
 * These questions are original and unofficial. Not affiliated with CNCF, Red Hat, Docker, or Ansible.
 * This script only inserts exam metadata rows (no questions).
 */

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { DEVOPS_EXAM_PROFILES } from '@/lib/practice/generators/devops-cert'

function loadEnvFile(relativePath: string) {
  const fullPath = join(process.cwd(), relativePath)
  if (!existsSync(fullPath)) return
  const content = readFileSync(fullPath, 'utf8')
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const idx = line.indexOf('=')
    if (idx <= 0) continue
    const key = line.slice(0, idx).trim()
    if (!key || process.env[key] != null) continue
    let value = line.slice(idx + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    process.env[key] = value
  }
}

async function main() {
  loadEnvFile('.env.local')
  loadEnvFile('.env')
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase env vars')
  const supabase = createClient(url, key, { auth: { persistSession: false } })

  const rows = Object.entries(DEVOPS_EXAM_PROFILES).map(([slug, profile]) => ({
    slug,
    name: profile.name,
    provider: profile.provider,
    description: profile.description,
    total_questions: 0,
    is_active: true,
    updated_at: new Date().toISOString(),
  }))

  const { error } = await supabase.from('exams').upsert(rows, { onConflict: 'slug' })
  if (error) throw error
  console.log(`Upserted ${rows.length} devops exam definitions.`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})

