'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { scheduleRepository } from '../repository';
import type {
  CreateScheduleRequestDTO,
  ListSchedulesParams,
  UpdateScheduleRequestDTO,
} from '../dto/schedule.dto';

export const SCHEDULES_QUERY_KEY = ['schedules'];

export function useSchedules(params?: ListSchedulesParams) {
  return useQuery({
    queryKey: [...SCHEDULES_QUERY_KEY, params],
    queryFn: () => scheduleRepository.getSchedules(params),
  });
}

export function useSchedule(id: string) {
  return useQuery({
    queryKey: ['schedule', id],
    queryFn: () => scheduleRepository.getScheduleById(id),
    enabled: Boolean(id),
  });
}

export function useCreateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateScheduleRequestDTO) => scheduleRepository.createSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SCHEDULES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useUpdateSchedule(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateScheduleRequestDTO) => scheduleRepository.updateSchedule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule', id] });
      queryClient.invalidateQueries({ queryKey: SCHEDULES_QUERY_KEY });
    },
  });
}

export function useScheduleAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      action,
      reference,
      id,
      reason,
    }: {
      action: 'pause' | 'resume' | 'cancel' | 'execute' | 'suspend' | 'unsuspend';
      reference: string;
      id?: string;
      reason?: string;
    }) => {
      const targetId = id || reference;
      switch (action) {
        case 'pause':
          return scheduleRepository.pauseSchedule(reference);
        case 'resume':
          return scheduleRepository.resumeSchedule(reference);
        case 'cancel':
          return scheduleRepository.cancelSchedule(reference);
        case 'execute':
          return scheduleRepository.executeNow(reference);
        case 'suspend':
          return scheduleRepository.suspendSchedule(targetId, reason);
        case 'unsuspend':
          return scheduleRepository.unsuspendSchedule(targetId, reason || 'Operator lifted suspension');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SCHEDULES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}
