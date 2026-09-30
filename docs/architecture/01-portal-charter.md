# Portal charter

## Purpose

Give Metro scheduling operations staff a controlled view of transaction schedules and execution outcomes, with authorized intervention for suspension, retry, skip and escalation.

## Actors

- Scheduling operations analyst: searches schedules and executions, investigates failures.
- Scheduling operations lead: performs or approves intervention actions.
- Support analyst: read-only investigation using safe identifiers.
- Platform administrator: configures access, not schedule business state.
- Customer or merchant: owns schedules but uses Wallet or Business channels rather than this internal operations portal.

## Systems of record

- TSS owns schedules, schedule versions, recurrence, policies and execution state.
- Transaction/payment services own final financial outcomes and financial references.
- Identity platform owns authentication, actor roles, scopes and tenant binding.
- Audit platform owns immutable operator-action evidence where available.

## Included workflows

- Global schedule list and detail.
- Global execution list and detail.
- Failure investigation.
- Authorized schedule suspension.
- Authorized execution retry, skip and escalation.
- Links between schedule, execution and financial reference.
- Request/correlation ID visibility.

## Excluded workflows

- Customer schedule creation, pause, resume, cancel and execute-now UI. Those belong in customer/merchant channels.
- Editing recurrence or financial instructions after creation.
- Executing a transfer directly from the browser.
- Ledger correction, reversal or settlement.
- Identity and role administration.

## Risk classification

High risk. Operator actions can change whether financial instructions execute. Mutations require explicit permission, reason, confirmation, idempotency, authoritative refresh and immutable audit evidence. Maker-checker remains an open policy decision.

## Availability and recovery

- Read failures preserve the shell and distinguish unavailable from empty.
- Mutation timeouts produce `outcome_unknown` until reconciled.
- No financial or administrative mutation is automatically retried.
- All user-visible operational outcomes include a request ID where supplied.
