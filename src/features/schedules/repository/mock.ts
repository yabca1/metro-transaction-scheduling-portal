import { schedules as initialSchedules, type Schedule } from '@/features/_mock/data';
import type {
  CreateScheduleRequestDTO,
  ListSchedulesParams,
  UpdateScheduleRequestDTO,
} from '../dto/schedule.dto';
import type { IScheduleRepository, PaginatedResult } from './contract';

export class MockScheduleRepository implements IScheduleRepository {
  private data: Schedule[] = [...initialSchedules];

  async getSchedules(params?: ListSchedulesParams): Promise<PaginatedResult<Schedule>> {
    let list = [...this.data];

    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (item) =>
          item.reference.toLowerCase().includes(q) ||
          item.owner.toLowerCase().includes(q) ||
          item.transactionType.toLowerCase().includes(q),
      );
    }

    if (params?.status && params.status !== 'ALL') {
      list = list.filter((item) => item.status === params.status);
    }

    if (params?.transaction_type && params.transaction_type !== 'ALL') {
      list = list.filter((item) => item.transactionType === params.transaction_type);
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

  async getScheduleById(id: string): Promise<Schedule> {
    const found = this.data.find((item) => item.id === id || item.reference === id);
    if (!found) {
      throw new Error(`Schedule ${id} not found`);
    }
    return found;
  }

  async createSchedule(data: CreateScheduleRequestDTO): Promise<Schedule> {
    const id = `sch-${Date.now().toString(36)}`;
    const reference = `SCH-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const newSchedule: Schedule = {
      id,
      reference,
      owner: 'Current User',
      ownerType: 'CUSTOMER',
      transactionType: data.transaction_type,
      source: data.source_reference ? `•••• ${data.source_reference.slice(-4)}` : 'Source Account',
      destination: data.destination_reference
        ? `•••• ${data.destination_reference.slice(-4)}`
        : 'Destination Account',
      amount: data.amount_type === 'DYNAMIC' ? 'Dynamic' : data.amount || '0.00',
      currency: data.currency || 'ETB',
      cadence: data.schedule_type,
      timezone: data.timezone || 'Africa/Addis_Ababa',
      status: 'ACTIVE',
      nextExecution: data.start_at || 'Immediate',
      version: 1,
      createdAt: new Date().toISOString(),
      amountType: data.amount_type,
      sourceType: data.source_type,
      destinationType: data.destination_type,
      scheduleType: data.schedule_type,
      startAt: data.start_at,
      endAt: data.end_at,
      recurrenceRule: data.recurrence_rule,
      purposeCode: data.purpose_code,
    };
    this.data.unshift(newSchedule);
    return newSchedule;
  }

  async updateSchedule(id: string, data: UpdateScheduleRequestDTO): Promise<Schedule> {
    const index = this.data.findIndex((item) => item.id === id || item.reference === id);
    if (index === -1) throw new Error(`Schedule ${id} not found`);
    const current = this.data[index];
    const updated: Schedule = {
      ...current,
      amount: data.amount ?? current.amount,
      destination: data.destination_reference ?? current.destination,
      recurrenceRule: data.recurrence_rule ?? current.recurrenceRule,
      version: current.version + 1,
    };
    this.data[index] = updated;
    return updated;
  }

  async pauseSchedule(scheduleRef: string): Promise<void> {
    const item = this.data.find((s) => s.reference === scheduleRef || s.id === scheduleRef);
    if (item) item.status = 'PAUSED';
  }

  async resumeSchedule(scheduleRef: string): Promise<void> {
    const item = this.data.find((s) => s.reference === scheduleRef || s.id === scheduleRef);
    if (item) item.status = 'ACTIVE';
  }

  async cancelSchedule(scheduleRef: string): Promise<void> {
    const item = this.data.find((s) => s.reference === scheduleRef || s.id === scheduleRef);
    if (item) item.status = 'CANCELLED';
  }

  async executeNow(_scheduleRef: string): Promise<void> {
    void _scheduleRef;
  }

  async suspendSchedule(id: string, _reason?: string): Promise<void> {
    void _reason;
    const item = this.data.find((s) => s.id === id || s.reference === id);
    if (item) item.status = 'SUSPENDED';
  }

  async unsuspendSchedule(id: string, _reason: string): Promise<void> {
    void _reason;
    const item = this.data.find((s) => s.id === id || s.reference === id);
    if (item) item.status = 'ACTIVE';
  }
}
