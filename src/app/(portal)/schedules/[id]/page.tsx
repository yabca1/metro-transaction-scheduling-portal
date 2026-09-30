import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CalendarDays, Clock3, Coins, FileCode2, ShieldCheck, UserRound } from 'lucide-react';
import { Panel } from '@/components/ui/Panel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ScheduleActions } from '@/features/schedules/ScheduleActions';
import { executions, getSchedule } from '@/features/_mock/data';
import { scheduleRepository } from '@/features/schedules/repository';

const defaults = {
  businessDay: 'CALENDAR_DAY',
  holidayAdjustment: 'SKIP',
  insufficientFunds: 'FAIL',
  missedRun: 'MANUAL_REVIEW',
  missedRunGraceSeconds: 300,
  overlap: 'BLOCK',
  maxBusinessRetries: 2,
  businessRetrySeconds: 900,
};

function DefinitionList({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="mt-5 grid gap-x-6 gap-y-5 sm:grid-cols-2">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">{label}</dt>
          <dd className="mt-1.5 break-words text-sm font-bold">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default async function ScheduleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let schedule = await scheduleRepository.getScheduleById(id).catch(() => null);
  if (!schedule) {
    schedule = getSchedule(id) ?? null;
  }
  if (!schedule) notFound();

  const history = executions.filter((item) => item.scheduleId === schedule.id || item.scheduleReference === schedule.reference);
  const policy = schedule.policy ?? defaults;
  const isDynamic = schedule.amount === 'Dynamic';
  const type =
    schedule.scheduleType ??
    (schedule.cadence.startsWith('Daily')
      ? 'DAILY'
      : schedule.cadence.startsWith('Weekly')
      ? 'WEEKLY'
      : 'MONTHLY');

  return (
    <div className="space-y-6">
      <Link href="/schedules" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-muted">
        <ArrowLeft className="size-4" />
        Back to schedules
      </Link>
      <div className="flex flex-col justify-between gap-5 rounded-2xl border border-brand-border bg-brand-subtle p-5 lg:flex-row lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold text-brand-blue">{schedule.reference}</span>
            <StatusBadge value={schedule.status} />
            <span className="rounded-full border border-brand-border bg-white px-2.5 py-1 text-[10px] font-bold">
              v{schedule.version}
            </span>
          </div>
          <h2 className="mt-3 text-2xl font-bold">{schedule.owner}</h2>
          <p className="mt-1 text-sm text-brand-muted">
            {schedule.transactionType.replaceAll('_', ' ')} · {type.replaceAll('_', ' ')}
          </p>
        </div>
        <ScheduleActions reference={schedule.reference} initialStatus={schedule.status} />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <Panel className="p-5">
          <div className="flex items-center gap-2">
            <Coins className="size-4 text-brand-blue" />
            <h3 className="text-sm font-bold">Transaction instruction</h3>
          </div>
          <DefinitionList
            rows={[
              ['Source', `${schedule.sourceType ?? 'WALLET'} · ${schedule.source}`],
              ['Destination', `${schedule.destinationType ?? 'WALLET'} · ${schedule.destination}`],
              ['Amount type', isDynamic ? 'DYNAMIC' : 'FIXED'],
              ['Amount', isDynamic ? 'Determined at execution' : `${schedule.amount} ${schedule.currency}`],
              ['Transaction type', schedule.transactionType.replaceAll('_', ' ')],
              ['Purpose code', schedule.purposeCode ?? 'Not provided'],
            ]}
          />
        </Panel>
        <Panel className="p-5">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 text-brand-blue" />
            <h3 className="text-sm font-bold">Timing and recurrence</h3>
          </div>
          <DefinitionList
            rows={[
              ['Schedule type', type.replaceAll('_', ' ')],
              ['Cadence', schedule.cadence],
              ['Start at', schedule.startAt ?? schedule.createdAt],
              ['End at', schedule.endAt ?? 'No end date'],
              ['Timezone', schedule.timezone],
              ['Recurrence rule', schedule.recurrenceRule ?? 'Service-derived'],
            ]}
          />
        </Panel>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <Panel className="p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-brand-blue" />
            <h3 className="text-sm font-bold">Execution policy</h3>
          </div>
          <DefinitionList
            rows={[
              ['Business-day policy', policy.businessDay.replaceAll('_', ' ')],
              ['Holiday adjustment', policy.holidayAdjustment.replaceAll('_', ' ')],
              ['Insufficient funds', policy.insufficientFunds.replaceAll('_', ' ')],
              ['Missed-run policy', policy.missedRun.replaceAll('_', ' ')],
              ['Missed-run grace', `${policy.missedRunGraceSeconds} seconds`],
              ['Overlap policy', policy.overlap],
              ['Maximum retries', String(policy.maxBusinessRetries)],
              ['Retry delay', `${policy.businessRetrySeconds} seconds`],
            ]}
          />
        </Panel>
        <Panel className="p-5">
          <div className="flex items-center gap-2">
            <Clock3 className="size-4 text-brand-blue" />
            <h3 className="text-sm font-bold">Lifecycle</h3>
          </div>
          <div className="mt-5 space-y-4">
            <div className="flex gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-brand-blue-soft text-brand-blue">
                <CalendarDays className="size-4" />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase text-brand-muted">Next execution</p>
                <p className="mt-1 text-sm font-bold">{schedule.nextExecution}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-brand-subtle text-brand-muted">
                <Clock3 className="size-4" />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase text-brand-muted">Last execution</p>
                <p className="mt-1 text-sm font-bold">{schedule.lastExecution || 'No execution yet'}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-brand-subtle text-brand-muted">
                <UserRound className="size-4" />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase text-brand-muted">Owner boundary</p>
                <p className="mt-1 text-sm font-bold">{schedule.ownerType}</p>
              </div>
            </div>
          </div>
        </Panel>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel className="p-5">
          <div className="flex items-center gap-2">
            <FileCode2 className="size-4 text-brand-blue" />
            <h3 className="text-sm font-bold">Contract metadata</h3>
          </div>
          <DefinitionList
            rows={[
              ['Internal ID', schedule.id],
              ['Schedule reference', schedule.reference],
              ['Created at', schedule.createdAt],
              ['Updated at', schedule.updatedAt ?? schedule.createdAt],
              ['Charge', schedule.charge ?? 'Not returned'],
              ['Charge calculated at', schedule.chargeCalculatedAt ?? 'Not returned'],
            ]}
          />
        </Panel>
        <Panel className="p-5">
          <h3 className="text-sm font-bold">Custom metadata</h3>
          {schedule.metadata && Object.keys(schedule.metadata).length ? (
            <DefinitionList rows={Object.entries(schedule.metadata)} />
          ) : (
            <div className="mt-5 rounded-xl border border-dashed border-brand-border p-6 text-center text-xs text-brand-muted">
              No custom metadata was returned for this schedule.
            </div>
          )}
        </Panel>
      </div>
      <Panel className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-brand-border p-5">
          <div>
            <h3 className="text-sm font-bold">Execution history</h3>
            <p className="mt-1 text-xs text-brand-muted">GET /api/v1/schedules/{'{scheduleRef}'}/executions</p>
          </div>
          <span className="text-xs font-bold text-brand-muted">{history.length} occurrences</span>
        </div>
        {history.length ? (
          <div className="divide-y divide-brand-border">
            {history.map((item) => (
              <Link
                key={item.id}
                href={`/executions/${item.id}`}
                className="flex flex-col justify-between gap-3 p-5 hover:bg-brand-subtle sm:flex-row sm:items-center"
              >
                <div>
                  <p className="font-mono text-xs font-bold text-brand-blue">{item.reference}</p>
                  <p className="mt-1 text-xs text-brand-muted">
                    {item.scheduledAt} · {item.trigger}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold">
                    {item.amount} {item.currency}
                  </span>
                  <StatusBadge value={item.status} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="p-8 text-center text-sm text-brand-muted">No executions are available for this schedule.</p>
        )}
      </Panel>
    </div>
  );
}
