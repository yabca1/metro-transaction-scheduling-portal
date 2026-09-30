export type BackendExecutionStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'FAILED'
  | 'ESCALATED'
  | 'SKIPPED';

export type BackendTriggerType = 'SCHEDULED' | 'MANUAL' | 'RETRY';

export interface ExecutionAttemptDTO {
  attempt_number: number;
  started_at: string;
  completed_at?: string;
  status: string;
  failure_code?: string;
  failure_message?: string;
  financial_reference?: string;
}

export interface ExecutionResponseDTO {
  id: string;
  execution_reference: string;
  schedule_id: string;
  schedule_reference: string;
  schedule_version?: number;
  transaction_type: string;
  amount?: string;
  currency?: string;
  source_reference?: string;
  destination_reference?: string;
  fee_amount?: string;
  status: BackendExecutionStatus;
  trigger_type: BackendTriggerType;
  scheduled_at: string;
  effective_at?: string;
  attempt_count: number;
  failure_code?: string;
  failure_message?: string;
  financial_reference?: string;
  created_at: string;
  updated_at?: string;
  attempts?: ExecutionAttemptDTO[];
}

export interface PagedExecutionResponseDTO {
  items: ExecutionResponseDTO[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ListExecutionsParams {
  page?: number;
  limit?: number;
  status?: string;
  transaction_type?: string;
  failure_code?: string;
  trigger_type?: string;
  schedule_reference?: string;
  date_from?: string;
  date_to?: string;
  sort_order?: 'asc' | 'desc';
}

export interface ExecutionActionRequestDTO {
  reason?: string;
}

export interface BulkExecutionActionRequestDTO {
  execution_ids: string[];
  reason?: string;
}
