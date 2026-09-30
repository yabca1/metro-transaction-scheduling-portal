# Metro Transaction Scheduling Portal

Standalone Metro portal for transaction schedule visibility and staff operations over the Transaction Scheduling Service (TSS).

## Current stage

Architecture and foundation scaffold only. No financial mutation is implemented yet.

## Proposed registration

- Registry ID: `metro-transaction-scheduling`
- Local route: `/` (deployments may add a gateway prefix outside Next.js)
- Backend: Metro Transaction Scheduling Service `/tss/1.0`
- Primary audience: Metro scheduling operations staff
- Customer schedule creation belongs in the relevant Wallet or Business channel and may reuse a future TSS client package.

## Start here

1. [Portal charter](docs/architecture/01-portal-charter.md)
2. [System architecture](docs/architecture/02-system-architecture.md)
3. [Access and navigation](docs/architecture/03-access-and-navigation.md)
4. [API contract assessment](docs/architecture/04-api-contract-assessment.md)
5. [Delivery plan](docs/architecture/05-delivery-plan.md)
6. [Repository structure](docs/architecture/06-repository-structure.md)

The source Swagger is preserved in `docs/contracts/tss-swagger.json`.
