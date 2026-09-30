import 'server-only';

import type { NextRequest } from 'next/server';

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function isMutationRequest(request: NextRequest): boolean {
  return MUTATION_METHODS.has(request.method.toUpperCase());
}

function trustedOrigins(request: NextRequest): Set<string> {
  const configured = [
    process.env.APP_ORIGIN,
    ...(process.env.APP_ALLOWED_ORIGINS ?? '').split(','),
  ]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value))
    .map((value) => {
      try {
        return new URL(value).origin;
      } catch {
        return '';
      }
    })
    .filter(Boolean);

  return new Set([request.nextUrl.origin, ...configured]);
}

export function rejectUntrustedMutation(request: NextRequest): Response | null {
  if (!isMutationRequest(request)) return null;

  const origin = request.headers.get('origin');
  const fetchSite = request.headers.get('sec-fetch-site');
  const originTrusted = Boolean(origin && trustedOrigins(request).has(origin));
  const sameSiteNavigation = !origin && (fetchSite === 'same-origin' || fetchSite === 'same-site');

  if (originTrusted || sameSiteNavigation) return null;
  return Response.json(
    { code: 'UNTRUSTED_ORIGIN', message: 'This request origin is not allowed.' },
    { status: 403, headers: { 'Cache-Control': 'no-store' } },
  );
}
