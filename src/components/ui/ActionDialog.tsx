'use client';

import { AlertTriangle, CheckCircle2, X } from 'lucide-react';

export function ActionDialog({
  open,
  title,
  description,
  confirmLabel,
  destructive = false,
  reason,
  onReasonChange,
  reasonRequired = false,
  children,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  reason?: string;
  onReasonChange?: (value: string) => void;
  reasonRequired?: boolean;
  children?: React.ReactNode;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  const blocked = reasonRequired && !reason?.trim();
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/45 p-4" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby="action-dialog-title" className="w-full max-w-lg rounded-3xl border border-brand-border bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${destructive ? 'bg-brand-danger-soft text-brand-danger' : 'bg-brand-blue-soft text-brand-blue'}`}>
            {destructive ? <AlertTriangle className="size-5" /> : <CheckCircle2 className="size-5" />}
          </span>
          <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-full text-brand-muted hover:bg-brand-subtle" aria-label="Close dialog"><X className="size-4" /></button>
        </div>
        <h2 id="action-dialog-title" className="mt-5 text-xl font-bold tracking-[-.02em]">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-brand-muted">{description}</p>
        {onReasonChange && <label className="mt-5 block"><span className="text-xs font-bold">Reason {reasonRequired && <span className="text-brand-danger">*</span>}</span><textarea autoFocus value={reason} onChange={(event) => onReasonChange(event.target.value)} rows={4} className="mt-2 w-full resize-none rounded-xl border border-brand-field px-3.5 py-3 text-sm outline-none focus:border-brand-blue" placeholder="Add an operator reason for the audit trail" /></label>}
        {children}
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="h-10 rounded-xl border border-brand-border px-4 text-xs font-bold">Cancel</button>
          <button type="button" disabled={blocked} onClick={onConfirm} className={`h-10 rounded-xl px-4 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40 ${destructive ? 'bg-brand-danger' : 'bg-brand-primary'}`}>{confirmLabel}</button>
        </div>
      </section>
    </div>
  );
}

export function ActionToast({ message, onClose }: { message: string; onClose: () => void }) {
  return <div role="status" className="fixed bottom-6 right-6 z-[90] flex max-w-sm items-start gap-3 rounded-2xl border border-brand-success/20 bg-white p-4 shadow-xl"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand-success" /><div><p className="text-xs font-bold">Request accepted</p><p className="mt-1 text-xs leading-relaxed text-brand-muted">{message}</p></div><button type="button" onClick={onClose} aria-label="Dismiss notification" className="text-brand-muted"><X className="size-4" /></button></div>;
}
