import { executions as initialExecutions, type Execution } from '@/features/_mock/data';
import type { ListExecutionsParams } from '../dto/execution.dto';
import type { IExecutionRepository } from './contract';
import type { PaginatedResult } from '@/features/schedules/repository/contract';

export class MockExecutionRepository implements IExecutionRepository {
  private data: Execution[] = [...initialExecutions];

  async getExecutions(params?: ListExecutionsParams): Promise<PaginatedResult<Execution>> {
    let list = [...this.data];

    if (params?.status && params.status !== 'ALL') {
      list = list.filter((item) => item.status === params.status);
    }

    if (params?.transaction_type && params.transaction_type !== 'ALL') {
      list = list.filter((item) => item.transactionType === params.transaction_type);
    }

    if (params?.schedule_reference) {
      const ref = params.schedule_reference.toLowerCase();
      list = list.filter((item) => item.scheduleReference.toLowerCase().includes(ref));
    }

    const page = params?.page ?? 1;
    const pageSize = params?.limit ?? 10;
    const totalItems = list.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const start = (page - 1) * pageSize;
    const items = list.slice(start, start + pageSize);

    return {
      items,
      totalItems,
      totalPages,
      page,
      pageSize,
    };
  }

  async getExecutionById(id: string): Promise<Execution> {
    const found = this.data.find((item) => item.id === id || item.reference === id);
    if (!found) {
      throw new Error(`Execution ${id} not found`);
    }
    return found;
  }

  async retryExecution(id: string, _reason?: string): Promise<void> {
    void _reason;
    const item = this.data.find((e) => e.id === id || e.reference === id);
    if (item) {
      item.status = 'PROCESSING';
      item.attemptCount += 1;
    }
  }

  async skipExecution(id: string, _reason?: string): Promise<void> {
    void _reason;
    const item = this.data.find((e) => e.id === id || e.reference === id);
    if (item) {
      item.status = 'SKIPPED';
    }
  }

  async escalateExecution(id: string, _reason?: string): Promise<void> {
    void _reason;
    const item = this.data.find((e) => e.id === id || e.reference === id);
    if (item) {
      item.status = 'ESCALATED';
    }
  }

  async bulkRetry(ids: string[], _reason?: string): Promise<void> {
    void _reason;
    ids.forEach((id) => {
      const item = this.data.find((e) => e.id === id || e.reference === id);
      if (item) {
        item.status = 'PROCESSING';
        item.attemptCount += 1;
      }
    });
  }

  async bulkSkip(ids: string[], _reason?: string): Promise<void> {
    void _reason;
    ids.forEach((id) => {
      const item = this.data.find((e) => e.id === id || e.reference === id);
      if (item) {
        item.status = 'SKIPPED';
      }
    });
  }
}
