'use client';

import { useState } from 'react';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="flex h-dvh overflow-hidden bg-brand-page">
      <div className="hidden lg:block"><AppSidebar /></div>
      {mobileOpen && <div className="fixed inset-0 z-50 lg:hidden"><button type="button" className="absolute inset-0 bg-slate-950/35" aria-label="Close navigation" onClick={() => setMobileOpen(false)} /><div className="absolute inset-y-0 left-0 shadow-2xl"><AppSidebar onNavigate={() => setMobileOpen(false)} /></div></div>}
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader onMenuClick={() => setMobileOpen(true)} />
        <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 sm:px-6 lg:px-8 lg:pb-6"><div className="mx-auto min-h-full max-w-[1600px] rounded-[28px] border border-brand-border bg-brand-surface p-4 shadow-[0_18px_50px_rgba(22,34,54,.06)] sm:p-6 lg:p-8">{children}</div></main>
      </div>
    </div>
  );
}
