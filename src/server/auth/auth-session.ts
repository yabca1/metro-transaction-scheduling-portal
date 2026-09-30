import 'server-only';

import crypto from 'node:crypto';
import type { NextResponse } from 'next/server';

export const AUTH_TOKEN_COOKIE = 'direct_auth_token';
export const AUTH_USER_COOKIE = 'direct_auth_user';

export type SessionActor = {
  id: string;
  type: string;
  roles: string[];
  tenantId?: string;
};

export type SessionUser = {
  id: string;
  username: string;
  email: string;
  fullName: string;
  scopes: string[];
  actor?: SessionActor;
};

function sessionSecret(): string {
  const secret = process.env.AUTH_FLOW_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('AUTH_FLOW_SECRET must be configured in production.');
    }
    return 'metro-session-signing-secret';
  }
  return secret;
}

function signingKey(): Buffer {
  return crypto.createHash('sha256').update(sessionSecret()).digest();
}

function verifyPayload(value: string): string | undefined {
  const lastDot = value.lastIndexOf('.');
  if (lastDot <= 0 || lastDot === value.length - 1) return undefined;

  const payload = value.slice(0, lastDot);
  const signature = value.slice(lastDot + 1);
  const expected = crypto
    .createHmac('sha256', signingKey())
    .update(payload)
    .digest('base64url');

  try {
    const actualBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (
      actualBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(actualBuffer, expectedBuffer)
    ) {
      return payload;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

function sessionCookieOptions(maxAge: number) {
  const domain = process.env.AUTH_COOKIE_DOMAIN?.trim();
  return {
    path: '/',
    maxAge,
    sameSite: 'lax' as const,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    priority: 'high' as const,
    ...(domain ? { domain } : {}),
  };
}

export function setAuthSession(response: NextResponse, token: string, user: SessionUser, maxAge = 3600): void {
  const payload = Buffer.from(JSON.stringify(user)).toString('base64url');
  const signature = crypto.createHmac('sha256', signingKey()).update(payload).digest('base64url');
  response.cookies.set(AUTH_TOKEN_COOKIE, token, sessionCookieOptions(maxAge));
  response.cookies.set(AUTH_USER_COOKIE, `${payload}.${signature}`, sessionCookieOptions(maxAge));
}

export function clearAuthSession(response: NextResponse): void {
  response.cookies.delete(AUTH_TOKEN_COOKIE);
  response.cookies.delete(AUTH_USER_COOKIE);
}

function stringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) return undefined;
  return [...new Set(value.map((item) => item.trim()).filter(Boolean))];
}

function parseActor(value: unknown): SessionActor | undefined | null {
  if (value === undefined) return undefined;
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const actor = value as Record<string, unknown>;
  const id = typeof actor.id === 'string' ? actor.id.trim() : '';
  const type = typeof actor.type === 'string' ? actor.type.trim() : '';
  const tenantId = typeof actor.tenantId === 'string' ? actor.tenantId.trim() : undefined;
  const roles = stringArray(actor.roles);
  if (!id || !type || !roles) return null;
  return { id, type, tenantId, roles };
}

export function parseSessionUser(value?: string): SessionUser | undefined {
  if (!value) return undefined;
  try {
    const verified = verifyPayload(value);
    if (!verified) return undefined;
    const decoded = JSON.parse(Buffer.from(verified, 'base64url').toString('utf8')) as unknown;
    if (!decoded || typeof decoded !== 'object' || Array.isArray(decoded)) return undefined;

    const candidate = decoded as Record<string, unknown>;
    const id = typeof candidate.id === 'string' ? candidate.id.trim() : '';
    const email = typeof candidate.email === 'string' ? candidate.email.trim() : '';
    const username = typeof candidate.username === 'string' && candidate.username.trim()
      ? candidate.username.trim()
      : email;
    const fullName = typeof candidate.fullName === 'string' && candidate.fullName.trim()
      ? candidate.fullName.trim()
      : username;
    const scopes = stringArray(candidate.scopes);
    const actor = parseActor(candidate.actor);

    if (!id || !email || !username || !fullName || !scopes || actor === null) return undefined;

    return { id, username, email, fullName, scopes, actor };
  } catch {
    return undefined;
  }
}
