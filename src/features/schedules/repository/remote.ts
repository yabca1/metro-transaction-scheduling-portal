import { httpClient } from '@/lib/api/client';
import type { Schedule } from '@/features/_mock/data';
import type {
  CreateScheduleRequestDTO,
  ListSchedulesParams,
  PagedScheduleResponseDTO,
  ScheduleResponseDTO,
  UpdateScheduleRequestDTO,
} from '../dto/schedule.dto';
import { toScheduleDomain } from '../mapper/schedule.mapper';
import type { IScheduleRepository, PaginatedResult } from './contract';

export class RemoteScheduleRepository implements IScheduleRepository {
  async getSchedules(params?: ListSchedulesParams): Promise<PaginatedResult<Schedule>> {
    const cleanParams: Record<string, unknown> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== 'ALL') {
          cleanParams[key] = value;
        }
      });
    }

    const response = await httpClient.get<PagedScheduleResponseDTO>('/internal/v1/schedules', {
      params: cleanParams,
    });

    const items = (response.items || []).map(toScheduleDomain);
    return {
      items,
      totalItems: response.totalItems ?? items.length,
      totalPages: response.totalPages ?? 1,
      page: response.page ?? (params?.page || 1),
      pageSize: response.pageSize ?? (params?.limit || 10),
    };
  }

  async getScheduleById(id: string): Promise<Schedule> {
    const response = await httpClient.get<ScheduleResponseDTO>(`/internal/v1/schedules/${encodeURIComponent(id)}`);
    return toScheduleDomain(response);
  }

  async createSchedule(data: CreateScheduleRequestDTO): Promise<Schedule> {
    const response = await httpClient.post<ScheduleResponseDTO>('/api/v1/schedules', data);
    return toScheduleDomain(response);
  }

  async updateSchedule(id: string, data: UpdateScheduleRequestDTO): Promise<Schedule> {
    const response = await httpClient.patch<ScheduleResponseDTO>(
      `/internal/v1/schedules/${encodeURIComponent(id)}`,
      data,
    );
    return toScheduleDomain(response);
  }

  async pauseSchedule(scheduleRef: string): Promise<void> {
    await httpClient.post(`/api/v1/schedules/${encodeURIComponent(scheduleRef)}/pause`);
  }

  async resumeSchedule(scheduleRef: string): Promise<void> {
    await httpClient.post(`/api/v1/schedules/${encodeURIComponent(scheduleRef)}/resume`);
  }

  async cancelSchedule(scheduleRef: string): Promise<void> {
    await httpClient.post(`/api/v1/schedules/${encodeURIComponent(scheduleRef)}/cancel`);
  }

  async executeNow(scheduleRef: string): Promise<void> {
    await httpClient.post(`/api/v1/schedules/${encodeURIComponent(scheduleRef)}/execute-now`);
  }

  async suspendSchedule(id: string, reason?: string): Promise<void> {
    await httpClient.post(
      `/internal/v1/schedules/${encodeURIComponent(id)}/suspend`,
      reason ? { reason } : {},
    );
  }

  async unsuspendSchedule(id: string, reason: string): Promise<void> {
    await httpClient.post(`/internal/v1/schedules/${encodeURIComponent(id)}/unsuspend`, {
      reason,
    });
  }
}
