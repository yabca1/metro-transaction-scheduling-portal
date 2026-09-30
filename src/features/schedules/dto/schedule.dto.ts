export type BackendScheduleStatus =
  | 'ACTIVE'
  | 'PAUSED'
  | 'SUSPENDED'
  | 'CANCELLED'
  | 'COMPLETED';

export type BackendTransactionType =
  | 'WALLET_TRANSFER'
  | 'BANK_TRANSFER'
  | 'BILL_PAYMENT'
  | 'SAVINGS_TRANSFER'
  | 'MERCHANT_SETTLEMENT'
  | 'SUPPLIER_PAYMENT'
  | 'PAYROLL'
  | 'BATCH_DISBURSEMENT'
  | 'ACCOUNT_SWEEP'
  | string;

export type BackendScheduleType =
  | 'ONCE'
  | 'DAILY'
  | 'WEEKLY'
  | 'MONTHLY'
  | 'CUSTOM_RECURRENCE';

export interface SchedulePolicyDTO {
  business_day?: string;
  holiday_adjustment?: string;
  insufficient_funds?: string;
  missed_run?: string;
  missed_run_grace_seconds?: number;
  overlap?: string;
  max_business_retries?: number;
  business_retry_seconds?: number;
}

export interface ScheduleResponseDTO {
  id: string;
  schedule_reference: string;
  owner_id?: string;
  owner_type?: string;
  transaction_type: BackendTransactionType;
  source_type?: string;
  source_reference?: string;
  destination_type?: string;
  destination_reference?: string;
  amount?: string;
  amount_type?: string;
  currency: string;
  schedule_type: BackendScheduleType;
  start_at: string;
  end_at?: string;
  recurrence_rule?: string;
  timezone: string;
  status: BackendScheduleStatus;
  next_execution_at?: string;
  last_execution_at?: string;
  version: number;
  created_at: string;
  updated_at?: string;
  purpose_code?: string;
  metadata?: Record<string, string>;
  policy?: SchedulePolicyDTO;
  charge?: Record<string, unknown>;
  charge_calculated_at?: string;
}

export interface PagedScheduleResponseDTO {
  items: ScheduleResponseDTO[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ListSchedulesParams {
  page?: number;
  limit?: number;
  status?: string;
  transaction_type?: string;
  owner_id?: string;
  owner_type?: string;
  search?: string;
  next_run_from?: string;
  next_run_to?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface CreateScheduleRequestDTO {
  transaction_type: string;
  amount_type: 'FIXED' | 'DYNAMIC';
  amount?: string;
  currency: string;
  source_type?: string;
  source_reference: string;
  destination_type?: string;
  destination_reference: string;
  schedule_type: string;
  start_at: string;
  end_at?: string;
  timezone: string;
  recurrence_rule?: string;
  purpose_code?: string;
  metadata?: Record<string, string>;
  policy?: SchedulePolicyDTO;
}

export interface UpdateScheduleRequestDTO {
  amount?: string;
  destination_reference?: string;
  end_at?: string;
  recurrence_rule?: string;
  policy?: SchedulePolicyDTO;
  metadata?: Record<string, string>;
}

export interface ScheduleActionRequestDTO {
  reason?: string;
}
