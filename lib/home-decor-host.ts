/**
 * Shared host detection for RoomScale CNAME / subdomain.
 * Override with HOME_DECOR_HOST (e.g. decor.averonsoft.com).
 */
export function getHomeDecorHost(): string {
  return (process.env.HOME_DECOR_HOST || "decor.averonsoft.com").toLowerCase();
}

export function isHomeDecorHost(hostHeader: string | null): boolean {
  if (!hostHeader) return false;
  const host = hostHeader.split(":")[0].toLowerCase();
  return host === getHomeDecorHost();
}
