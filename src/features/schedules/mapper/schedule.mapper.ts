import type { Schedule, ScheduleStatus } from '@/features/_mock/data';
import type { ScheduleResponseDTO } from '../dto/schedule.dto';

function formatDisplayDate(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return dateStr;
  }
}

function deriveCadence(dto: ScheduleResponseDTO): string {
  if (dto.recurrence_rule) {
    if (dto.recurrence_rule.includes('DAILY')) return 'Daily';
    if (dto.recurrence_rule.includes('WEEKLY')) return 'Weekly';
    if (dto.recurrence_rule.includes('MONTHLY')) return 'Monthly';
    return dto.recurrence_rule;
  }
  switch (dto.schedule_type) {
    case 'ONCE':
      return 'One-time';
    case 'DAILY':
      return 'Daily';
    case 'WEEKLY':
      return 'Weekly';
    case 'MONTHLY':
      return 'Monthly';
    case 'CUSTOM_RECURRENCE':
      return 'Custom recurrence';
    default:
      return dto.schedule_type || 'Custom';
  }
}

function maskReference(ref?: string): string {
  if (!ref) return '—';
  if (ref.length <= 4) return ref;
  return `•••• ${ref.slice(-4)}`;
}

export function toScheduleDomain(dto: ScheduleResponseDTO): Schedule {
  return {
    id: dto.id,
    reference: dto.schedule_reference || dto.id,
    owner: dto.owner_id || 'System / Merchant',
    ownerType: (dto.owner_type?.toUpperCase() === 'MERCHANT' ? 'MERCHANT' : 'CUSTOMER'),
    transactionType: dto.transaction_type,
    source: dto.source_reference ? maskReference(dto.source_reference) : 'Primary Account',
    destination: dto.destination_reference ? maskReference(dto.destination_reference) : 'Beneficiary Account',
    amount: dto.amount_type === 'DYNAMIC' ? 'Dynamic' : dto.amount || '0.00',
    currency: dto.currency || 'ETB',
    cadence: deriveCadence(dto),
    timezone: dto.timezone || 'Africa/Addis_Ababa',
    status: (dto.status || 'ACTIVE') as ScheduleStatus,
    nextExecution: formatDisplayDate(dto.next_execution_at),
    lastExecution: dto.last_execution_at ? formatDisplayDate(dto.last_execution_at) : undefined,
    version: dto.version ?? 1,
    createdAt: formatDisplayDate(dto.created_at),
    updatedAt: dto.updated_at ? formatDisplayDate(dto.updated_at) : undefined,
    amountType: dto.amount_type as 'FIXED' | 'DYNAMIC',
    sourceType: dto.source_type,
    destinationType: dto.destination_type,
    scheduleType: dto.schedule_type,
    startAt: dto.start_at,
    endAt: dto.end_at,
    recurrenceRule: dto.recurrence_rule,
    purposeCode: dto.purpose_code,
    metadata: dto.metadata,
    policy: dto.policy
      ? {
          businessDay: dto.policy.business_day ?? 'CALENDAR_DAY',
          holidayAdjustment: dto.policy.holiday_adjustment ?? 'SKIP',
          insufficientFunds: dto.policy.insufficient_funds ?? 'FAIL',
          missedRun: dto.policy.missed_run ?? 'SKIP',
          missedRunGraceSeconds: dto.policy.missed_run_grace_seconds ?? 300,
          overlap: dto.policy.overlap ?? 'BLOCK',
          maxBusinessRetries: dto.policy.max_business_retries ?? 0,
          businessRetrySeconds: dto.policy.business_retry_seconds ?? 0,
        }
      : undefined,
  };
}
