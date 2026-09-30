'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { executionRepository } from '../repository';
import type { ListExecutionsParams } from '../dto/execution.dto';

export const EXECUTIONS_QUERY_KEY = ['executions'];

export function useExecutions(params?: ListExecutionsParams) {
  return useQuery({
    queryKey: [...EXECUTIONS_QUERY_KEY, params],
    queryFn: () => executionRepository.getExecutions(params),
  });
}

export function useExecution(id: string) {
  return useQuery({
    queryKey: ['execution', id],
    queryFn: () => executionRepository.getExecutionById(id),
    enabled: Boolean(id),
  });
}

export function useExecutionAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      action,
      id,
      reason,
    }: {
      action: 'retry' | 'skip' | 'escalate';
      id: string;
      reason?: string;
    }) => {
      switch (action) {
        case 'retry':
          return executionRepository.retryExecution(id, reason);
        case 'skip':
          return executionRepository.skipExecution(id, reason);
        case 'escalate':
          return executionRepository.escalateExecution(id, reason);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXECUTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useBulkExecutionAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      action,
      ids,
      reason,
    }: {
      action: 'bulk-retry' | 'bulk-skip';
      ids: string[];
      reason?: string;
    }) => {
      if (action === 'bulk-retry') {
        return executionRepository.bulkRetry(ids, reason);
      } else {
        return executionRepository.bulkSkip(ids, reason);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXECUTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}
