import { httpClient } from '@/lib/api/client';
import type { Execution } from '@/features/_mock/data';
import type {
  ExecutionResponseDTO,
  ListExecutionsParams,
  PagedExecutionResponseDTO,
} from '../dto/execution.dto';
import { toExecutionDomain } from '../mapper/execution.mapper';
import type { IExecutionRepository } from './contract';
import type { PaginatedResult } from '@/features/schedules/repository/contract';

export class RemoteExecutionRepository implements IExecutionRepository {
  async getExecutions(params?: ListExecutionsParams): Promise<PaginatedResult<Execution>> {
    const cleanParams: Record<string, unknown> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== 'ALL') {
          cleanParams[key] = value;
        }
      });
    }

    const response = await httpClient.get<PagedExecutionResponseDTO>('/internal/v1/executions', {
      params: cleanParams,
    });

    const items = (response.items || []).map(toExecutionDomain);
    return {
      items,
      totalItems: response.totalItems ?? items.length,
      totalPages: response.totalPages ?? 1,
      page: response.page ?? (params?.page || 1),
      pageSize: response.pageSize ?? (params?.limit || 10),
    };
  }

  async getExecutionById(id: string): Promise<Execution> {
    const response = await httpClient.get<ExecutionResponseDTO>(
      `/internal/v1/executions/${encodeURIComponent(id)}`,
    );
    return toExecutionDomain(response);
  }

  async retryExecution(id: string, reason?: string): Promise<void> {
    await httpClient.post(
      `/internal/v1/executions/${encodeURIComponent(id)}/retry`,
      reason ? { reason } : {},
    );
  }

  async skipExecution(id: string, reason?: string): Promise<void> {
    await httpClient.post(
      `/internal/v1/executions/${encodeURIComponent(id)}/skip`,
      reason ? { reason } : {},
    );
  }

  async escalateExecution(id: string, reason?: string): Promise<void> {
    await httpClient.post(
      `/internal/v1/executions/${encodeURIComponent(id)}/escalate`,
      reason ? { reason } : {},
    );
  }

  async bulkRetry(ids: string[], reason?: string): Promise<void> {
    await httpClient.post('/internal/v1/executions/bulk-retry', {
      execution_ids: ids,
      reason,
    });
  }

  async bulkSkip(ids: string[], reason?: string): Promise<void> {
    await httpClient.post('/internal/v1/executions/bulk-skip', {
      execution_ids: ids,
      reason,
    });
  }
}
