/**
 * Shared host detection for PhotoSpec CNAME / subdomain.
 * Override with PASSPORT_PHOTO_HOST (e.g. photospec.averonsoft.com).
 * Comma-separated hosts are supported.
 */
export function getPassportPhotoHosts(): string[] {
  const raw =
    process.env.PASSPORT_PHOTO_HOST ||
    "photospec.averonsoft.com,passport.averonsoft.com";
  return raw
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
}

export function getPassportPhotoHost(): string {
  return getPassportPhotoHosts()[0] || "photospec.averonsoft.com";
}

export function isPassportPhotoHost(hostHeader: string | null): boolean {
  if (!hostHeader) return false;
  const host = hostHeader.split(":")[0].toLowerCase();
  return getPassportPhotoHosts().includes(host);
}
