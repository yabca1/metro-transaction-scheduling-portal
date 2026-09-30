import { RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { ExecutionsWorkspace } from '@/features/executions/ExecutionsWorkspace';
import { executions } from '@/features/_mock/data';

export default function ExecutionsPage() {
  return <div className="space-y-6"><PageHeader eyebrow="Execution ledger" title="Schedule executions" description="Trace every scheduled occurrence from dispatch through its authoritative financial outcome." action={<button className="inline-flex h-10 items-center gap-2 rounded-xl border border-brand-border px-4 text-xs font-bold"><RefreshCw className="size-4" />Refresh</button>} /><ExecutionsWorkspace executions={executions} /></div>;
}
