/**
 * Shared host detection for Satbara CNAME / subdomain.
 * Override with SATBARA_HOST (e.g. satbara.averonsoft.com).
 */
export function getSatbaraHost(): string {
  return (process.env.SATBARA_HOST || "satbara.averonsoft.com").toLowerCase();
}

export function isSatbaraHost(hostHeader: string | null): boolean {
  if (!hostHeader) return false;
  const host = hostHeader.split(":")[0].toLowerCase();
  return host === getSatbaraHost();
}
