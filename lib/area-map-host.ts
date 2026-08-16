/**
 * Shared host detection for PlotMeasure CNAME / subdomain.
 * Override with AREA_MAP_HOST (e.g. map.averonsoft.com).
 */
export function getAreaMapHost(): string {
  return (process.env.AREA_MAP_HOST || 'map.averonsoft.com').toLowerCase()
}

export function isAreaMapHost(hostHeader: string | null): boolean {
  if (!hostHeader) return false
  const host = hostHeader.split(':')[0].toLowerCase()
  return host === getAreaMapHost()
}
