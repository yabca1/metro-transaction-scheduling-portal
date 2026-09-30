import Link from 'next/link';
import { Download, Plus } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { SchedulesWorkspace } from '@/features/schedules/SchedulesWorkspace';
import { schedules } from '@/features/_mock/data';

export default function SchedulesPage() {
  return <div className="space-y-6"><PageHeader eyebrow="Global schedule registry" title="All transaction schedules" description="Search, filter, and inspect schedules without leaving the registry. Operator actions remain permission-controlled." action={<div className="flex gap-2"><button className="inline-flex h-10 items-center gap-2 rounded-xl border border-brand-border px-4 text-xs font-bold"><Download className="size-4" />Export</button><Link href="/schedules/new" className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-primary px-4 text-xs font-bold text-white"><Plus className="size-4" />New schedule</Link></div>} /><SchedulesWorkspace schedules={schedules} /></div>;
}
