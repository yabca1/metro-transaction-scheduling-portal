import { CheckCircle2, Clock3, Database, RadioTower, Server } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { HealthStatusControl } from '@/features/health/HealthStatusControl';

const services = [
  { name: 'Transaction Scheduling Service', detail: 'API and orchestration', icon: Server, latency: '84 ms', version: 'v1.0.0' },
  { name: 'Execution dispatcher', detail: 'Durable occurrence dispatch', icon: RadioTower, latency: '42 ms', version: 'v2.8.1' },
  { name: 'Schedule database', detail: 'Primary state authority', icon: Database, latency: '18 ms', version: 'PostgreSQL 16' },
];

export default function HealthPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Platform readiness" title="Service health" description="Live readiness, latency and deployed-version visibility for scheduling dependencies." action={<HealthStatusControl />} />
      <div className="grid gap-3 sm:grid-cols-3">
        <Panel className="p-5"><p className="text-xs font-semibold text-brand-muted">Availability · 30 days</p><p className="mt-2 text-3xl font-bold">99.98%</p><p className="mt-3 text-[11px] text-brand-success">Within SLO</p></Panel>
        <Panel className="p-5"><p className="text-xs font-semibold text-brand-muted">P95 API latency</p><p className="mt-2 text-3xl font-bold">126 ms</p><p className="mt-3 text-[11px] text-brand-success">Healthy</p></Panel>
        <Panel className="p-5"><p className="text-xs font-semibold text-brand-muted">Dispatch lag</p><p className="mt-2 text-3xl font-bold">1.8 sec</p><p className="mt-3 text-[11px] text-brand-success">Below 5 sec threshold</p></Panel>
      </div>
      <Panel className="overflow-hidden">
        <div className="border-b border-brand-border p-5"><h3 className="text-sm font-bold">Dependencies</h3><p className="mt-1 text-xs text-brand-muted">Last checked Sep 23, 2026 · 06:52 EAT</p></div>
        <div className="divide-y divide-brand-border">{services.map(({ name, detail, icon: Icon, latency, version }) => <div key={name} className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-brand-blue-soft text-brand-blue"><Icon className="size-5" /></span><div><p className="text-sm font-bold">{name}</p><p className="mt-1 text-xs text-brand-muted">{detail}</p></div></div><div className="flex flex-wrap items-center gap-6"><div><p className="text-[9px] font-bold uppercase text-brand-muted">Latency</p><p className="mt-1 text-xs font-bold">{latency}</p></div><div><p className="text-[9px] font-bold uppercase text-brand-muted">Version</p><p className="mt-1 text-xs font-bold">{version}</p></div><span className="inline-flex items-center gap-1.5 rounded-full border border-brand-success/20 bg-brand-success-soft px-2.5 py-1 text-[10px] font-bold text-brand-success"><CheckCircle2 className="size-3" />READY</span></div></div>)}</div>
      </Panel>
      <div className="rounded-2xl border border-brand-warning/20 bg-brand-warning-soft p-4"><div className="flex gap-3"><Clock3 className="mt-0.5 size-5 text-brand-warning" /><div><p className="text-xs font-bold text-brand-warning">Contract dependency outstanding</p><p className="mt-1 text-xs leading-relaxed text-brand-muted">The Swagger does not yet expose health or aggregate overview endpoints. Values on this screen are approved UI fixtures until those contracts are added.</p></div></div></div>
    </div>
  );
}
