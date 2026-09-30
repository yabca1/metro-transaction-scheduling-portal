# API contract assessment

Source: `swagger(7).json`, Swagger 2.0, `MetroTransactionSchedulingServiceTSS` version `1.0`.

## Covered operations

- 9 public customer/merchant operations.
- 8 internal staff-management operations.
- 17 operations across 16 paths.

## Blocking contract gaps

1. Response schemas define no required fields.
2. Schedule, execution, trigger and owner statuses lack enums.
3. Date-time and identifier fields lack formats and patterns.
4. Error schema is empty and cannot support field errors or request IDs.
5. Most operations omit 401, 403, 404, 409, 422 and 5xx response contracts.
6. Operator action reason is optional.
7. Operator mutations do not define idempotency.
8. Pagination lacks bounds; request `limit` and response `pageSize` use different naming.
9. Management responses omit amount while public responses contain it.
10. Operational lists have no filters or sort contract.
11. `CUSTOM_RECURRENCE` does not define recurrence-rule syntax.
12. No health, overview or audit endpoint is documented.
13. Security alternatives allow actor headers or OAuth; the portal must always derive actor headers server-side.
14. Both HTTP and HTTPS are advertised; production must be HTTPS only.

## Required contract decisions before mutations

- Legal state-transition matrix.
- Idempotency behavior and maximum key length for every action.
- Unknown-outcome reconciliation behavior.
- Required action-reason policy.
- Maker-checker or step-up thresholds.
- Exact money representation and currency precision.
- Timezone, DST, holiday and month-end recurrence semantics.
- Backend ownership of audit evidence.

Until resolved, the first walking skeleton should be read-only: execution list → execution detail.
