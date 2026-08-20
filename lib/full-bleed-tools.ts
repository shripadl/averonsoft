/** Full-viewport detachable tools — omit Averonsoft header/footer in root layout. */
const FULL_BLEED_PREFIXES = [
  "/area-map",
  "/home-decor",
  "/satbara",
  "/passport-photo",
] as const;

export function isFullBleedToolPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return FULL_BLEED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
