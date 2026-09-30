import { httpClient } from '@/lib/api/client';
import type { DashboardStatsResponseDTO, HealthResponseDTO } from '../dto/dashboard.dto';
import type { IDashboardRepository } from './contract';

export class RemoteDashboardRepository implements IDashboardRepository {
  async getStats(): Promise<DashboardStatsResponseDTO> {
    return httpClient.get<DashboardStatsResponseDTO>('/internal/v1/dashboard/stats');
  }

  async getHealth(): Promise<HealthResponseDTO> {
    return httpClient.get<HealthResponseDTO>('/internal/v1/health');
  }
}
