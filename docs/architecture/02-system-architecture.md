# System architecture

## Topology

```text
Operator browser
  → Transaction Scheduling Portal
    → server-side session and authorization
    → local BFF /api/backend/[...path]
      → Metro API gateway
        → Transaction Scheduling Service
          → transaction/payment execution services
```

The browser never holds access tokens or calls TSS directly.

## Trust boundaries

1. Browser to portal: untrusted inputs; enforce CSRF/trusted-origin protection on mutations.
2. Portal session: verify shared signed user cookie and keep bearer token HTTP-only.
3. BFF to gateway: derive actor, roles and tenant from the verified session; never forward browser-supplied identity headers.
4. TSS to financial services: outside the portal boundary; TSS remains authoritative for dispatch and execution state.

## Layering

```text
Screen → query/mutation hook → repository contract → BFF client → TSS
                          ↑ mapper + runtime schema ↓
```

- DTOs mirror the versioned contract.
- Runtime schemas validate unknown network data.
- Mappers produce stable portal domain models.
- Components consume domain models only.

## State and caching

- Private query keys contain identity, tenant and filter state.
- Schedule/execution lists use server pagination.
- Live operational status has a short stale time and manual refresh.
- Mutations invalidate only affected schedule/execution keys.
- Identity or tenant change clears all private caches.

## Mutation safety

- One idempotency key per logical attempt.
- Never optimistic-complete retry, skip, escalate or suspend.
- Network failure is not failure of the underlying action.
- Reconcile through schedule or execution detail before allowing another attempt.
- Concurrent state conflicts surface as conflicts, not generic errors.

## Deployment

- Standalone Next.js application.
- The standalone portal serves from `/`; a shared gateway may add an external `/scheduling` prefix without baking it into client bundles.
- Shared Super Portal authentication.
- Environment-owned TSS base URL and secrets.
- Production requires HTTPS, security headers, observability and rollback flag.
