'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, Search, UserRound } from 'lucide-react';
import { GlobalSearchModal } from '@/features/search/GlobalSearchModal';
import { NotificationDropdown } from '@/features/notifications/NotificationDropdown';

function titleFor(pathname: string) {
  if (pathname === '/schedules/new') return 'Create schedule'; if (pathname.startsWith('/schedules/')) return 'Schedule details'; if (pathname === '/schedules') return 'Schedules';
  if (pathname.startsWith('/executions/')) return 'Execution details'; if (pathname === '/executions') return 'Executions';
  if (pathname === '/manual-review') return 'Manual review'; if (pathname === '/audit') return 'Audit trail'; if (pathname === '/system/health') return 'Service health'; return 'Operations overview';
}

export function AppHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  useEffect(() => { const shortcut = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setSearchOpen((value) => !value); } }; document.addEventListener('keydown', shortcut); return () => document.removeEventListener('keydown', shortcut); }, []);
  return <><header className="flex h-[92px] items-center justify-between gap-3 px-4 sm:px-6 lg:h-[108px] lg:px-8"><div className="flex min-w-0 items-center gap-3"><button type="button" onClick={onMenuClick} className="grid size-10 place-items-center rounded-full border border-brand-border bg-white lg:hidden" aria-label="Open navigation"><Menu className="size-5" /></button><div><p className="metro-kicker text-[10px]">Transaction scheduling</p><h1 className="truncate font-protest-strike text-2xl tracking-normal text-brand-primary sm:text-[28px]">{titleFor(pathname)}</h1></div></div><div className="flex items-center gap-2.5"><button type="button" onClick={() => setSearchOpen(true)} className="hidden h-10 items-center gap-2 rounded-full border border-brand-border bg-white px-4 text-xs text-brand-muted shadow-sm md:flex"><Search className="size-4" />Search portal<span className="ml-2 rounded border border-brand-border bg-brand-subtle px-1.5 py-0.5 font-mono text-[9px]">⌘K</span></button><NotificationDropdown /><button type="button" className="flex h-10 items-center gap-2 rounded-full border border-brand-border bg-white pl-1 pr-3 shadow-sm" aria-label="Operator profile"><span className="grid size-8 place-items-center rounded-full bg-brand-blue-soft text-brand-blue"><UserRound className="size-4" /></span><span className="hidden text-left sm:block"><span className="block text-[11px] font-bold text-brand-primary">Marta Bekele</span><span className="block text-[9px] text-brand-muted">Operations lead</span></span><ChevronDown className="hidden size-3.5 text-brand-muted sm:block" /></button></div></header><GlobalSearchModal open={searchOpen} onOpenChange={setSearchOpen} /></>;
}
