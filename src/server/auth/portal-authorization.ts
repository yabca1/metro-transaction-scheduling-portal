import 'server-only';

import type { SessionUser } from './auth-session';

export type PortalAuthorization =
  | { authorized: true }
  | { authorized: false; missingScopes: string[]; missingRoles?: string[] };

function configuredList(value: string | undefined, fallback = ''): string[] {
  return (value ?? fallback)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function authorizePortalUser(user: SessionUser): PortalAuthorization {
  const requiredScopes = configuredList(process.env.PORTAL_REQUIRED_SCOPES, 'tss:operations:access');
  const missingScopes = requiredScopes.filter((scope) => !user.scopes.includes(scope));

  const requiredRoles = configuredList(process.env.PORTAL_REQUIRED_ROLES, '');
  const userRoles = user.actor?.roles ?? [];
  const missingRoles = requiredRoles.filter((role) => !userRoles.includes(role));

  if (missingScopes.length === 0 && missingRoles.length === 0) {
    return { authorized: true };
  }
  return { authorized: false, missingScopes, missingRoles };
}
