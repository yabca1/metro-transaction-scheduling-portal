# Repository structure

```text
src/
├── app/
│   ├── (auth)/                  authenticated routes and shell
│   ├── api/auth/               safe session and logout endpoints
│   └── api/backend/[...path]/  server-side TSS proxy
├── components/
│   ├── layout/                 portal shell
│   ├── shared/                 portal-local composites
│   └── ui/                     accessible Metro primitives
├── constants/                  routes, permissions, presentation constants
├── features/
│   ├── auth/                   sanitized session state
│   ├── schedules/              schedule list/detail and suspension
│   ├── executions/             execution list/detail
│   ├── policies/               recurrence/policy presentation
│   ├── operations/             intervention workflows/manual review
│   ├── audit/                  audit evidence when contract exists
│   └── health/                 service readiness
├── lib/                        API errors, query policy, formatting
└── server/
    ├── auth/                   cookie verification/authorization
    ├── config/                 validated server configuration
    └── security/               origin checks and safe proxy rules
```

Feature modules add only useful layers:

```text
feature/
├── dto/
├── validation/
├── mapper/
├── models/
├── repository/
├── hooks/
├── components/
└── screens/
```

Endpoint strings belong in remote repositories. React components must not call TSS directly.
