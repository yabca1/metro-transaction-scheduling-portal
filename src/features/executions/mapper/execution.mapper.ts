import type { Execution, ExecutionStatus } from '@/features/_mock/data';
import type { ExecutionResponseDTO } from '../dto/execution.dto';

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

export function toExecutionDomain(dto: ExecutionResponseDTO): Execution {
  let domainStatus: ExecutionStatus = 'PROCESSING';
  if (dto.status === 'SUCCESS') domainStatus = 'SUCCEEDED';
  else if (dto.status === 'PENDING') domainStatus = 'SCHEDULED';
  else if (dto.status === 'FAILED') domainStatus = 'FAILED';
  else if (dto.status === 'ESCALATED') domainStatus = 'ESCALATED';
  else if (dto.status === 'SKIPPED') domainStatus = 'SKIPPED';
  else if (dto.status === 'PROCESSING') domainStatus = 'PROCESSING';

  return {
    id: dto.id,
    reference: dto.execution_reference || dto.id,
    scheduleId: dto.schedule_id,
    scheduleReference: dto.schedule_reference,
    transactionType: dto.transaction_type,
    amount: dto.amount || '0.00',
    currency: dto.currency || 'ETB',
    status: domainStatus,
    trigger: dto.trigger_type || 'SCHEDULED',
    scheduledAt: formatDisplayDate(dto.scheduled_at),
    effectiveAt: dto.effective_at ? formatDisplayDate(dto.effective_at) : undefined,
    attemptCount: dto.attempt_count ?? 1,
    failureCode: dto.failure_code,
    failureMessage: dto.failure_message,
    financialReference: dto.financial_reference,
    scheduleVersion: dto.schedule_version,
    createdAt: formatDisplayDate(dto.created_at),
    updatedAt: dto.updated_at ? formatDisplayDate(dto.updated_at) : undefined,
  };
}
