import type { DashboardStatsResponseDTO, HealthResponseDTO } from '../dto/dashboard.dto';

export interface IDashboardRepository {
  getStats(): Promise<DashboardStatsResponseDTO>;
  getHealth(): Promise<HealthResponseDTO>;
}
