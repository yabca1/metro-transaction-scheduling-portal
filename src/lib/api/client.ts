import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { appPath } from '@/lib/app-path';
import { ApiError, ApiErrorPayload } from './types';

export const bffClient = axios.create({
  baseURL: appPath('/api/backend'),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Auto-inject Idempotency-Key for financial and state-altering mutations
bffClient.interceptors.request.use((config) => {
  const method = config.method?.toUpperCase();
  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    if (!config.headers['Idempotency-Key']) {
      const generated =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `tss-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      config.headers['Idempotency-Key'] = generated;
    }
  }
  return config;
});

function normalizeError(error: unknown): ApiError {
  if (!axios.isAxiosError(error)) {
    return new ApiError({
      message: error instanceof Error ? error.message : 'An unexpected error occurred.',
      cause: error,
    });
  }

  const axiosError = error as AxiosError<ApiErrorPayload>;
  const payload = axiosError.response?.data;
  const status = axiosError.response?.status;
  const traceId =
    payload?.trace_id ||
    payload?.request_id ||
    (typeof axiosError.response?.headers?.['x-request-id'] === 'string'
      ? axiosError.response.headers['x-request-id']
      : undefined);

  let message = payload?.message;
  if (!message) {
    if (axiosError.code === 'ECONNABORTED') {
      message = 'The request timed out. Please check your network connection.';
    } else if (!axiosError.response) {
      message = 'The service is currently unreachable. Please check your connection.';
    } else if (status === 502 || status === 503 || status === 504) {
      message = 'The Transaction Scheduling Service is temporarily unavailable.';
    } else {
      message = 'A service error occurred.';
    }
  }

  return new ApiError({
    message,
    status,
    code: payload?.code ?? (axiosError.code || (status ? `HTTP_${status}` : undefined)),
    traceId,
    fieldErrors: payload?.field_errors,
    cause: error,
  });
}

bffClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(normalizeError(error)),
);

async function unwrap<T>(request: Promise<AxiosResponse<T>>): Promise<T> {
  const response = await request;
  return response.data;
}

export const httpClient = {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return unwrap(bffClient.get<T>(url, config));
  },
  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return unwrap(bffClient.post<T>(url, data, config));
  },
  patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return unwrap(bffClient.patch<T>(url, data, config));
  },
  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return unwrap(bffClient.put<T>(url, data, config));
  },
  delete<T = void>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return unwrap(bffClient.delete<T>(url, config));
  },
};
