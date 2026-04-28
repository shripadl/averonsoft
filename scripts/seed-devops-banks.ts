/**
 * These questions are original and unofficial. Not affiliated with CNCF, Red Hat, Docker, or Ansible.
 *
 * Seeds DevOps exam banks to 500 questions each (in batches of 50).
 */

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createServiceClient } from '@/lib/supabase/server'
import { seedNextBatchForExam } from '@/lib/practice/admin-seeding'

const DEVOPS_SLUGS = [
  'kubernetes-cka',
  'kubernetes-ckad',
  'kubernetes-kcna',
  'openshift-admin',
  'openshift-developer',
  'docker-dca',
  'ansible-basics',
  'ansible-advanced',
] as const

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

async function seedOneExam(slug: string) {
  const supabase = createServiceClient()
  for (let i = 0; i < 20; i += 1) {
    const result = await seedNextBatchForExam(supabase, slug)
    if (result.inserted === 0 || result.completed) {
      console.log(`[${slug}] complete ${result.afterCount}/${result.target}`)
      return
    }
    console.log(`[${slug}] +${result.inserted} => ${result.afterCount}/${result.target}`)
  }
}

async function main() {
  loadEnvFile('.env.local')
  loadEnvFile('.env')

  for (const slug of DEVOPS_SLUGS) {
    await seedOneExam(slug)
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})

