export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiErrorPayload {
  code?: string;
  message?: string;
  trace_id?: string;
  request_id?: string;
  field_errors?: ApiFieldError[];
  [key: string]: unknown;
}

export class ApiError extends Error {
  readonly status?: number;
  readonly code?: string;
  readonly traceId?: string;
  readonly fieldErrors?: ApiFieldError[];

  constructor(options: {
    message: string;
    status?: number;
    code?: string;
    traceId?: string;
    fieldErrors?: ApiFieldError[];
    cause?: unknown;
  }) {
    super(options.message);
    this.name = 'ApiError';
    this.status = options.status;
    this.code = options.code;
    this.traceId = options.traceId;
    this.fieldErrors = options.fieldErrors;
    if (options.cause) {
      this.cause = options.cause;
    }
  }
}
