import type { NextRequest } from 'next/server'

/** When `CRON_SECRET` is set, only callers with `Authorization: Bearer <secret>` are allowed. */
export function isCronAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim()
  if (!secret) return true

  const auth = request.headers.get('authorization')
  return auth === `Bearer ${secret}`
}
