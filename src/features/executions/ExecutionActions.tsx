'use client';

import { useState } from 'react';
import { RotateCcw, ShieldAlert, SkipForward } from 'lucide-react';
import { ActionDialog, ActionToast } from '@/components/ui/ActionDialog';
import type { ExecutionStatus } from '@/features/_mock/data';
import { useExecutionAction } from './hooks/useExecutions';

type ExecutionAction = 'retry' | 'skip' | 'escalate';
const actionCopy = {
  retry: ['Retry execution?', 'Request another attempt only after the current outcome is authoritative.', 'Request retry'],
  skip: ['Skip execution?', 'The occurrence will be recorded as skipped and will not move funds.', 'Skip execution'],
  escalate: ['Escalate for manual review?', 'Send this execution to the operations review queue with your reason.', 'Escalate execution'],
} as const;

export function ExecutionActions({ reference, status }: { reference: string; status: ExecutionStatus }) {
  const [action, setAction] = useState<ExecutionAction | null>(null);
  const [reason, setReason] = useState('');
  const [toast, setToast] = useState('');
  const eligible = ['FAILED', 'ESCALATED', 'SCHEDULED'].includes(status);
  const details = action ? actionCopy[action] : null;

  const { mutateAsync: executeAction, isPending } = useExecutionAction();

  const complete = async () => {
    if (!action) return;
    try {
      await executeAction({ action, id: reference, reason });
      setToast(`${actionCopy[action][2]} was accepted for ${reference}. Authoritative transition recorded.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed';
      setToast(`Failed to ${action} execution: ${msg}`);
    } finally {
      setAction(null);
      setReason('');
    }
  };

  return <>
    <div className="flex flex-wrap gap-2">
      <button disabled={!eligible || isPending} onClick={() => setAction('retry')} className="inline-flex h-10 items-center gap-2 rounded-xl border border-brand-border bg-white px-4 text-xs font-bold disabled:opacity-40"><RotateCcw className="size-4" />Retry</button>
      <button disabled={!eligible || isPending} onClick={() => setAction('skip')} className="inline-flex h-10 items-center gap-2 rounded-xl border border-brand-border bg-white px-4 text-xs font-bold disabled:opacity-40"><SkipForward className="size-4" />Skip</button>
      <button disabled={!eligible || isPending} onClick={() => setAction('escalate')} className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-primary px-4 text-xs font-bold text-white disabled:opacity-40"><ShieldAlert className="size-4" />Escalate</button>
    </div>
    {details && <ActionDialog open title={details[0]} description={details[1]} confirmLabel={details[2]} destructive={action === 'skip'} reason={reason} onReasonChange={setReason} onClose={() => { setAction(null); setReason(''); }} onConfirm={complete} />}
    {toast && <ActionToast message={toast} onClose={() => setToast('')} />}
  </>;
}
