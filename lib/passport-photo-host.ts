/**
 * Shared host detection for PhotoSpec CNAME / subdomain.
 * Override with PASSPORT_PHOTO_HOST (e.g. passport.averonsoft.com).
 */
export function getPassportPhotoHost(): string {
  return (process.env.PASSPORT_PHOTO_HOST || "passport.averonsoft.com").toLowerCase();
}

export function isPassportPhotoHost(hostHeader: string | null): boolean {
  if (!hostHeader) return false;
  const host = hostHeader.split(":")[0].toLowerCase();
  return host === getPassportPhotoHost();
}
