/**
 * Only allow same-origin relative paths as a post-auth redirect target.
 * Rejects absolute URLs and protocol-relative ("//host/...") values, which
 * would otherwise let a crafted `?callbackUrl=` param send a signed-in user
 * off-site (open redirect / phishing vector).
 */
export function getSafeCallbackUrl(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }
  return value;
}
