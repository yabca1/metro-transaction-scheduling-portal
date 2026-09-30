'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, CalendarClock, Check, ChevronDown, ChevronLeft, ChevronRight, Clock3, Code2, Eye, Loader2, Pencil, Search, X } from 'lucide-react';
import { Panel } from '@/components/ui/Panel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ScheduleActions } from '@/features/schedules/ScheduleActions';
import type { Schedule } from '@/features/_mock/data';
import { useSchedules } from './hooks/useSchedules';

type Option = { label: string; value: string; count?: number };

function FilterPopover({ label, value, options, onChange, onOpen }: { label: string; value: string; options: Option[]; onChange: (value: string) => void; onOpen: () => void }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const active = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    const closeOutside = (event: MouseEvent) => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false); };
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', closeOutside); document.addEventListener('keydown', closeOnEscape);
    return () => { document.removeEventListener('mousedown', closeOutside); document.removeEventListener('keydown', closeOnEscape); };
  }, []);

  function toggle() { const next = !open; setOpen(next); if (next) onOpen(); }
  return <div ref={rootRef} className="relative">
    <button type="button" aria-expanded={open} onClick={toggle} className="inline-flex h-11 min-w-[150px] items-center justify-between gap-3 rounded-xl border border-brand-field bg-white px-3.5 text-left text-xs font-bold outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"><span><span className="block text-[9px] uppercase tracking-wider text-brand-muted">{label}</span><span className="mt-0.5 block">{active.label}</span></span>{value !== 'ALL' && <span className="size-1.5 rounded-full bg-brand-primary" />}<ChevronDown className={`ml-auto size-4 text-brand-muted transition-transform ${open ? 'rotate-180' : ''}`} /></button>
    {open && <div className="absolute left-0 top-[calc(100%+8px)] z-50 min-w-[220px] origin-top-left animate-[schedule-popover_.15s_ease-out] rounded-xl border border-brand-border bg-white p-1.5 shadow-xl">{options.map((option) => <button key={option.value} type="button" onClick={() => { onChange(option.value); setOpen(false); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-brand-primary hover:bg-brand-subtle"><span className="flex-1">{option.label}</span>{option.count !== undefined && <span className="rounded-full bg-brand-subtle px-2 py-0.5 text-[9px] text-brand-muted">{option.count}</span>}<Check className={`size-3.5 ${value === option.value ? 'opacity-100' : 'opacity-0'}`} /></button>)}</div>}
  </div>;
}

const statusOptions: Option[] = [
  { label: 'All statuses', value: 'ALL' }, { label: 'Active', value: 'ACTIVE' }, { label: 'Paused', value: 'PAUSED' },
  { label: 'Suspended', value: 'SUSPENDED' }, { label: 'Completed', value: 'COMPLETED' }, { label: 'Cancelled', value: 'CANCELLED' },
];
const cadenceOptions: Option[] = [
  { label: 'All cadences', value: 'ALL' }, { label: 'Daily', value: 'DAILY' }, { label: 'Weekly', value: 'WEEKLY' }, { label: 'Monthly', value: 'MONTHLY' }, { label: 'Interval (Cron)', value: 'CRON' }, { label: 'Ad-Hoc', value: 'ADHOC' },
];
const typeOptions: Option[] = [
  { label: 'All types', value: 'ALL' }, { label: 'Merchant settlement', value: 'MERCHANT_SETTLEMENT' }, { label: 'Vendor disbursement', value: 'SUPPLIER_PAYMENT' }, { label: 'Wallet top-up', value: 'WALLET_TRANSFER' }, { label: 'Recurring bill', value: 'BILL_PAYMENT' },
];

function DetailDrawer({ schedule, onClose }: { schedule: Schedule; onClose: () => void }) {
  const payload = { transaction_type: schedule.transactionType, amount_type: schedule.amount === 'Dynamic' ? 'DYNAMIC' : 'FIXED', currency: schedule.currency, source_reference: schedule.source, destination_reference: schedule.destination, timezone: schedule.timezone };
  return <aside aria-label={`Details for ${schedule.reference}`} className="w-full animate-[schedule-drawer_.3s_ease-out] overflow-y-auto rounded-2xl border border-brand-border bg-white shadow-sm lg:w-[40%] xl:w-[35%]">
    <div className="sticky top-0 z-10 flex items-start justify-between border-b border-brand-border bg-white p-5"><div><div className="flex flex-wrap items-center gap-2"><span className="rounded-lg bg-brand-subtle px-2 py-1 font-mono text-[10px] font-bold">{schedule.reference}</span><StatusBadge value={schedule.status} /></div><h3 className="mt-3 text-lg font-bold">{schedule.owner}</h3><p className="mt-1 text-xs text-brand-muted">{schedule.transactionType.replaceAll('_', ' ')}</p></div><button type="button" onClick={onClose} aria-label="Close schedule details" className="grid size-9 place-items-center rounded-full border border-brand-border text-brand-muted hover:bg-brand-subtle"><X className="size-4" /></button></div>
    <div className="space-y-5 p-5">
      <div className="grid grid-cols-2 gap-3"><div className="rounded-xl bg-brand-subtle p-3"><p className="text-[9px] font-bold uppercase tracking-wider text-brand-muted">Amount</p><p className="mt-1 text-sm font-bold">{schedule.amount} {schedule.amount !== 'Dynamic' && schedule.currency}</p></div><div className="rounded-xl bg-brand-subtle p-3"><p className="text-[9px] font-bold uppercase tracking-wider text-brand-muted">Version</p><p className="mt-1 text-sm font-bold">v{schedule.version}</p></div></div>
      <section><div className="flex items-center gap-2"><CalendarClock className="size-4 text-brand-muted" /><h4 className="text-xs font-bold">Schedule timing</h4></div><dl className="mt-3 space-y-3">{[['Cadence', schedule.cadence], ['Timezone', schedule.timezone], ['Next run', schedule.nextExecution], ['Last run', schedule.lastExecution ?? 'No execution yet'], ['Cron / rule', schedule.recurrenceRule ?? 'Service-derived recurrence']].map(([key, value]) => <div key={key} className="flex justify-between gap-4 border-b border-brand-border pb-3 text-xs last:border-0"><dt className="text-brand-muted">{key}</dt><dd className="text-right font-bold">{value}</dd></div>)}</dl></section>
      <div className="rounded-xl border border-brand-warning/20 bg-brand-warning-soft p-3"><div className="flex gap-2"><Clock3 className="mt-0.5 size-4 shrink-0 text-brand-warning" /><div><p className="text-xs font-bold">Next execution window</p><p className="mt-1 text-[11px] text-brand-muted">Scheduled for {schedule.nextExecution}. Exact countdown comes from the service clock in connected mode.</p></div></div></div>
      <section><div className="flex items-center gap-2"><Code2 className="size-4 text-brand-muted" /><h4 className="text-xs font-bold">Payload preview</h4></div><pre className="mt-3 overflow-x-auto rounded-xl bg-brand-primary p-4 text-[10px] leading-relaxed text-white">{JSON.stringify(payload, null, 2)}</pre></section>
      <section><h4 className="text-xs font-bold">Execution timeline</h4><div className="mt-3 space-y-0"><div className="flex gap-3"><span className="mt-1 size-2 rounded-full bg-brand-success" /><div className="border-l border-brand-border pb-5 pl-4"><p className="text-xs font-bold">Schedule created</p><p className="mt-1 text-[10px] text-brand-muted">{schedule.createdAt}</p></div></div><div className="flex gap-3"><span className="mt-1 size-2 rounded-full bg-brand-blue" /><div className="pl-4"><p className="text-xs font-bold">Awaiting next occurrence</p><p className="mt-1 text-[10px] text-brand-muted">Retry allowance: {schedule.policy?.maxBusinessRetries ?? 2}</p></div></div></div></section>
      <section><h4 className="mb-3 text-xs font-bold">Quick actions</h4><ScheduleActions reference={schedule.reference} initialStatus={schedule.status} /><button type="button" disabled title="The Swagger contract does not expose schedule editing" className="mt-2 inline-flex h-10 items-center gap-2 rounded-xl border border-brand-border px-4 text-xs font-bold opacity-40"><Pencil className="size-4" />Edit unavailable</button></section>
      <Link href={`/schedules/${schedule.id}`} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-brand-border py-3 text-xs font-bold">Open full schedule record<ChevronRight className="size-4" /></Link>
    </div>
  </aside>;
}

export function SchedulesWorkspace({ schedules }: { schedules?: Schedule[] }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('ALL');
  const [cadence, setCadence] = useState('ALL');
  const [type, setType] = useState('ALL');
  const [selected, setSelected] = useState<Schedule | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const { data: remoteData, isLoading, error } = useSchedules({
    search: query || undefined,
    status: status !== 'ALL' ? status : undefined,
    transaction_type: type !== 'ALL' ? type : undefined,
    page,
    limit: pageSize,
  });

  const closeDetail = () => setSelected(null);
  useEffect(() => { const close = (event: KeyboardEvent) => { if (event.key === 'Escape') closeDetail(); }; document.addEventListener('keydown', close); return () => document.removeEventListener('keydown', close); }, []);

  const items = useMemo(() => remoteData?.items ?? schedules ?? [], [remoteData?.items, schedules]);
  const filtered = useMemo(() => {
    if (remoteData) return items;
    return items.filter((item) => {
      const matchesQuery = `${item.reference} ${item.owner} ${item.transactionType}`.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === 'ALL' || item.status === status;
      const matchesCadence = cadence === 'ALL' || item.cadence.toUpperCase().startsWith(cadence);
      const matchesType = type === 'ALL' || item.transactionType === type;
      return matchesQuery && matchesStatus && matchesCadence && matchesType;
    });
  }, [remoteData, items, query, status, cadence, type]);

  const totalPages = remoteData?.totalPages ?? Math.max(1, Math.ceil(filtered.length / pageSize));
  const totalCount = remoteData?.totalItems ?? filtered.length;
  const visible = remoteData ? items : filtered.slice((page - 1) * pageSize, page * pageSize);

  const changeFilter = (setter: (value: string) => void) => (value: string) => { setter(value); setPage(1); };
  const movePage = (next: number) => { closeDetail(); setPage(Math.min(totalPages, Math.max(1, next))); };

  return <div className="space-y-4">
    <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">Search schedules</span>
        <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-brand-muted" />
        <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} onFocus={closeDetail} className="h-11 w-full rounded-xl border border-brand-field bg-white pl-10 pr-4 text-sm outline-none placeholder:text-brand-muted focus:border-brand-primary focus:ring-1 focus:ring-brand-primary" placeholder="Search by schedule, owner or transaction type" />
      </label>
      <div className="flex flex-wrap gap-2">
        <FilterPopover label="Status" value={status} options={statusOptions} onChange={changeFilter(setStatus)} onOpen={closeDetail} />
        <FilterPopover label="Cadence" value={cadence} options={cadenceOptions} onChange={changeFilter(setCadence)} onOpen={closeDetail} />
        <FilterPopover label="Transaction type" value={type} options={typeOptions} onChange={changeFilter(setType)} onOpen={closeDetail} />
      </div>
    </div>

    {error && (
      <div className="flex items-center gap-3 rounded-xl border border-brand-danger/20 bg-brand-danger-soft p-4 text-xs text-brand-danger">
        <AlertCircle className="size-4 shrink-0" />
        <p>Failed to load schedules from service: {error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    )}

    <div className="flex flex-col gap-4 lg:flex-row">
      <Panel className={`min-w-0 overflow-hidden transition-all duration-300 ease-in-out ${selected ? 'w-full lg:w-[60%] xl:w-[65%]' : 'w-full'}`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left">
            <thead>
              <tr className="bg-brand-subtle text-[10px] uppercase tracking-wider text-brand-muted">
                <th className="px-5 py-3.5">Schedule</th>
                <th className="px-5 py-3.5">Owner</th>
                <th className="px-5 py-3.5">Transaction</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Cadence</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5"><span className="sr-only">Inspect</span></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Loader2 className="mx-auto size-6 animate-spin text-brand-blue" />
                    <p className="mt-2 text-xs text-brand-muted">Loading schedules from TSS...</p>
                  </td>
                </tr>
              )}
              {!isLoading && visible.map((item) => (
                <tr key={item.id} tabIndex={0} onClick={() => setSelected(item)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelected(item); } }} className={`cursor-pointer border-t border-brand-border text-xs outline-none transition hover:bg-brand-subtle focus:bg-brand-subtle focus:ring-2 focus:ring-inset focus:ring-brand-primary ${selected?.id === item.id ? 'bg-brand-subtle' : ''}`}>
                  <td className="px-5 py-4"><p className="font-mono font-bold text-brand-primary">{item.reference}</p><p className="mt-1 text-[10px] text-brand-muted">Version {item.version}</p></td>
                  <td className="px-5 py-4"><p className="font-bold">{item.owner}</p><p className="mt-1 text-[10px] text-brand-muted">{item.ownerType}</p></td>
                  <td className="px-5 py-4 font-semibold">{item.transactionType.replaceAll('_',' ')}</td>
                  <td className="px-5 py-4 font-bold">{item.amount} <span className="text-[10px] text-brand-muted">{item.currency}</span></td>
                  <td className="px-5 py-4 text-brand-muted">{item.cadence}</td>
                  <td className="px-5 py-4"><StatusBadge value={item.status} /></td>
                  <td className="px-5 py-4"><button type="button" onClick={(event) => { event.stopPropagation(); setSelected(item); }} aria-label={`Inspect ${item.reference}`} className="grid size-8 place-items-center rounded-lg border border-transparent hover:border-brand-border hover:bg-white"><Eye className="size-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && !visible.length && (
            <div className="grid min-h-52 place-items-center p-8 text-center">
              <div>
                <Search className="mx-auto size-6 text-brand-muted" />
                <p className="mt-3 text-sm font-bold">No schedules found</p>
                <p className="mt-1 text-xs text-brand-muted">Try changing your search or filters.</p>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col items-center justify-between gap-3 border-t border-brand-border px-5 py-4 text-xs text-brand-muted sm:flex-row">
          <span>Showing {totalCount ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, totalCount)} of {totalCount} schedules</span>
          <div className="flex items-center gap-2">
            <button disabled={page === 1 || isLoading} onClick={() => movePage(page - 1)} className="grid size-8 place-items-center rounded-lg border border-brand-border disabled:opacity-35" aria-label="Previous page"><ChevronLeft className="size-4" /></button>
            <span className="rounded-lg bg-brand-primary px-3 py-2 text-[10px] font-bold text-white">{page} / {totalPages}</span>
            <button disabled={page === totalPages || isLoading} onClick={() => movePage(page + 1)} className="grid size-8 place-items-center rounded-lg border border-brand-border disabled:opacity-35" aria-label="Next page"><ChevronRight className="size-4" /></button>
          </div>
        </div>
      </Panel>
      {selected && <DetailDrawer schedule={selected} onClose={closeDetail} />}
    </div>
  </div>;
}
