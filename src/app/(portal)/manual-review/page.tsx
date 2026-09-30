import { PageHeader } from '@/components/shared/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { ManualReviewWorkspace } from '@/features/operations/ManualReviewWorkspace';
import { executions } from '@/features/_mock/data';

export default function ManualReviewPage() {
  const queue = executions.filter((item) => ['FAILED', 'ESCALATED', 'PROCESSING'].includes(item.status));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Controlled intervention"
        title="Manual review queue"
        description="Investigate unresolved executions before using the contract-backed retry, skip or escalation workflow on the execution detail screen."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Panel className="p-5"><p className="text-xs font-semibold text-brand-muted">Awaiting decision</p><p className="mt-2 text-3xl font-bold">3</p><p className="mt-3 text-[11px] text-brand-warning">Oldest: 2h 18m</p></Panel>
        <Panel className="p-5"><p className="text-xs font-semibold text-brand-muted">High-value exposure</p><p className="mt-2 text-3xl font-bold">386K <span className="text-sm">ETB</span></p><p className="mt-3 text-[11px] text-brand-danger">Payroll batch under review</p></Panel>
        <Panel className="p-5"><p className="text-xs font-semibold text-brand-muted">SLA compliance</p><p className="mt-2 text-3xl font-bold">96.2%</p><p className="mt-3 text-[11px] text-brand-success">Within 4-hour target</p></Panel>
      </div>

      <ManualReviewWorkspace executions={queue} />
    </div>
  );
}
