import type { Execution } from '@/features/_mock/data';
import type { ListExecutionsParams } from '../dto/execution.dto';
import type { PaginatedResult } from '@/features/schedules/repository/contract';

export interface IExecutionRepository {
  getExecutions(params?: ListExecutionsParams): Promise<PaginatedResult<Execution>>;
  getExecutionById(id: string): Promise<Execution>;
  retryExecution(id: string, reason?: string): Promise<void>;
  skipExecution(id: string, reason?: string): Promise<void>;
  escalateExecution(id: string, reason?: string): Promise<void>;
  bulkRetry(ids: string[], reason?: string): Promise<void>;
  bulkSkip(ids: string[], reason?: string): Promise<void>;
}
