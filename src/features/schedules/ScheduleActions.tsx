'use client';

import { useState } from 'react';
import { Ban, CirclePlay, PauseCircle, PlayCircle, ShieldAlert, ShieldCheck } from 'lucide-react';
import { ActionDialog, ActionToast } from '@/components/ui/ActionDialog';
import type { ScheduleStatus } from '@/features/_mock/data';
import { useScheduleAction } from './hooks/useSchedules';

type ActionName = 'pause' | 'resume' | 'cancel' | 'execute' | 'suspend' | 'unsuspend';

const copy: Record<ActionName, { title: string; description: string; confirm: string }> = {
  pause: { title: 'Pause this schedule?', description: 'Future occurrences will not dispatch until the schedule is resumed.', confirm: 'Pause schedule' },
  resume: { title: 'Resume this schedule?', description: 'The service will calculate the next occurrence from the authoritative recurrence rule.', confirm: 'Resume schedule' },
  cancel: { title: 'Cancel this schedule permanently?', description: 'Cancellation stops future occurrences and cannot be reversed from this API.', confirm: 'Cancel schedule' },
  execute: { title: 'Execute this schedule now?', description: 'This creates a new execution request. A unique idempotency key will protect against duplicate submission.', confirm: 'Execute now' },
  suspend: { title: 'Suspend this schedule?', description: 'Management suspension blocks execution while an operator investigation is active.', confirm: 'Suspend schedule' },
  unsuspend: { title: 'Lift suspension on this schedule?', description: 'Transitions schedule back to ACTIVE state following resolution of investigation.', confirm: 'Unsuspend schedule' },
};

export function ScheduleActions({ reference, initialStatus }: { reference: string; initialStatus: ScheduleStatus }) {
  const [status, setStatus] = useState(initialStatus);
  const [action, setAction] = useState<ActionName | null>(null);
  const [reason, setReason] = useState('');
  const [toast, setToast] = useState('');
  const [key, setKey] = useState('');
  const inactive = ['CANCELLED', 'COMPLETED'].includes(status);

  const { mutateAsync: executeAction, isPending } = useScheduleAction();

  const openAction = (nextAction: ActionName) => {
    if (nextAction === 'execute') setKey(`tss-${reference.toLowerCase()}-${crypto.randomUUID()}`.slice(0, 128));
    setAction(nextAction);
  };

  async function confirm() {
    if (!action) return;
    try {
      await executeAction({ action, reference, id: reference, reason });
      if (action === 'pause') setStatus('PAUSED');
      if (action === 'resume') setStatus('ACTIVE');
      if (action === 'cancel') setStatus('CANCELLED');
      if (action === 'suspend') setStatus('SUSPENDED');
      if (action === 'unsuspend') setStatus('ACTIVE');
      setToast(`${copy[action].confirm} was accepted for ${reference}. Authoritative update recorded.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed';
      setToast(`Failed to ${action} schedule: ${msg}`);
    } finally {
      setAction(null);
      setReason('');
    }
  }

  const item = action ? copy[action] : null;
  return <>
    <div className="flex flex-wrap gap-2">
      {status === 'ACTIVE' && <button disabled={isPending} onClick={() => openAction('pause')} className="inline-flex h-10 items-center gap-2 rounded-xl border border-brand-border bg-white px-4 text-xs font-bold disabled:opacity-50"><PauseCircle className="size-4" />Pause</button>}
      {status === 'PAUSED' && <button disabled={isPending} onClick={() => openAction('resume')} className="inline-flex h-10 items-center gap-2 rounded-xl border border-brand-border bg-white px-4 text-xs font-bold disabled:opacity-50"><PlayCircle className="size-4" />Resume</button>}
      {status === 'SUSPENDED' && <button disabled={isPending} onClick={() => openAction('unsuspend')} className="inline-flex h-10 items-center gap-2 rounded-xl border border-brand-success/30 bg-brand-success-soft px-4 text-xs font-bold text-brand-success disabled:opacity-50"><ShieldCheck className="size-4" />Unsuspend</button>}
      <button disabled={inactive || isPending} onClick={() => openAction('execute')} className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-primary px-4 text-xs font-bold text-white disabled:opacity-40"><CirclePlay className="size-4" />Execute now</button>
      <button disabled={inactive || status === 'SUSPENDED' || isPending} onClick={() => openAction('suspend')} className="inline-flex h-10 items-center gap-2 rounded-xl border border-brand-warning/30 bg-brand-warning-soft px-4 text-xs font-bold text-brand-warning disabled:opacity-40"><ShieldAlert className="size-4" />Suspend</button>
      <button disabled={inactive || isPending} onClick={() => openAction('cancel')} className="inline-flex h-10 items-center gap-2 rounded-xl border border-brand-danger/20 bg-white px-4 text-xs font-bold text-brand-danger disabled:opacity-40"><Ban className="size-4" />Cancel</button>
    </div>
    {item && <ActionDialog open title={item.title} description={item.description} confirmLabel={item.confirm} destructive={action === 'cancel' || action === 'suspend'} reason={reason} onReasonChange={action === 'suspend' || action === 'unsuspend' ? setReason : undefined} reasonRequired={action === 'suspend' || action === 'unsuspend'} onClose={() => { setAction(null); setReason(''); }} onConfirm={confirm}>{action === 'execute' && <div className="mt-5 rounded-xl border border-brand-border bg-brand-subtle p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Idempotency key</p><p className="mt-1 break-all font-mono text-[11px] font-bold">{key}</p></div>}</ActionDialog>}
    {toast && <ActionToast message={toast} onClose={() => setToast('')} />}
  </>;
}
