export function isAdminEmail(email: unknown, allowlist = process.env.ADMIN_EMAILS ?? ""): boolean {
  if (typeof email !== "string" || !email.trim()) return false;
  return allowlist.split(",").map(value => value.trim().toLowerCase()).filter(Boolean)
    .includes(email.trim().toLowerCase());
}

export function canSignIn(profile: { email?: unknown; email_verified?: unknown } | undefined, allowlist?: string): boolean {
  return profile?.email_verified === true && isAdminEmail(profile.email, allowlist);
}
