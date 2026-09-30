# Repository instructions

This is a Metro regulated-finance portal. Correctness, authorization, traceability, privacy, recoverability, and explicit unknown states outrank visual or latency shortcuts.

## Next.js

This repository targets Next.js 16. Before writing framework code, read the relevant installed guide under `node_modules/next/dist/docs/` and follow current APIs and deprecations.

## Architecture

- Browser code calls only the local BFF.
- Tokens and privileged credentials remain server-side.
- API responses are parsed at repository boundaries and mapped into domain models.
- Keep customer schedule workflows, execution history, policies, and staff operations in separate feature modules.
- Financial mutations are idempotent, never optimistically completed, and must support authoritative reconciliation.
- Actor, role, and tenant context are derived from the verified server session, never browser headers.
- Do not invent status transitions, recurrence semantics, or error shapes missing from the contract.

## Verification

Run typecheck, lint, contract tests, production build, permission tests, accessibility smoke tests, and relevant browser E2E before marking a feature complete.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
