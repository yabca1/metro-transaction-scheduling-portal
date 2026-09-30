import json
import os

swagger_path = "/home/yabets-gobeze/METRO/metro-transaction-scheduling-portal/docs/contracts/tss-swagger.json"

with open(swagger_path, "r", encoding="utf-8") as f:
    spec = json.load(f)

# 1. Update general info & schemes
spec["schemes"] = ["https"]
spec["info"]["description"] = "The Transaction Scheduling Service (TSS) manages scheduled executions, recurrence orchestration, and operational controls for the Metro wallet ecosystem."

# 2. Enrich Definitions
defs = spec.setdefault("definitions", {})

# Error Schema
defs["metro-tss_internal_platform_errors.Error"] = {
    "type": "object",
    "required": ["code", "message", "timestamp"],
    "properties": {
        "code": {
            "type": "string",
            "description": "Machine-readable error code",
            "example": "INSUFFICIENT_FUNDS"
        },
        "message": {
            "type": "string",
            "description": "Human-readable error explanation",
            "example": "Available account balance is below the requested schedule debit amount."
        },
        "trace_id": {
            "type": "string",
            "description": "Unique distributed tracing ID for correlation with observability platform",
            "example": "trc_9981a20bf1"
        },
        "timestamp": {
            "type": "string",
            "format": "date-time",
            "example": "2026-09-24T06:30:00Z"
        },
        "field_errors": {
            "type": "array",
            "description": "Detailed validation failures on specific fields",
            "items": {
                "type": "object",
                "required": ["field", "message"],
                "properties": {
                    "field": { "type": "string", "example": "recurrence_rule" },
                    "message": { "type": "string", "example": "Invalid RRULE string format according to RFC 5545" }
                }
            }
        }
    }
}

# Update Schedule Request (Public)
defs["internal_api_public.UpdateScheduleRequest"] = {
    "type": "object",
    "properties": {
        "amount": {
            "type": "string",
            "example": "250.00",
            "description": "Updated decimal amount for FIXED schedules"
        },
        "destination_reference": {
            "type": "string",
            "example": "251911000005",
            "description": "Updated destination identifier (wallet phone, bank account, biller account)"
        },
        "destination_type": {
            "type": "string",
            "example": "WALLET",
            "enum": ["WALLET", "BANK_ACCOUNT", "BILL_ACCOUNT", "MERCHANT_ACCOUNT"]
        },
        "end_at": {
            "type": "string",
            "format": "date-time",
            "example": "2027-12-31T23:59:59+03:00"
        },
        "recurrence_rule": {
            "type": "string",
            "example": "FREQ=MONTHLY;BYMONTHDAY=28",
            "description": "Updated RFC 5545 recurrence rule"
        },
        "timezone": {
            "type": "string",
            "example": "Africa/Addis_Ababa"
        },
        "purpose_code": {
            "type": "string",
            "example": "RENT_PAYMENT"
        },
        "policy": {
            "$ref": "#/definitions/internal_api_public.PolicyInput"
        },
        "metadata": {
            "type": "object",
            "additionalProperties": { "type": "string" }
        }
    }
}

# Occurrence Preview Request & Response
defs["internal_api_public.PreviewOccurrencesRequest"] = {
    "type": "object",
    "required": ["start_at", "schedule_type", "timezone"],
    "properties": {
        "start_at": {
            "type": "string",
            "format": "date-time",
            "example": "2026-10-01T09:00:00+03:00"
        },
        "end_at": {
            "type": "string",
            "format": "date-time",
            "example": "2027-01-01T00:00:00+03:00"
        },
        "schedule_type": {
            "type": "string",
            "enum": ["ONCE", "DAILY", "WEEKLY", "MONTHLY", "CUSTOM_RECURRENCE"],
            "example": "MONTHLY"
        },
        "recurrence_rule": {
            "type": "string",
            "example": "FREQ=MONTHLY;BYMONTHDAY=1"
        },
        "timezone": {
            "type": "string",
            "example": "Africa/Addis_Ababa"
        },
        "policy": {
            "$ref": "#/definitions/internal_api_public.PolicyInput"
        },
        "max_occurrences": {
            "type": "integer",
            "default": 5,
            "minimum": 1,
            "maximum": 50,
            "description": "Number of preview occurrences to project"
        }
    }
}

defs["internal_api_public.PreviewOccurrencesResponse"] = {
    "type": "object",
    "required": ["occurrences", "timezone", "total_calculated"],
    "properties": {
        "occurrences": {
            "type": "array",
            "items": { "type": "string", "format": "date-time" },
            "example": [
                "2026-10-01T09:00:00+03:00",
                "2026-11-01T09:00:00+03:00",
                "2026-12-01T09:00:00+03:00"
            ]
        },
        "timezone": { "type": "string", "example": "Africa/Addis_Ababa" },
        "total_calculated": { "type": "integer", "example": 3 }
    }
}

# Estimate Charge Request & Response
defs["internal_api_public.EstimateChargeRequest"] = {
    "type": "object",
    "required": ["amount", "amount_type", "currency", "transaction_type", "source_reference", "destination_reference"],
    "properties": {
        "amount": { "type": "string", "example": "1500.00" },
        "amount_type": { "type": "string", "enum": ["FIXED", "DYNAMIC"], "example": "FIXED" },
        "currency": { "type": "string", "example": "ETB" },
        "transaction_type": {
            "type": "string",
            "enum": ["WALLET_TRANSFER", "BANK_TRANSFER", "BILL_PAYMENT", "SAVINGS_TRANSFER", "MERCHANT_SETTLEMENT", "SUPPLIER_PAYMENT", "PAYROLL", "BATCH_DISBURSEMENT", "ACCOUNT_SWEEP"],
            "example": "WALLET_TRANSFER"
        },
        "source_reference": { "type": "string", "example": "251911000001" },
        "destination_reference": { "type": "string", "example": "251911000002" }
    }
}

defs["internal_api_public.EstimateChargeResponse"] = {
    "type": "object",
    "required": ["currency", "fee_amount", "tax_amount", "total_debit_amount"],
    "properties": {
        "currency": { "type": "string", "example": "ETB" },
        "fee_amount": { "type": "string", "example": "15.00" },
        "tax_amount": { "type": "string", "example": "2.25" },
        "total_debit_amount": { "type": "string", "example": "1517.25" },
        "charge_rule_code": { "type": "string", "example": "SCHEDULE_TIER_P2P" },
        "expires_at": { "type": "string", "format": "date-time", "example": "2026-09-24T12:00:00Z" }
    }
}

# Operator Update Schedule Request
defs["internal_api_management.UpdateScheduleRequest"] = {
    "type": "object",
    "required": ["reason"],
    "properties": {
        "amount": { "type": "string", "example": "350.00" },
        "destination_reference": { "type": "string", "example": "251911000008" },
        "end_at": { "type": "string", "format": "date-time" },
        "recurrence_rule": { "type": "string" },
        "policy": { "$ref": "#/definitions/internal_api_public.PolicyInput" },
        "metadata": { "type": "object", "additionalProperties": { "type": "string" } },
        "reason": { "type": "string", "example": "Legal order limit adjustment requested by compliance" }
    }
}

# Bulk Execution Action Request & Response
defs["internal_api_management.BulkExecutionActionRequest"] = {
    "type": "object",
    "required": ["execution_ids", "reason"],
    "properties": {
        "execution_ids": {
            "type": "array",
            "items": { "type": "string" },
            "example": ["EXE-2026-442069", "EXE-2026-442077"]
        },
        "reason": {
            "type": "string",
            "example": "Batch retry following upstream core banking recovery"
        }
    }
}

defs["internal_api_management.BulkExecutionActionResponse"] = {
    "type": "object",
    "required": ["total_requested", "successful_count", "failed_count", "results"],
    "properties": {
        "total_requested": { "type": "integer", "example": 2 },
        "successful_count": { "type": "integer", "example": 2 },
        "failed_count": { "type": "integer", "example": 0 },
        "results": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "id": { "type": "string", "example": "EXE-2026-442069" },
                    "status": { "type": "string", "example": "RETRY_QUEUED" },
                    "error": { "type": "string" }
                }
            }
        }
    }
}

# Dashboard Stats Response
defs["internal_api_management.DashboardStatsResponse"] = {
    "type": "object",
    "required": [
        "active_schedules_count",
        "paused_schedules_count",
        "suspended_schedules_count",
        "today_executions_count",
        "today_failed_executions_count",
        "today_escalated_executions_count",
        "currency"
    ],
    "properties": {
        "active_schedules_count": { "type": "integer", "example": 1420 },
        "paused_schedules_count": { "type": "integer", "example": 89 },
        "suspended_schedules_count": { "type": "integer", "example": 14 },
        "today_executions_count": { "type": "integer", "example": 4820 },
        "today_failed_executions_count": { "type": "integer", "example": 23 },
        "today_escalated_executions_count": { "type": "integer", "example": 5 },
        "today_total_volume": { "type": "string", "example": "12845000.00" },
        "currency": { "type": "string", "example": "ETB" },
        "last_updated_at": { "type": "string", "format": "date-time", "example": "2026-09-24T06:30:00Z" }
    }
}

# Health Check Response
defs["internal_api_management.HealthResponse"] = {
    "type": "object",
    "required": ["status", "version", "dependencies"],
    "properties": {
        "status": { "type": "string", "enum": ["HEALTHY", "DEGRADED", "UNHEALTHY"], "example": "HEALTHY" },
        "version": { "type": "string", "example": "v1.0.0" },
        "timestamp": { "type": "string", "format": "date-time" },
        "dependencies": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": { "type": "string", "example": "Schedule database" },
                    "status": { "type": "string", "enum": ["READY", "UNAVAILABLE"], "example": "READY" },
                    "latency": { "type": "string", "example": "18 ms" },
                    "version": { "type": "string", "example": "PostgreSQL 16" }
                }
            }
        }
    }
}

# Execution Attempt Detail
defs["internal_api_management.ExecutionAttempt"] = {
    "type": "object",
    "required": ["attempt_number", "status", "attempted_at"],
    "properties": {
        "attempt_number": { "type": "integer", "example": 1 },
        "status": { "type": "string", "enum": ["SUCCESS", "FAILED", "PROCESSING"], "example": "FAILED" },
        "attempted_at": { "type": "string", "format": "date-time", "example": "2026-09-22T09:00:00Z" },
        "failure_code": { "type": "string", "example": "INSUFFICIENT_FUNDS" },
        "failure_message": { "type": "string", "example": "Available balance was below scheduled amount." },
        "financial_reference": { "type": "string", "example": "FT-8910024" }
    }
}

# Audit Log Models
defs["internal_api_management.AuditLogItem"] = {
    "type": "object",
    "required": ["id", "action", "actor_id", "resource_id", "outcome", "timestamp"],
    "properties": {
        "id": { "type": "string", "example": "aud-1" },
        "action": { "type": "string", "example": "SCHEDULE_SUSPENDED" },
        "actor_id": { "type": "string", "example": "usr_marta_b" },
        "actor_name": { "type": "string", "example": "Marta Bekele" },
        "actor_role": { "type": "string", "example": "OPERATOR" },
        "resource_id": { "type": "string", "example": "SCH-2026-009511" },
        "resource_type": { "type": "string", "example": "SCHEDULE" },
        "outcome": { "type": "string", "enum": ["COMPLETED", "REJECTED", "FAILED"], "example": "COMPLETED" },
        "reason": { "type": "string", "example": "Payroll exception investigation" },
        "request_id": { "type": "string", "example": "req_77cb10" },
        "timestamp": { "type": "string", "format": "date-time", "example": "2026-09-22T11:44:00Z" }
    }
}

defs["metro-tss_internal_platform_httpx.PagedResponse-internal_api_management_AuditLogItem"] = {
    "type": "object",
    "properties": {
        "items": {
            "type": "array",
            "items": { "$ref": "#/definitions/internal_api_management.AuditLogItem" }
        },
        "page": { "type": "integer" },
        "pageSize": { "type": "integer" },
        "totalItems": { "type": "integer" },
        "totalPages": { "type": "integer" }
    }
}

# Synchronize internal_api_management.ScheduleResponse with missing fields
mgmt_sched = defs["internal_api_management.ScheduleResponse"]["properties"]
mgmt_sched["amount"] = { "type": "string", "example": "1500.00" }
mgmt_sched["source_type"] = { "type": "string", "example": "WALLET" }
mgmt_sched["destination_type"] = { "type": "string", "example": "WALLET" }
mgmt_sched["purpose_code"] = { "type": "string", "example": "PAYROLL" }
mgmt_sched["recurrence_rule"] = { "type": "string", "example": "FREQ=MONTHLY;BYMONTHDAY=25" }
mgmt_sched["policy"] = { "$ref": "#/definitions/internal_api_public.PolicyInput" }
mgmt_sched["metadata"] = { "type": "object", "additionalProperties": { "type": "string" } }
mgmt_sched["charge"] = { "type": "object", "additionalProperties": {} }
mgmt_sched["charge_calculated_at"] = { "type": "string", "format": "date-time" }
mgmt_sched["status"]["enum"] = ["ACTIVE", "PAUSED", "SUSPENDED", "CANCELLED", "COMPLETED"]

# Synchronize ExecutionResponse models with missing execution fields
for exec_model in ["internal_api_public.ExecutionResponse", "internal_api_management.ExecutionResponse"]:
    eprops = defs[exec_model]["properties"]
    eprops["amount"] = { "type": "string", "example": "1500.00" }
    eprops["source_reference"] = { "type": "string", "example": "251911000001" }
    eprops["destination_reference"] = { "type": "string", "example": "251911000002" }
    eprops["fee_amount"] = { "type": "string", "example": "15.00" }
    eprops["status"]["enum"] = ["PENDING", "PROCESSING", "SUCCESS", "FAILED", "ESCALATED", "SKIPPED"]
    eprops["trigger_type"]["enum"] = ["SCHEDULED", "MANUAL", "RETRY"]
    eprops["attempts"] = {
        "type": "array",
        "items": { "$ref": "#/definitions/internal_api_management.ExecutionAttempt" }
    }

# Update ActionRequest to require reason in management actions
defs["internal_api_management.ActionRequest"]["required"] = ["reason"]

# 3. Enrich Paths & Operations
paths = spec.setdefault("paths", {})

# Standard error responses helper
def error_responses():
    return {
        "400": { "description": "Bad Request - Validation or parameter error", "schema": { "$ref": "#/definitions/metro-tss_internal_platform_errors.Error" } },
        "401": { "description": "Unauthorized - Missing or invalid credentials", "schema": { "$ref": "#/definitions/metro-tss_internal_platform_errors.Error" } },
        "403": { "description": "Forbidden - Insufficient actor permissions", "schema": { "$ref": "#/definitions/metro-tss_internal_platform_errors.Error" } },
        "404": { "description": "Not Found - Resource does not exist", "schema": { "$ref": "#/definitions/metro-tss_internal_platform_errors.Error" } },
        "409": { "description": "Conflict - State machine transition conflict or concurrent modification", "schema": { "$ref": "#/definitions/metro-tss_internal_platform_errors.Error" } },
        "422": { "description": "Unprocessable Entity - Business rule violation", "schema": { "$ref": "#/definitions/metro-tss_internal_platform_errors.Error" } },
        "500": { "description": "Internal Server Error", "schema": { "$ref": "#/definitions/metro-tss_internal_platform_errors.Error" } }
    }

# 3.1 POST /api/v1/schedules -> Add Idempotency-Key header & error responses
sched_post = paths["/api/v1/schedules"]["post"]
sched_post["parameters"].insert(0, {
    "name": "Idempotency-Key",
    "in": "header",
    "description": "Unique client-generated key (max 128 chars) ensuring safe retries without duplicate schedule setup.",
    "required": False,
    "type": "string"
})
for code, resp in error_responses().items():
    if code not in sched_post["responses"]:
        sched_post["responses"][code] = resp

# 3.2 GET /api/v1/schedules -> Add query filters and sorting
sched_get_params = paths["/api/v1/schedules"]["get"]["parameters"]
sched_get_params.extend([
    {
        "name": "status",
        "in": "query",
        "description": "Filter by schedule lifecycle status",
        "required": False,
        "type": "string",
        "enum": ["ACTIVE", "PAUSED", "CANCELLED", "COMPLETED"]
    },
    {
        "name": "transaction_type",
        "in": "query",
        "description": "Filter by transaction type",
        "required": False,
        "type": "string",
        "enum": ["WALLET_TRANSFER", "BANK_TRANSFER", "BILL_PAYMENT", "SAVINGS_TRANSFER", "MERCHANT_SETTLEMENT", "SUPPLIER_PAYMENT", "PAYROLL", "BATCH_DISBURSEMENT", "ACCOUNT_SWEEP"]
    },
    {
        "name": "search",
        "in": "query",
        "description": "Text search matching schedule reference, destination reference, or purpose code",
        "required": False,
        "type": "string"
    },
    {
        "name": "sort_by",
        "in": "query",
        "description": "Field to sort results by",
        "required": False,
        "type": "string",
        "enum": ["created_at", "next_execution_at", "start_at"],
        "default": "created_at"
    },
    {
        "name": "sort_order",
        "in": "query",
        "description": "Direction of sorting",
        "required": False,
        "type": "string",
        "enum": ["asc", "desc"],
        "default": "desc"
    }
])

# 3.3 PATCH /api/v1/schedules/{scheduleRef} -> Edit schedule
paths["/api/v1/schedules/{scheduleRef}"]["patch"] = {
    "tags": ["Schedules (Public)"],
    "summary": "Update schedule",
    "description": "Updates editable attributes (amount, destination, cadence, policy, metadata) of an active or paused schedule.",
    "consumes": ["application/json"],
    "produces": ["application/json"],
    "parameters": [
        {
            "name": "scheduleRef",
            "in": "path",
            "description": "Schedule Reference",
            "required": True,
            "type": "string"
        },
        {
            "name": "Idempotency-Key",
            "in": "header",
            "description": "Unique mutation key",
            "required": False,
            "type": "string"
        },
        {
            "in": "body",
            "name": "request",
            "description": "Schedule update payload",
            "required": True,
            "schema": { "$ref": "#/definitions/internal_api_public.UpdateScheduleRequest" }
        }
    ],
    "responses": {
        "200": { "description": "OK - Schedule updated", "schema": { "$ref": "#/definitions/internal_api_public.ScheduleResponse" } },
        **error_responses()
    },
    "security": [{ "ActorID": [], "ActorType": [] }, { "default": [] }],
    "x-auth-type": "Application & Application User",
    "x-throttling-tier": "Unlimited"
}

# 3.4 POST /api/v1/schedules/preview-occurrences
paths["/api/v1/schedules/preview-occurrences"] = {
    "post": {
        "tags": ["Schedules (Public)"],
        "summary": "Preview schedule occurrences",
        "description": "Calculates and returns the projected execution timestamps for a proposed recurrence rule, start date, and holiday policy without persisting a schedule.",
        "consumes": ["application/json"],
        "produces": ["application/json"],
        "parameters": [
            {
                "in": "body",
                "name": "request",
                "description": "Occurrences calculation parameters",
                "required": True,
                "schema": { "$ref": "#/definitions/internal_api_public.PreviewOccurrencesRequest" }
            }
        ],
        "responses": {
            "200": { "description": "OK", "schema": { "$ref": "#/definitions/internal_api_public.PreviewOccurrencesResponse" } },
            **error_responses()
        },
        "security": [{ "ActorID": [], "ActorType": [] }, { "default": [] }],
        "x-auth-type": "Application & Application User",
        "x-throttling-tier": "Unlimited"
    }
}

# 3.5 POST /api/v1/schedules/estimate-charge
paths["/api/v1/schedules/estimate-charge"] = {
    "post": {
        "tags": ["Schedules (Public)"],
        "summary": "Estimate schedule charges and fees",
        "description": "Calculates the applicable service fees and taxes for a proposed transaction amount and route.",
        "consumes": ["application/json"],
        "produces": ["application/json"],
        "parameters": [
            {
                "in": "body",
                "name": "request",
                "description": "Charge calculation parameters",
                "required": True,
                "schema": { "$ref": "#/definitions/internal_api_public.EstimateChargeRequest" }
            }
        ],
        "responses": {
            "200": { "description": "OK", "schema": { "$ref": "#/definitions/internal_api_public.EstimateChargeResponse" } },
            **error_responses()
        },
        "security": [{ "ActorID": [], "ActorType": [] }, { "default": [] }],
        "x-auth-type": "Application & Application User",
        "x-throttling-tier": "Unlimited"
    }
}

# 3.6 GET /api/v1/schedules/{scheduleRef}/executions -> Add filters
exec_get_params = paths["/api/v1/schedules/{scheduleRef}/executions"]["get"]["parameters"]
exec_get_params.extend([
    {
        "name": "status",
        "in": "query",
        "description": "Filter executions by status",
        "required": False,
        "type": "string",
        "enum": ["PENDING", "PROCESSING", "SUCCESS", "FAILED", "ESCALATED", "SKIPPED"]
    },
    {
        "name": "trigger_type",
        "in": "query",
        "description": "Filter by trigger type",
        "required": False,
        "type": "string",
        "enum": ["SCHEDULED", "MANUAL", "RETRY"]
    },
    {
        "name": "date_from",
        "in": "query",
        "description": "Earliest scheduled timestamp filter (ISO 8601)",
        "required": False,
        "type": "string"
    },
    {
        "name": "date_to",
        "in": "query",
        "description": "Latest scheduled timestamp filter (ISO 8601)",
        "required": False,
        "type": "string"
    },
    {
        "name": "sort_order",
        "in": "query",
        "description": "Sort direction on scheduled_at",
        "required": False,
        "type": "string",
        "enum": ["asc", "desc"],
        "default": "desc"
    }
])

# 3.7 GET /internal/v1/schedules -> Add filters for operators
mgmt_sched_get = paths["/internal/v1/schedules"]["get"]["parameters"]
mgmt_sched_get.extend([
    {
        "name": "status",
        "in": "query",
        "description": "Filter by schedule status",
        "required": False,
        "type": "string",
        "enum": ["ACTIVE", "PAUSED", "SUSPENDED", "CANCELLED", "COMPLETED"]
    },
    {
        "name": "transaction_type",
        "in": "query",
        "description": "Filter by transaction type",
        "required": False,
        "type": "string"
    },
    {
        "name": "owner_id",
        "in": "query",
        "description": "Filter by owner actor ID",
        "required": False,
        "type": "string"
    },
    {
        "name": "owner_type",
        "in": "query",
        "description": "Filter by owner type",
        "required": False,
        "type": "string",
        "enum": ["CUSTOMER", "MERCHANT"]
    },
    {
        "name": "search",
        "in": "query",
        "description": "Search matching reference, owner or destination",
        "required": False,
        "type": "string"
    },
    {
        "name": "next_run_from",
        "in": "query",
        "description": "Upcoming execution window start (ISO 8601)",
        "required": False,
        "type": "string"
    },
    {
        "name": "next_run_to",
        "in": "query",
        "description": "Upcoming execution window end (ISO 8601)",
        "required": False,
        "type": "string"
    },
    {
        "name": "sort_by",
        "in": "query",
        "description": "Field to sort by",
        "required": False,
        "type": "string",
        "enum": ["created_at", "next_execution_at", "updated_at"],
        "default": "created_at"
    },
    {
        "name": "sort_order",
        "in": "query",
        "description": "Sort order",
        "required": False,
        "type": "string",
        "enum": ["asc", "desc"],
        "default": "desc"
    }
])

# 3.8 POST /internal/v1/schedules/{id}/unsuspend -> Lift suspension
paths["/internal/v1/schedules/{id}/unsuspend"] = {
    "post": {
        "tags": ["Schedules (Management)"],
        "summary": "Unsuspend schedule",
        "description": "Lifts operator suspension on a schedule, transitioning it back to ACTIVE state following resolution of compliance or technical hold.",
        "consumes": ["application/json"],
        "produces": ["application/json"],
        "parameters": [
            {
                "name": "id",
                "in": "path",
                "description": "Internal Schedule ID",
                "required": True,
                "type": "string"
            },
            {
                "in": "body",
                "name": "request",
                "description": "Reason for unsuspending",
                "required": True,
                "schema": { "$ref": "#/definitions/internal_api_management.ActionRequest" }
            }
        ],
        "responses": {
            "200": { "description": "OK - Schedule unsuspended", "schema": { "$ref": "#/definitions/internal_api_management.ScheduleResponse" } },
            **error_responses()
        },
        "security": [{ "ActorID": [], "ActorRoles": [] }, { "default": [] }],
        "x-auth-type": "Application & Application User",
        "x-throttling-tier": "Unlimited"
    }
}

# 3.9 PATCH /internal/v1/schedules/{id} -> Operator schedule update
paths["/internal/v1/schedules/{id}"]["patch"] = {
    "tags": ["Schedules (Management)"],
    "summary": "Operator update schedule",
    "description": "Allows an operator to update schedule attributes (limits, destination, cadence, policy) with mandatory reason logging.",
    "consumes": ["application/json"],
    "produces": ["application/json"],
    "parameters": [
        {
            "name": "id",
            "in": "path",
            "description": "Internal Schedule ID",
            "required": True,
            "type": "string"
        },
        {
            "in": "body",
            "name": "request",
            "description": "Schedule update payload with audit reason",
            "required": True,
            "schema": { "$ref": "#/definitions/internal_api_management.UpdateScheduleRequest" }
        }
    ],
    "responses": {
        "200": { "description": "OK - Schedule updated", "schema": { "$ref": "#/definitions/internal_api_management.ScheduleResponse" } },
        **error_responses()
    },
    "security": [{ "ActorID": [], "ActorRoles": [] }, { "default": [] }],
    "x-auth-type": "Application & Application User",
    "x-throttling-tier": "Unlimited"
}

# 3.10 GET /internal/v1/schedules/{id}/audit-log
paths["/internal/v1/schedules/{id}/audit-log"] = {
    "get": {
        "tags": ["Schedules (Management)"],
        "summary": "Get schedule audit logs",
        "description": "Retrieves the immutable audit trail of state transitions, modifications, and operator interventions for a schedule.",
        "produces": ["application/json"],
        "parameters": [
            {
                "name": "id",
                "in": "path",
                "description": "Internal Schedule ID",
                "required": True,
                "type": "string"
            },
            {
                "name": "page",
                "in": "query",
                "description": "Page number",
                "required": False,
                "type": "integer"
            },
            {
                "name": "limit",
                "in": "query",
                "description": "Items per page",
                "required": False,
                "type": "integer"
            }
        ],
        "responses": {
            "200": {
                "description": "OK",
                "schema": { "$ref": "#/definitions/metro-tss_internal_platform_httpx.PagedResponse-internal_api_management_AuditLogItem" }
            },
            **error_responses()
        },
        "security": [{ "ActorID": [], "ActorRoles": [] }, { "default": [] }],
        "x-auth-type": "Application & Application User",
        "x-throttling-tier": "Unlimited"
    }
}

# 3.11 GET /internal/v1/executions -> Add operator filters
mgmt_exec_get = paths["/internal/v1/executions"]["get"]["parameters"]
mgmt_exec_get.extend([
    {
        "name": "status",
        "in": "query",
        "description": "Filter by execution status",
        "required": False,
        "type": "string",
        "enum": ["PENDING", "PROCESSING", "SUCCESS", "FAILED", "ESCALATED", "SKIPPED"]
    },
    {
        "name": "transaction_type",
        "in": "query",
        "description": "Filter by transaction type",
        "required": False,
        "type": "string"
    },
    {
        "name": "failure_code",
        "in": "query",
        "description": "Filter by failure reason code (e.g. INSUFFICIENT_FUNDS, TIMEOUT)",
        "required": False,
        "type": "string"
    },
    {
        "name": "trigger_type",
        "in": "query",
        "description": "Filter by trigger type",
        "required": False,
        "type": "string",
        "enum": ["SCHEDULED", "MANUAL", "RETRY"]
    },
    {
        "name": "schedule_reference",
        "in": "query",
        "description": "Filter by parent schedule reference",
        "required": False,
        "type": "string"
    },
    {
        "name": "date_from",
        "in": "query",
        "description": "Scheduled start time filter (ISO 8601)",
        "required": False,
        "type": "string"
    },
    {
        "name": "date_to",
        "in": "query",
        "description": "Scheduled end time filter (ISO 8601)",
        "required": False,
        "type": "string"
    },
    {
        "name": "sort_order",
        "in": "query",
        "description": "Sort order on scheduled_at",
        "required": False,
        "type": "string",
        "enum": ["asc", "desc"],
        "default": "desc"
    }
])

# 3.12 POST /internal/v1/executions/bulk-retry
paths["/internal/v1/executions/bulk-retry"] = {
    "post": {
        "tags": ["Executions (Management)"],
        "summary": "Bulk retry executions",
        "description": "Retries a batch of executions currently in FAILED state.",
        "consumes": ["application/json"],
        "produces": ["application/json"],
        "parameters": [
            {
                "in": "body",
                "name": "request",
                "description": "List of execution IDs and reason",
                "required": True,
                "schema": { "$ref": "#/definitions/internal_api_management.BulkExecutionActionRequest" }
            }
        ],
        "responses": {
            "200": { "description": "OK - Bulk retry processed", "schema": { "$ref": "#/definitions/internal_api_management.BulkExecutionActionResponse" } },
            **error_responses()
        },
        "security": [{ "ActorID": [], "ActorRoles": [] }, { "default": [] }],
        "x-auth-type": "Application & Application User",
        "x-throttling-tier": "Unlimited"
    }
}

# 3.13 POST /internal/v1/executions/bulk-skip
paths["/internal/v1/executions/bulk-skip"] = {
    "post": {
        "tags": ["Executions (Management)"],
        "summary": "Bulk skip executions",
        "description": "Marks a batch of failed or escalated executions as skipped.",
        "consumes": ["application/json"],
        "produces": ["application/json"],
        "parameters": [
            {
                "in": "body",
                "name": "request",
                "description": "List of execution IDs and reason",
                "required": True,
                "schema": { "$ref": "#/definitions/internal_api_management.BulkExecutionActionRequest" }
            }
        ],
        "responses": {
            "200": { "description": "OK - Bulk skip processed", "schema": { "$ref": "#/definitions/internal_api_management.BulkExecutionActionResponse" } },
            **error_responses()
        },
        "security": [{ "ActorID": [], "ActorRoles": [] }, { "default": [] }],
        "x-auth-type": "Application & Application User",
        "x-throttling-tier": "Unlimited"
    }
}

# 3.14 GET /internal/v1/executions/{id}/audit-log
paths["/internal/v1/executions/{id}/audit-log"] = {
    "get": {
        "tags": ["Executions (Management)"],
        "summary": "Get execution audit logs",
        "description": "Retrieves the operator actions and state transitions recorded for this execution.",
        "produces": ["application/json"],
        "parameters": [
            {
                "name": "id",
                "in": "path",
                "description": "Internal Execution ID",
                "required": True,
                "type": "string"
            }
        ],
        "responses": {
            "200": {
                "description": "OK",
                "schema": { "$ref": "#/definitions/metro-tss_internal_platform_httpx.PagedResponse-internal_api_management_AuditLogItem" }
            },
            **error_responses()
        },
        "security": [{ "ActorID": [], "ActorRoles": [] }, { "default": [] }],
        "x-auth-type": "Application & Application User",
        "x-throttling-tier": "Unlimited"
    }
}

# 3.15 GET /internal/v1/dashboard/stats
paths["/internal/v1/dashboard/stats"] = {
    "get": {
        "tags": ["Dashboard (Management)"],
        "summary": "Get dashboard KPI statistics",
        "description": "Retrieves real-time operational metrics across schedules, executions, and escalations for the management portal.",
        "produces": ["application/json"],
        "responses": {
            "200": {
                "description": "OK",
                "schema": { "$ref": "#/definitions/internal_api_management.DashboardStatsResponse" }
            },
            **error_responses()
        },
        "security": [{ "ActorID": [], "ActorRoles": [] }, { "default": [] }],
        "x-auth-type": "Application & Application User",
        "x-throttling-tier": "Unlimited"
    }
}

# 3.16 GET /internal/v1/health
paths["/internal/v1/health"] = {
    "get": {
        "tags": ["System (Management)"],
        "summary": "Get service readiness and health",
        "description": "Returns operational health, deployment version, and latency of internal dependencies (database, dispatcher, CBS).",
        "produces": ["application/json"],
        "responses": {
            "200": {
                "description": "OK - Service Healthy",
                "schema": { "$ref": "#/definitions/internal_api_management.HealthResponse" }
            },
            **error_responses()
        },
        "security": [{ "ActorID": [], "ActorRoles": [] }, { "default": [] }],
        "x-auth-type": "Application & Application User",
        "x-throttling-tier": "Unlimited"
    }
}

# Ensure formatted output is saved
with open(swagger_path, "w", encoding="utf-8") as f:
    json.dump(spec, f, indent=2, sort_keys=False)

print(f"Successfully updated {swagger_path}")
print(f"Updated paths count: {len(spec['paths'])}")
print(f"Updated definitions count: {len(spec['definitions'])}")
