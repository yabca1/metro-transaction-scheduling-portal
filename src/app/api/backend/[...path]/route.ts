import { NextRequest, NextResponse } from 'next/server';
import {
  AUTH_TOKEN_COOKIE,
  AUTH_USER_COOKIE,
  clearAuthSession,
  parseSessionUser,
} from '@/server/auth/auth-session';
import { authorizePortalUser } from '@/server/auth/portal-authorization';
import { rejectUntrustedMutation } from '@/server/security/request-security';

export const dynamic = 'force-dynamic';

const ALLOWED_RESOURCE_ROOTS = new Set(['api', 'internal', 'healthz', 'readyz']);
export const AUTH_SESSION_INVALID_HEADER = 'x-auth-session-invalid';

function backendBaseUrl(): URL | null {
  const configured =
    process.env.TSS_API_BASE_URL ||
    'https://dev-apim.flyzagol.com:8251/tss/1.0';
  if (!configured) return null;
  try {
    return new URL(configured.endsWith('/') ? configured : `${configured}/`);
  } catch {
    return null;
  }
}

function unauthorized(message = 'Authentication is required.') {
  return NextResponse.json(
    { code: 'UNAUTHENTICATED', message },
    {
      status: 401,
      headers: { 'Cache-Control': 'no-store', [AUTH_SESSION_INVALID_HEADER]: 'true' },
    },
  );
}

async function handleProxy(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const rejected = rejectUntrustedMutation(request);
  if (rejected) return rejected;

  const { path } = await params;
  if (
    !path.length ||
    path.some((segment) => !segment || segment === '.' || segment === '..') ||
    !ALLOWED_RESOURCE_ROOTS.has(path[0])
  ) {
    return NextResponse.json(
      { code: 'BACKEND_RESOURCE_NOT_ALLOWED', message: 'This API resource is not available.' },
      { status: 404, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const useMockAuth =
    process.env.USE_MOCK_AUTH === 'true' ||
    (process.env.NODE_ENV === 'development' && !request.cookies.get(AUTH_TOKEN_COOKIE)?.value);

  let accessToken: string | undefined;
  let actorId: string | undefined;
  let actorRoles: string | undefined;
  let actorType: string | undefined;
  let tenantId: string | undefined;

  if (useMockAuth) {
    accessToken = process.env.TSS_API_TOKEN;
    actorId = process.env.MOCK_ACTOR_ID || 'usr_tss_ops_01';
    actorRoles = process.env.MOCK_ACTOR_ROLES || 'tss:operator,tss:admin';
    actorType = process.env.MOCK_ACTOR_TYPE || 'OPERATOR';
    tenantId = process.env.MOCK_TENANT_ID;
  } else {
    accessToken = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;
    const signedUserCookie = request.cookies.get(AUTH_USER_COOKIE)?.value;
    const sessionUser = parseSessionUser(signedUserCookie);
    if (!accessToken || !sessionUser) {
      const response = unauthorized();
      if (accessToken || signedUserCookie) clearAuthSession(response);
      return response;
    }

    const authorization = authorizePortalUser(sessionUser);
    if (!authorization.authorized) {
      return NextResponse.json(
        {
          code: 'FORBIDDEN',
          message: 'You do not have permission to access this portal resource.',
          missingScopes: authorization.missingScopes,
          missingRoles: authorization.missingRoles,
        },
        { status: 403, headers: { 'Cache-Control': 'no-store' } },
      );
    }
    actorId = sessionUser.actor?.id || sessionUser.id;
    actorType = sessionUser.actor?.type || 'OPERATOR';
    actorRoles = (sessionUser.actor?.roles ?? []).join(',');
    tenantId = sessionUser.actor?.tenantId;
  }

  const baseUrl = backendBaseUrl();
  if (!baseUrl) {
    return NextResponse.json(
      { code: 'BACKEND_NOT_CONFIGURED', message: 'Transaction Scheduling Service base URL is not configured.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const targetUrl = new URL(path.map(encodeURIComponent).join('/'), baseUrl);
  targetUrl.search = request.nextUrl.search;
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID();

  const headers = new Headers({
    Accept: request.headers.get('accept') || 'application/json',
    'X-Request-ID': requestId,
  });

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  if (actorId) headers.set('X-Actor-Id', actorId);
  if (actorRoles) headers.set('X-Actor-Roles', actorRoles);
  if (actorType) headers.set('X-Actor-Type', actorType);
  if (tenantId) headers.set('X-Tenant-Id', tenantId);

  const idempotencyKey = request.headers.get('idempotency-key');
  if (idempotencyKey) headers.set('Idempotency-Key', idempotencyKey);

  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('Content-Type', contentType);

  const jwtAssertion = process.env.WSO2_JWT_ASSERTION?.trim();
  if (jwtAssertion) headers.set('X-JWT-Assertion', jwtAssertion);

  try {
    const body =
      request.method === 'GET' || request.method === 'HEAD'
        ? undefined
        : await request.arrayBuffer();
    if (body?.byteLength === 0) headers.delete('Content-Type');

    const upstream = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: body && body.byteLength > 0 ? body : undefined,
      cache: 'no-store',
      redirect: 'manual',
      signal: request.signal,
    });

    const upstreamRequestId = upstream.headers.get('x-request-id') || requestId;
    const raw = await upstream.text();
    let parsed: unknown = null;
    if (raw) {
      try {
        parsed = JSON.parse(raw) as unknown;
      } catch {
        parsed = {
          message: upstream.ok
            ? 'The backend returned a non-JSON response.'
            : raw.slice(0, 500),
        };
      }
    }

    if (!upstream.ok) {
      const problem =
        parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
      const response = NextResponse.json(
        {
          code: typeof problem.code === 'string' ? problem.code : `HTTP_${upstream.status}`,
          message:
            typeof problem.message === 'string'
              ? problem.message
              : 'The upstream Transaction Scheduling Service request failed.',
          trace_id: typeof problem.trace_id === 'string' ? problem.trace_id : upstreamRequestId,
          field_errors: problem.field_errors,
        },
        {
          status: upstream.status,
          headers: { 'Cache-Control': 'no-store', 'X-Request-ID': upstreamRequestId },
        },
      );
      if (!useMockAuth && upstream.status === 401) {
        response.headers.set(AUTH_SESSION_INVALID_HEADER, 'true');
        clearAuthSession(response);
      }
      return response;
    }

    return NextResponse.json(parsed, {
      status: upstream.status,
      headers: { 'Cache-Control': 'no-store', 'X-Request-ID': upstreamRequestId },
    });
  } catch (error) {
    console.error(`[BFF Proxy Error] ${request.method} ${path.join('/')}`, {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown upstream error',
    });
    return NextResponse.json(
      {
        code: 'BFF_PROXY_ERROR',
        message: 'The Transaction Scheduling Service is temporarily unreachable.',
        trace_id: requestId,
      },
      { status: 502, headers: { 'Cache-Control': 'no-store', 'X-Request-ID': requestId } },
    );
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}
export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}
export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}
export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}
export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}
