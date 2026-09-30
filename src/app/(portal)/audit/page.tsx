import { Download } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { AuditWorkspace } from '@/features/audit/AuditWorkspace';
import { auditEvents } from '@/features/_mock/data';

export default function AuditPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Immutable evidence"
        title="Operator audit trail"
        description="Trace who acted, what changed, why it changed and the resulting outcome."
        action={<button className="inline-flex h-10 items-center gap-2 rounded-xl border border-brand-border px-4 text-xs font-bold"><Download className="size-4" />Export evidence</button>}
      />
      <AuditWorkspace events={auditEvents} />
    </div>
  );
}
