# Access and navigation

## Permission matrix

| Permission | Analyst | Lead | Support | Admin |
|---|---:|---:|---:|---:|
| `tss:schedule:read` | Yes | Yes | Yes | Optional |
| `tss:execution:read` | Yes | Yes | Yes | Optional |
| `tss:schedule:suspend` | No | Yes | No | No |
| `tss:execution:retry` | No | Yes | No | No |
| `tss:execution:skip` | No | Yes | No | No |
| `tss:execution:escalate` | Yes | Yes | No | No |
| `tss:audit:read` | Yes | Yes | Limited | Optional |

Backend enforcement is mandatory. UI permission checks only improve usability.

## Navigation

```text
Overview
Scheduling Operations
  Schedules
  Executions
  Manual Review
System
  Service Health
  Audit
```

The overview should not manufacture metrics from incomplete pages. It requires an aggregate backend endpoint or explicitly labels partial data.

## Route map

```text
/dashboard
/schedules
/schedules/[id]
/executions
/executions/[id]
/manual-review
/audit
/system/health
```

Customer routes are intentionally excluded from this staff portal.

## Action safeguards

- Suspend: required reason, confirmation, permission and authoritative refresh.
- Retry: failed-state guard, required reason, idempotency and reconciliation.
- Skip: required reason, destructive confirmation and audit evidence.
- Escalate: required reason and manual-review queue confirmation.
- Maker-checker: pending business decision for payroll, settlement, batch disbursement and high-value schedules.
