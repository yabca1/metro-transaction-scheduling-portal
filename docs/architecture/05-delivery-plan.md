# Delivery plan

## Phase 0 — contract and ownership

- Resolve blocking Swagger gaps.
- Assign TSS API, portal, identity and production-support owners.
- Confirm registry route, scopes, roles and tenant claim.
- Decide maker-checker and step-up requirements.

## Phase 1 — portal foundation

- Shared Super Portal session bootstrap and logout.
- Route guard and default-deny permissions.
- BFF allowlist, trusted-origin checks and normalized errors.
- Query provider, identity/tenant keys and invalid-session handling.
- Metro tokens and accessible primitives.
- Health/version surface and feature flags.

## Phase 2 — read-only walking skeleton

- Execution list with server pagination.
- Execution detail with schedule and financial references.
- Runtime schemas, DTO mapping, remote/mock repositories.
- Loading, empty, forbidden, unavailable and stale states.
- Contract, permission and browser happy-path tests.

## Phase 3 — schedule operations

- Schedule list and detail.
- Linked execution history.
- Filters and sorting after backend contract support.
- Schedule suspension behind a feature flag.

## Phase 4 — execution interventions

- Retry, skip and escalate with reason capture.
- Idempotency and unknown-outcome reconciliation.
- Manual-review queue.
- Audit evidence and request IDs.

## Phase 5 — production hardening

- Accessibility and responsive verification.
- Threat-focused authorization tests.
- Concurrency and replay tests.
- Load and degraded-network tests.
- Monitoring, alerts, runbooks and rollback drill.

## Quality gates

- TypeScript and lint.
- Runtime schema/contract tests.
- Domain transition tests.
- Component accessibility smoke tests.
- Authentication, permission and tenant-isolation tests.
- Production build.
- Browser E2E for one read flow and each enabled mutation.
