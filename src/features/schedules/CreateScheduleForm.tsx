'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, ArrowRight, CalendarClock, Check, Info, Loader2, Plus, ShieldCheck } from 'lucide-react';
import { Panel } from '@/components/ui/Panel';
import { useCreateSchedule } from './hooks/useSchedules';
import type { CreateScheduleRequestDTO } from './dto/schedule.dto';

const transactionTypes = ['WALLET_TRANSFER', 'BANK_TRANSFER', 'BILL_PAYMENT', 'SAVINGS_TRANSFER', 'MERCHANT_SETTLEMENT', 'SUPPLIER_PAYMENT', 'PAYROLL', 'BATCH_DISBURSEMENT', 'ACCOUNT_SWEEP'];
const scheduleTypes = ['ONCE', 'DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM_RECURRENCE'];
const inputClass = 'mt-2 h-11 w-full rounded-xl border border-brand-field bg-white px-3.5 text-sm outline-none transition focus:border-brand-blue';

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-xs font-bold">{label}{required && <span className="ml-1 text-brand-danger">*</span>}</span>{children}{hint && <span className="mt-1.5 block text-[10px] leading-relaxed text-brand-muted">{hint}</span>}</label>;
}

export function CreateScheduleForm() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [reference, setReference] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { mutateAsync: submitSchedule, isPending } = useCreateSchedule();

  const [values, setValues] = useState({
    transaction_type: 'WALLET_TRANSFER', amount_type: 'FIXED', amount: '', currency: 'ETB',
    source_type: 'WALLET', source_reference: '', destination_type: 'WALLET', destination_reference: '',
    schedule_type: 'ONCE', start_at: '', end_at: '', timezone: 'Africa/Addis_Ababa', recurrence_rule: '', purpose_code: '',
    business_day_policy: 'CALENDAR_DAY', holiday_adjustment: 'SKIP', insufficient_funds_policy: 'FAIL', missed_run_policy: 'SKIP', overlap_policy: 'BLOCK',
    business_retry_seconds: '0', max_business_retries: '0', missed_run_grace_seconds: '300', metadata_key: '', metadata_value: '',
  });

  const update = (name: string, value: string) => setValues((current) => ({ ...current, [name]: value }));
  function review(event: FormEvent) { event.preventDefault(); setErrorMsg(null); setStep(2); window.scrollTo({ top: 0, behavior: 'smooth' }); }

  async function create() {
    setErrorMsg(null);
    try {
      let formattedStartAt = values.start_at;
      if (values.start_at && !values.start_at.includes('T')) {
        formattedStartAt = `${values.start_at}T00:00:00`;
      }
      if (values.start_at) {
        try {
          formattedStartAt = new Date(values.start_at).toISOString();
        } catch {
          // Keep raw format if invalid
        }
      }

      let formattedEndAt: string | undefined = undefined;
      if (values.end_at) {
        try {
          formattedEndAt = new Date(values.end_at).toISOString();
        } catch {
          formattedEndAt = values.end_at;
        }
      }

      const payload: CreateScheduleRequestDTO = {
        transaction_type: values.transaction_type,
        amount_type: values.amount_type as 'FIXED' | 'DYNAMIC',
        amount: values.amount_type === 'FIXED' ? values.amount : undefined,
        currency: values.currency,
        source_type: values.source_type,
        source_reference: values.source_reference,
        destination_type: values.destination_type,
        destination_reference: values.destination_reference,
        schedule_type: values.schedule_type,
        start_at: formattedStartAt,
        end_at: formattedEndAt,
        timezone: values.timezone,
        recurrence_rule: values.recurrence_rule || undefined,
        purpose_code: values.purpose_code || undefined,
        policy: {
          business_day: values.business_day_policy,
          holiday_adjustment: values.holiday_adjustment,
          insufficient_funds: values.insufficient_funds_policy,
          missed_run: values.missed_run_policy,
          missed_run_grace_seconds: Number(values.missed_run_grace_seconds) || 300,
          overlap: values.overlap_policy,
          max_business_retries: Number(values.max_business_retries) || 0,
          business_retry_seconds: Number(values.business_retry_seconds) || 0,
        },
        metadata: values.metadata_key ? { [values.metadata_key]: values.metadata_value } : undefined,
      };

      const result = await submitSchedule(payload);
      setReference(result.reference);
      setStep(3);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create schedule';
      setErrorMsg(msg);
    }
  }

  if (step === 3) return <div className="mx-auto max-w-2xl py-10 text-center"><span className="mx-auto grid size-16 place-items-center rounded-3xl bg-brand-success-soft text-brand-success"><Check className="size-7" /></span><p className="mt-6 text-[10px] font-bold uppercase tracking-[.18em] text-brand-success">Request accepted</p><h2 className="mt-2 text-3xl font-bold tracking-[-.03em]">Schedule submitted</h2><p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-brand-muted">The creation request has been processed and accepted by the Transaction Scheduling Service. The reference below is authoritative.</p><div className="mx-auto mt-6 rounded-2xl border border-brand-border bg-brand-subtle p-4"><p className="text-[10px] font-bold uppercase text-brand-muted">Authoritative reference</p><p className="mt-1 font-mono text-sm font-bold text-brand-blue">{reference}</p></div><div className="mt-7 flex justify-center gap-2"><Link href="/schedules" className="inline-flex h-11 items-center rounded-xl border border-brand-border px-5 text-xs font-bold">Back to schedules</Link><button onClick={() => { setStep(1); setErrorMsg(null); }} className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-primary px-5 text-xs font-bold text-white"><Plus className="size-4" />Create another</button></div></div>;

  if (step === 2) {
    const groups = [
      ['Instruction', [['Transaction type', values.transaction_type], ['Amount type', values.amount_type], ['Amount', values.amount_type === 'DYNAMIC' ? 'Dynamic' : `${values.amount} ${values.currency}`], ['Purpose code', values.purpose_code || 'Not provided']]],
      ['Money route', [['Source', `${values.source_type} · ${values.source_reference}`], ['Destination', `${values.destination_type} · ${values.destination_reference}`]]],
      ['Timing', [['Schedule type', values.schedule_type], ['Starts', values.start_at], ['Ends', values.end_at || 'No end date'], ['Timezone', values.timezone], ['Recurrence rule', values.recurrence_rule || 'Not required']]],
      ['Execution policy', [['Business days', values.business_day_policy], ['Holiday adjustment', values.holiday_adjustment], ['Insufficient funds', values.insufficient_funds_policy], ['Missed runs', values.missed_run_policy], ['Overlap', values.overlap_policy]]],
    ] as const;
    return <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button disabled={isPending} onClick={() => setStep(1)} className="grid size-9 place-items-center rounded-full border border-brand-border disabled:opacity-40" aria-label="Back to edit"><ArrowLeft className="size-4" /></button>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-brand-blue">Step 2 of 2</p>
          <h2 className="text-2xl font-bold">Review schedule</h2>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-start gap-3 rounded-2xl border border-brand-danger/20 bg-brand-danger-soft p-4 text-xs text-brand-danger">
          <AlertCircle className="size-5 shrink-0" />
          <div>
            <p className="font-bold">Creation error</p>
            <p className="mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-brand-warning/20 bg-brand-warning-soft p-4 text-sm">
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand-warning" />
          <div>
            <p className="font-bold">Confirm the financial instruction</p>
            <p className="mt-1 text-xs leading-relaxed text-brand-muted">Verify source, destination, amount, timing, and exception policy before submission. Creation does not mean an execution has completed.</p>
          </div>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {groups.map(([title, rows]) => (
          <Panel key={title} className="p-5">
            <h3 className="text-sm font-bold">{title}</h3>
            <dl className="mt-4 space-y-3">
              {rows.map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 border-t border-brand-border pt-3 first:border-0 first:pt-0">
                  <dt className="text-xs text-brand-muted">{label}</dt>
                  <dd className="max-w-[60%] text-right text-xs font-bold">{value.replaceAll('_', ' ')}</dd>
                </div>
              ))}
            </dl>
          </Panel>
        ))}
      </div>
      <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row">
        <button disabled={isPending} onClick={() => setStep(1)} className="h-11 rounded-xl border border-brand-border px-5 text-xs font-bold disabled:opacity-40">Edit details</button>
        <button disabled={isPending} onClick={create} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 text-xs font-bold text-white disabled:opacity-50">
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
          {isPending ? 'Submitting to TSS...' : 'Confirm and create'}
        </button>
      </div>
    </div>;
  }

  return <form onSubmit={review} className="space-y-5">
    <div className="rounded-2xl border border-brand-blue/15 bg-brand-blue-soft p-4"><div className="flex gap-3"><Info className="mt-0.5 size-5 shrink-0 text-brand-blue" /><div><p className="text-xs font-bold">Contract-guided schedule creation</p><p className="mt-1 text-xs leading-relaxed text-brand-muted">Required fields and policy options come directly from the Transaction Scheduling Service v1 Swagger contract.</p></div></div></div>
    <Panel className="p-5 sm:p-6"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-brand-blue-soft text-brand-blue"><span className="text-xs font-bold">01</span></span><div><h3 className="text-sm font-bold">Transaction instruction</h3><p className="text-xs text-brand-muted">Define what the service should execute.</p></div></div><div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"><Field label="Transaction type" required><select value={values.transaction_type} onChange={(e) => update('transaction_type', e.target.value)} className={inputClass}>{transactionTypes.map((value) => <option key={value}>{value}</option>)}</select></Field><Field label="Amount type" required><select value={values.amount_type} onChange={(e) => update('amount_type', e.target.value)} className={inputClass}><option>FIXED</option><option>DYNAMIC</option></select></Field><Field label="Amount" required={values.amount_type === 'FIXED'} hint="Decimal string; omit for dynamic schedules"><div className="relative"><input required={values.amount_type === 'FIXED'} disabled={values.amount_type === 'DYNAMIC'} inputMode="decimal" pattern="^\d+(\.\d{1,2})?$" value={values.amount} onChange={(e) => update('amount', e.target.value)} placeholder="150.00" className={`${inputClass} pr-14 disabled:bg-brand-subtle`} /><span className="absolute right-3 top-[22px] text-[10px] font-bold text-brand-muted">{values.currency}</span></div></Field><Field label="Currency" required><input required maxLength={3} value={values.currency} onChange={(e) => update('currency', e.target.value.toUpperCase())} className={inputClass} /></Field><Field label="Purpose code"><input value={values.purpose_code} onChange={(e) => update('purpose_code', e.target.value)} placeholder="e.g. SUPPLIER_PAYMENT" className={inputClass} /></Field></div></Panel>
    <Panel className="p-5 sm:p-6"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-brand-blue-soft text-brand-blue"><span className="text-xs font-bold">02</span></span><div><h3 className="text-sm font-bold">Source and destination</h3><p className="text-xs text-brand-muted">References are passed to the execution domain unchanged.</p></div></div><div className="mt-6 grid gap-5 sm:grid-cols-2"><Field label="Source type"><input value={values.source_type} onChange={(e) => update('source_type', e.target.value)} className={inputClass} /></Field><Field label="Source reference" required><input required value={values.source_reference} onChange={(e) => update('source_reference', e.target.value)} placeholder="251911000001" className={inputClass} /></Field><Field label="Destination type"><input value={values.destination_type} onChange={(e) => update('destination_type', e.target.value)} className={inputClass} /></Field><Field label="Destination reference" required><input required value={values.destination_reference} onChange={(e) => update('destination_reference', e.target.value)} placeholder="251911000002" className={inputClass} /></Field></div></Panel>
    <Panel className="p-5 sm:p-6"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-brand-blue-soft text-brand-blue"><CalendarClock className="size-4" /></span><div><h3 className="text-sm font-bold">Schedule and recurrence</h3><p className="text-xs text-brand-muted">Dates are interpreted in the selected IANA timezone.</p></div></div><div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"><Field label="Schedule type" required><select value={values.schedule_type} onChange={(e) => update('schedule_type', e.target.value)} className={inputClass}>{scheduleTypes.map((value) => <option key={value}>{value}</option>)}</select></Field><Field label="Start at" required><input required type="datetime-local" value={values.start_at} onChange={(e) => update('start_at', e.target.value)} className={inputClass} /></Field><Field label="End at"><input type="datetime-local" value={values.end_at} onChange={(e) => update('end_at', e.target.value)} className={inputClass} /></Field><Field label="Timezone" required><select value={values.timezone} onChange={(e) => update('timezone', e.target.value)} className={inputClass}><option>Africa/Addis_Ababa</option><option>UTC</option></select></Field><Field label="Recurrence rule" required={values.schedule_type === 'CUSTOM_RECURRENCE'} hint="Required by the workflow for custom recurrence"><input required={values.schedule_type === 'CUSTOM_RECURRENCE'} value={values.recurrence_rule} onChange={(e) => update('recurrence_rule', e.target.value)} placeholder="FREQ=WEEKLY;BYDAY=MO,FR" className={inputClass} /></Field></div></Panel>
    <Panel className="p-5 sm:p-6"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-brand-blue-soft text-brand-blue"><ShieldCheck className="size-4" /></span><div><h3 className="text-sm font-bold">Execution policy</h3><p className="text-xs text-brand-muted">Choose explicit handling for holidays, insufficient funds, missed runs, and overlaps.</p></div></div><div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"><Field label="Business-day policy"><select value={values.business_day_policy} onChange={(e) => update('business_day_policy', e.target.value)} className={inputClass}><option>CALENDAR_DAY</option><option>BUSINESS_DAY</option></select></Field><Field label="Holiday adjustment"><select value={values.holiday_adjustment} onChange={(e) => update('holiday_adjustment', e.target.value)} className={inputClass}><option>NEXT_BUSINESS_DAY</option><option>PREVIOUS_BUSINESS_DAY</option><option>SKIP</option></select></Field><Field label="Insufficient-funds policy"><select value={values.insufficient_funds_policy} onChange={(e) => update('insufficient_funds_policy', e.target.value)} className={inputClass}><option>FAIL</option><option>RETRY</option><option>SKIP</option></select></Field><Field label="Missed-run policy"><select value={values.missed_run_policy} onChange={(e) => update('missed_run_policy', e.target.value)} className={inputClass}><option>EXECUTE_IMMEDIATELY</option><option>SKIP</option><option>MANUAL_REVIEW</option></select></Field><Field label="Overlap policy"><select value={values.overlap_policy} onChange={(e) => update('overlap_policy', e.target.value)} className={inputClass}><option>BLOCK</option><option>QUEUE</option><option>ALLOW</option><option>SKIP</option></select></Field><Field label="Missed-run grace (seconds)"><input min="0" type="number" value={values.missed_run_grace_seconds} onChange={(e) => update('missed_run_grace_seconds', e.target.value)} className={inputClass} /></Field><Field label="Maximum business retries"><input min="0" type="number" value={values.max_business_retries} onChange={(e) => update('max_business_retries', e.target.value)} className={inputClass} /></Field><Field label="Retry delay (seconds)"><input min="0" type="number" value={values.business_retry_seconds} onChange={(e) => update('business_retry_seconds', e.target.value)} className={inputClass} /></Field></div></Panel>
    <Panel className="p-5 sm:p-6"><h3 className="text-sm font-bold">Optional metadata</h3><p className="mt-1 text-xs text-brand-muted">Attach one preview key-value pair. Connected mode can support the contract&apos;s complete metadata map.</p><div className="mt-5 grid gap-5 sm:grid-cols-2"><Field label="Metadata key"><input value={values.metadata_key} onChange={(e) => update('metadata_key', e.target.value)} placeholder="invoice_reference" className={inputClass} /></Field><Field label="Metadata value"><input value={values.metadata_value} onChange={(e) => update('metadata_value', e.target.value)} placeholder="INV-2026-0042" className={inputClass} /></Field></div></Panel>
    <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row"><Link href="/schedules" className="inline-flex h-11 items-center justify-center rounded-xl border border-brand-border px-5 text-xs font-bold">Cancel</Link><button type="submit" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 text-xs font-bold text-white">Review schedule<ArrowRight className="size-4" /></button></div>
  </form>;
}
