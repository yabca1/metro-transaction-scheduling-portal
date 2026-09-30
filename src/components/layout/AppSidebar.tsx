'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, CalendarClock, ClipboardList, FileClock, LayoutDashboard, PlusCircle, ShieldAlert } from 'lucide-react';
import { MetroLogo } from '@/components/brand/MetroLogo';

const sections = [
  { label: 'Overview', items: [{ label: 'Dashboard', href: '/', icon: LayoutDashboard }] },
  { label: 'Scheduling operations', items: [{ label: 'Schedules', href: '/schedules', icon: CalendarClock }, { label: 'Create schedule', href: '/schedules/new', icon: PlusCircle }, { label: 'Executions', href: '/executions', icon: FileClock }, { label: 'Manual review', href: '/manual-review', icon: ShieldAlert }] },
  { label: 'System', items: [{ label: 'Audit trail', href: '/audit', icon: ClipboardList }, { label: 'Service health', href: '/system/health', icon: Activity }] },
];

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <aside className="flex h-dvh w-[282px] flex-col bg-brand-page px-5 py-6">
      <Link href="/" className="px-3" onClick={onNavigate}><MetroLogo /></Link>
      <nav className="mt-10 flex-1 space-y-7 overflow-y-auto" aria-label="Primary navigation">
        {sections.map((section) => <section key={section.label}><h2 className="metro-kicker mb-2 px-3 text-[9.5px]">{section.label}</h2><div className="space-y-1">{section.items.map((item) => { const active = item.href === '/' ? pathname === '/' : item.href === '/schedules' ? pathname === '/schedules' || (pathname.startsWith('/schedules/') && pathname !== '/schedules/new') : pathname.startsWith(item.href); const Icon = item.icon; return <Link key={item.href} href={item.href} onClick={onNavigate} className={`flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition ${active ? 'bg-brand-primary text-brand-white shadow-sm font-semibold' : 'text-brand-muted hover:bg-brand-surface hover:text-brand-primary'}`}><Icon className="size-[18px]" />{item.label}{item.href === '/manual-review' && <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${active ? 'bg-white/15 text-white' : 'bg-brand-danger-soft text-brand-danger'}`}>3</span>}</Link>; })}</div></section>)}
      </nav>
      <div className="rounded-2xl border border-brand-border bg-white p-3.5"><div className="flex items-center gap-2 text-xs font-bold text-brand-success"><span className="size-2 rounded-full bg-brand-success" />TSS gateway connected</div><p className="mt-1.5 text-[10px] leading-relaxed text-brand-muted">Environment: Sandbox · API v1.0</p></div>
    </aside>
  );
}
