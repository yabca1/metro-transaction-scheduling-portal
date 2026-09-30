import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CheckCircle2, CircleDotDashed, ShieldAlert } from 'lucide-react';
import { Panel } from '@/components/ui/Panel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ExecutionActions } from '@/features/executions/ExecutionActions';
import { getExecution } from '@/features/_mock/data';
import { executionRepository } from '@/features/executions/repository';

export default async function ExecutionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let execution = await executionRepository.getExecutionById(id).catch(() => null);
  if (!execution) {
    execution = getExecution(id) ?? null;
  }
  if (!execution) notFound();

  return (
    <div className="space-y-6">
      <Link href="/executions" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-muted">
        <ArrowLeft className="size-4" />
        Back to executions
      </Link>
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-brand-border bg-brand-subtle p-5 lg:flex-row lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold text-brand-blue">{execution.reference}</span>
            <StatusBadge value={execution.status} />
          </div>
          <h2 className="mt-3 text-2xl font-bold">
            {execution.amount} {execution.currency}
          </h2>
          <p className="mt-1 text-sm text-brand-muted">
            {execution.transactionType.replaceAll('_', ' ')} · {execution.trigger} trigger
          </p>
        </div>
        <ExecutionActions reference={execution.reference} status={execution.status} />
      </div>
      {execution.failureMessage && (
        <div className="rounded-2xl border border-brand-danger/20 bg-brand-danger-soft p-4">
          <div className="flex gap-3">
            <ShieldAlert className="mt-0.5 size-5 shrink-0 text-brand-danger" />
            <div>
              <p className="text-xs font-bold text-brand-danger">{execution.failureCode}</p>
              <p className="mt-1 text-sm text-brand-primary">{execution.failureMessage}</p>
            </div>
          </div>
        </div>
      )}
      <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <Panel className="p-5">
          <h3 className="text-sm font-bold">Execution details</h3>
          <dl className="mt-5 grid gap-x-6 gap-y-5 sm:grid-cols-2">
            {[
              ['Internal ID', execution.id],
              ['Schedule', execution.scheduleReference],
              ['Schedule version', String(execution.scheduleVersion ?? 1)],
              ['Scheduled at', execution.scheduledAt],
              ['Effective at', execution.effectiveAt || 'Not yet effective'],
              ['Attempt count', String(execution.attemptCount)],
              ['Trigger type', execution.trigger],
              ['Financial reference', execution.financialReference || 'Not assigned'],
              ['Created at', execution.createdAt ?? execution.scheduledAt],
              ['Updated at', execution.updatedAt ?? execution.effectiveAt ?? execution.scheduledAt],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">{label}</dt>
                <dd className="mt-1.5 font-mono text-xs font-bold">{value}</dd>
              </div>
            ))}
          </dl>
        </Panel>
        <Panel className="p-5">
          <h3 className="text-sm font-bold">Lifecycle</h3>
          <div className="mt-5 space-y-0">
            <div className="flex gap-3">
              <CheckCircle2 className="size-5 text-brand-success" />
              <div className="border-l border-brand-border pb-6 pl-4">
                <p className="text-xs font-bold">Occurrence created</p>
                <p className="mt-1 text-[10px] text-brand-muted">{execution.scheduledAt}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CircleDotDashed className="size-5 text-brand-blue" />
              <div className="pl-4">
                <p className="text-xs font-bold">Current state · {execution.status}</p>
                <p className="mt-1 text-[10px] text-brand-muted">Awaiting authoritative transition</p>
              </div>
            </div>
          </div>
        </Panel>
      </div>
      <Panel className="p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-sm font-bold">Related schedule</h3>
            <p className="mt-1 font-mono text-xs text-brand-muted">{execution.scheduleReference}</p>
          </div>
          <Link href={`/schedules/${execution.scheduleId}`} className="text-xs font-bold text-brand-blue">
            Open schedule →
          </Link>
        </div>
      </Panel>
    </div>
  );
}
