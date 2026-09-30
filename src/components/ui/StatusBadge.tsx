import { AlertCircle, CheckCircle2, Clock3, PauseCircle, ShieldAlert, XCircle } from 'lucide-react';

const styles: Record<string, string> = {
  ACTIVE: 'bg-brand-success-soft text-brand-success border-brand-success/20', SUCCEEDED: 'bg-brand-success-soft text-brand-success border-brand-success/20', COMPLETED: 'bg-brand-success-soft text-brand-success border-brand-success/20',
  PAUSED: 'bg-brand-warning-soft text-brand-warning border-brand-warning/20', SCHEDULED: 'bg-brand-blue-soft text-brand-blue border-brand-blue/20', PROCESSING: 'bg-brand-blue-soft text-brand-blue border-brand-blue/20',
  SUSPENDED: 'bg-brand-danger-soft text-brand-danger border-brand-danger/20', FAILED: 'bg-brand-danger-soft text-brand-danger border-brand-danger/20', ESCALATED: 'bg-brand-danger-soft text-brand-danger border-brand-danger/20',
  CANCELLED: 'bg-brand-subtle text-brand-muted border-brand-border', SKIPPED: 'bg-brand-subtle text-brand-muted border-brand-border',
};

function StatusIcon({ value }: { value: string }) {
  if (['ACTIVE', 'SUCCEEDED', 'COMPLETED'].includes(value)) return <CheckCircle2 className="size-3" />;
  if (value === 'PAUSED') return <PauseCircle className="size-3" />;
  if (['FAILED', 'SUSPENDED'].includes(value)) return <XCircle className="size-3" />;
  if (value === 'ESCALATED') return <ShieldAlert className="size-3" />;
  if (['SCHEDULED', 'PROCESSING'].includes(value)) return <Clock3 className="size-3" />;
  return <AlertCircle className="size-3" />;
}

export function StatusBadge({ value }: { value: string }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${styles[value] || styles.CANCELLED}`}><StatusIcon value={value} />{value.replaceAll('_', ' ')}</span>;
}
