/**
 * Cloudflare Worker — scheduled HTTP trigger for sports ingestion.
 *
 * Deploy (from this directory):
 *   npx wrangler secret put CRON_SECRET
 *   npx wrangler deploy
 *
 * Set INGESTION_URL if not using production default.
 */

export interface Env {
  CRON_SECRET: string
  INGESTION_URL?: string
}

const DEFAULT_INGESTION_URL = 'https://www.averonsoft.com/api/sports/ingestion/run'

export default {
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(runIngestion(env))
  },
}

async function runIngestion(env: Env): Promise<void> {
  const url = env.INGESTION_URL?.trim() || DEFAULT_INGESTION_URL
  const secret = env.CRON_SECRET?.trim()
  if (!secret) {
    console.error('CRON_SECRET is not configured on the worker')
    return
  }

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${secret}`,
    },
  })

  const body = await res.text()
  console.log(`Sports ingestion ${res.status}: ${body.slice(0, 500)}`)

  if (!res.ok) {
    throw new Error(`Ingestion failed with status ${res.status}`)
  }
}
