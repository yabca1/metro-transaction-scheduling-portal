import type { Schedule } from '@/features/_mock/data';
import type {
  CreateScheduleRequestDTO,
  ListSchedulesParams,
  UpdateScheduleRequestDTO,
} from '../dto/schedule.dto';

export interface PaginatedResult<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  page: number;
  pageSize: number;
}

export interface IScheduleRepository {
  getSchedules(params?: ListSchedulesParams): Promise<PaginatedResult<Schedule>>;
  getScheduleById(id: string): Promise<Schedule>;
  createSchedule(data: CreateScheduleRequestDTO): Promise<Schedule>;
  updateSchedule(id: string, data: UpdateScheduleRequestDTO): Promise<Schedule>;
  pauseSchedule(scheduleRef: string): Promise<void>;
  resumeSchedule(scheduleRef: string): Promise<void>;
  cancelSchedule(scheduleRef: string): Promise<void>;
  executeNow(scheduleRef: string): Promise<void>;
  suspendSchedule(id: string, reason?: string): Promise<void>;
  unsuspendSchedule(id: string, reason: string): Promise<void>;
}
