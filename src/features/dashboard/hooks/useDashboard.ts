'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardRepository } from '../repository';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardRepository.getStats(),
    refetchInterval: 30000,
  });
}

export function useServiceHealth() {
  return useQuery({
    queryKey: ['service-health'],
    queryFn: () => dashboardRepository.getHealth(),
    refetchInterval: 60000,
  });
}
