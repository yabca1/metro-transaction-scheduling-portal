'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight, Clock3, Code2, Eye, Loader2, Search, X } from 'lucide-react';
import { FilterPopover, type FilterOption } from '@/components/shared/FilterPopover';
import { Panel } from '@/components/ui/Panel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ExecutionActions } from '@/features/executions/ExecutionActions';
import type { Execution } from '@/features/_mock/data';
import { useExecutions } from './hooks/useExecutions';

const statusOptions: FilterOption[] = [
  { label: 'All statuses', value: 'ALL' },
  { label: 'Success', value: 'SUCCEEDED' },
  { label: 'Processing / In-flight', value: 'PROCESSING' },
  { label: 'Failed', value: 'FAILED' },
  { label: 'Retrying', value: 'RETRY' },
  { label: 'Escalated', value: 'ESCALATED' },
  { label: 'Skipped', value: 'SKIPPED' },
];

const triggerOptions: FilterOption[] = [
  { label: 'All triggers', value: 'ALL' },
  { label: 'Automated chrono', value: 'SCHEDULED' },
  { label: 'Manual override', value: 'MANUAL' },
  { label: 'Retry', value: 'RETRY' },
];

function ExecutionDrawer({ item, onClose }: { item: Execution; onClose: () => void }) {
  const payload = {
    execution_reference: item.reference,
    schedule_reference: item.scheduleReference,
    transaction_type: item.transactionType,
    trigger_type: item.trigger,
  };

  return (
    <aside
      className="w-full animate-[schedule-drawer_.3s_ease-out] overflow-y-auto rounded-2xl border border-brand-border bg-white shadow-sm lg:w-[40%] xl:w-[35%]"
      aria-label={`Execution ${item.reference}`}
    >
      <div className="sticky top-0 z-10 flex items-start justify-between border-b border-brand-border bg-white p-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-brand-subtle px-2 py-1 font-mono text-[10px] font-bold">
              {item.reference}
            </span>
            <StatusBadge value={item.status} />
          </div>
          <h3 className="mt-3 text-xl font-bold">
            {item.amount} {item.currency}
          </h3>
          <p className="mt-1 text-xs text-brand-muted">{item.transactionType.replaceAll('_', ' ')}</p>
        </div>
        <button
          onClick={onClose}
          className="grid size-9 place-items-center rounded-full border border-brand-border"
          aria-label="Close execution details"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="space-y-5 p-5">
        <dl className="space-y-3">
          {[
            ['Schedule', item.scheduleReference],
            ['Trigger', item.trigger],
            ['Scheduled at', item.scheduledAt],
            ['Effective at', item.effectiveAt ?? 'Not effective'],
            ['Attempt count', String(item.attemptCount)],
            ['Financial reference', item.financialReference ?? 'Not assigned'],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 border-b border-brand-border pb-3 text-xs">
              <dt className="text-brand-muted">{label}</dt>
              <dd className="text-right font-mono font-bold">{value}</dd>
            </div>
          ))}
        </dl>

        {item.failureMessage && (
          <div className="rounded-xl border border-brand-danger/20 bg-brand-danger-soft p-3">
            <p className="text-xs font-bold text-brand-danger">{item.failureCode}</p>
            <p className="mt-1 text-xs text-brand-muted">{item.failureMessage}</p>
          </div>
        )}

        <section>
          <div className="flex items-center gap-2">
            <Code2 className="size-4" />
            <h4 className="text-xs font-bold">Payload preview</h4>
          </div>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-brand-primary p-4 text-[10px] leading-relaxed text-white">
            {JSON.stringify(payload, null, 2)}
          </pre>
        </section>

        <section>
          <h4 className="text-xs font-bold">Execution timeline</h4>
          <div className="mt-3 flex gap-3">
            <Clock3 className="size-4 text-brand-blue" />
            <div>
              <p className="text-xs font-bold">Current state · {item.status}</p>
              <p className="mt-1 text-[10px] text-brand-muted">
                {item.attemptCount} attempt{item.attemptCount === 1 ? '' : 's'} recorded
              </p>
            </div>
          </div>
        </section>

        <ExecutionActions reference={item.reference} status={item.status} />

        <Link
          href={`/executions/${item.id}`}
          className="inline-flex w-full items-center justify-center rounded-xl border border-brand-border py-3 text-xs font-bold"
        >
          Open full execution record
        </Link>
      </div>
    </aside>
  );
}

export function ExecutionsWorkspace({ executions }: { executions?: Execution[] }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('ALL');
  const [trigger, setTrigger] = useState('ALL');
  const [selected, setSelected] = useState<Execution | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const { data: remoteData, isLoading, error } = useExecutions({
    schedule_reference: query || undefined,
    status: status !== 'ALL' ? (status === 'SUCCEEDED' ? 'SUCCESS' : status) : undefined,
    trigger_type: trigger !== 'ALL' ? trigger : undefined,
    page,
    limit: pageSize,
  });

  const close = () => setSelected(null);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => event.key === 'Escape' && close();
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, []);

  const items = useMemo(() => remoteData?.items ?? executions ?? [], [remoteData?.items, executions]);
  const filtered = useMemo(() => {
    if (remoteData) return items;
    return items.filter(
      (item) =>
        `${item.reference} ${item.scheduleReference} ${item.financialReference ?? ''}`
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        (status === 'ALL' || item.status === status || (status === 'RETRY' && item.trigger === 'RETRY')) &&
        (trigger === 'ALL' || item.trigger === trigger),
    );
  }, [remoteData, items, query, status, trigger]);

  const totalPages = remoteData?.totalPages ?? Math.max(1, Math.ceil(filtered.length / pageSize));
  const totalCount = remoteData?.totalItems ?? filtered.length;
  const visible = remoteData ? items : filtered.slice((page - 1) * pageSize, page * pageSize);

  const filter = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row">
        <label className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-brand-muted" />
          <input
            aria-label="Search executions"
            value={query}
            onFocus={close}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="h-11 w-full rounded-xl border border-brand-field pl-10 pr-4 text-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
            placeholder="Search execution, schedule or financial reference"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <FilterPopover label="Status" value={status} options={statusOptions} onChange={filter(setStatus)} onOpen={close} />
          <FilterPopover label="Trigger" value={trigger} options={triggerOptions} onChange={filter(setTrigger)} onOpen={close} />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-brand-danger/20 bg-brand-danger-soft p-4 text-xs text-brand-danger">
          <AlertCircle className="size-4 shrink-0" />
          <p>Failed to load executions from TSS: {error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      )}

      <div className="flex flex-col gap-4 lg:flex-row">
        <Panel className={`min-w-0 overflow-hidden transition-all duration-300 ${selected ? 'w-full lg:w-[60%] xl:w-[65%]' : 'w-full'}`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left">
              <thead>
                <tr className="bg-brand-subtle text-[10px] uppercase tracking-wider text-brand-muted">
                  <th className="px-5 py-3.5">Execution</th>
                  <th className="px-5 py-3.5">Schedule</th>
                  <th className="px-5 py-3.5">Transaction</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Trigger</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <Loader2 className="mx-auto size-6 animate-spin text-brand-blue" />
                      <p className="mt-2 text-xs text-brand-muted">Loading executions from TSS...</p>
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  visible.map((item) => (
                    <tr
                      key={item.id}
                      tabIndex={0}
                      onClick={() => setSelected(item)}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelected(item)}
                      className={`cursor-pointer border-t border-brand-border text-xs outline-none hover:bg-brand-subtle focus:ring-2 focus:ring-inset focus:ring-brand-primary ${
                        selected?.id === item.id ? 'bg-brand-subtle' : ''
                      }`}
                    >
                      <td className="px-5 py-4">
                        <p className="font-mono font-bold">{item.reference}</p>
                        <p className="mt-1 text-[10px] text-brand-muted">{item.financialReference ?? 'No financial ref'}</p>
                      </td>
                      <td className="px-5 py-4 font-mono text-[10px]">{item.scheduleReference}</td>
                      <td className="px-5 py-4 font-semibold">{item.transactionType.replaceAll('_', ' ')}</td>
                      <td className="px-5 py-4 font-bold">
                        {item.amount} {item.currency}
                      </td>
                      <td className="px-5 py-4 text-brand-muted">{item.trigger}</td>
                      <td className="px-5 py-4">
                        <StatusBadge value={item.status} />
                      </td>
                      <td className="px-5 py-4">
                        <Eye className="size-4" />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {!isLoading && !visible.length && (
              <p className="p-10 text-center text-sm text-brand-muted">No executions match the selected filters.</p>
            )}
          </div>
          <div className="flex items-center justify-between border-t border-brand-border px-5 py-4 text-xs text-brand-muted">
            <span>
              Showing {totalCount ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, totalCount)} of {totalCount} executions
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1 || isLoading}
                onClick={() => {
                  close();
                  setPage((v) => v - 1);
                }}
                className="grid size-8 place-items-center rounded-lg border border-brand-border disabled:opacity-30"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="rounded-lg bg-brand-primary px-3 py-2 text-[10px] font-bold text-white">
                {page} / {totalPages}
              </span>
              <button
                disabled={page === totalPages || isLoading}
                onClick={() => {
                  close();
                  setPage((v) => v + 1);
                }}
                className="grid size-8 place-items-center rounded-lg border border-brand-border disabled:opacity-30"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </Panel>
        {selected && <ExecutionDrawer item={selected} onClose={close} />}
      </div>
    </div>
  );
}
