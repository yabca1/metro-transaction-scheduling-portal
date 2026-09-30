export interface DashboardStatsResponseDTO {
  active_schedules_count: number;
  paused_schedules_count: number;
  suspended_schedules_count: number;
  today_executions_count: number;
  today_failed_executions_count: number;
  today_escalated_executions_count: number;
  today_total_volume?: string;
  currency: string;
  last_updated_at?: string;
}

export interface HealthDependencyDTO {
  name: string;
  status: 'READY' | 'UNAVAILABLE';
  latency?: string;
  version?: string;
}

export interface HealthResponseDTO {
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  version: string;
  timestamp?: string;
  dependencies: HealthDependencyDTO[];
}
