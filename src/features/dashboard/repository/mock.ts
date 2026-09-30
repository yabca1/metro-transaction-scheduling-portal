import type { DashboardStatsResponseDTO, HealthResponseDTO } from '../dto/dashboard.dto';
import type { IDashboardRepository } from './contract';

export class MockDashboardRepository implements IDashboardRepository {
  async getStats(): Promise<DashboardStatsResponseDTO> {
    return {
      active_schedules_count: 1248,
      paused_schedules_count: 42,
      suspended_schedules_count: 7,
      today_executions_count: 2480,
      today_failed_executions_count: 14,
      today_escalated_executions_count: 3,
      today_total_volume: '4289050.00',
      currency: 'ETB',
      last_updated_at: new Date().toISOString(),
    };
  }

  async getHealth(): Promise<HealthResponseDTO> {
    return {
      status: 'HEALTHY',
      version: 'v1.0.0',
      timestamp: new Date().toISOString(),
      dependencies: [
        { name: 'Schedule database', status: 'READY', latency: '12 ms', version: 'PostgreSQL 16' },
        { name: 'Message broker', status: 'READY', latency: '4 ms', version: 'Kafka 3.6' },
        { name: 'Core banking bridge', status: 'READY', latency: '24 ms' },
      ],
    };
  }
}
