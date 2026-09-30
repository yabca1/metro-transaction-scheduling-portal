'use client';

import Link from 'next/link';
import { Activity, ArrowRight, ArrowUpRight, CalendarCheck2, CircleAlert, Clock3, Pause, Play, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { executions, schedules } from '@/features/_mock/data';
import { useDashboardStats, useServiceHealth } from './hooks/useDashboard';

const tones = {
  blue: 'bg-brand-blue-soft text-brand-blue',
  amber: 'bg-brand-warning-soft text-brand-warning',
  red: 'bg-brand-danger-soft text-brand-danger',
  green: 'bg-brand-success-soft text-brand-success',
};

export function DashboardOverview() {
  const { data: stats } = useDashboardStats();
  const { data: health } = useServiceHealth();

  const attention = executions.filter((item) => ['FAILED', 'ESCALATED'].includes(item.status));

  const activeCount = stats?.active_schedules_count ?? 1248;
  const failedCount = stats?.today_failed_executions_count ?? 14;
  const todayCount = stats?.today_executions_count ?? 2480;
  const escalatedCount = stats?.today_escalated_executions_count ?? 3;

  const successRate = todayCount > 0
    ? (((todayCount - failedCount) / todayCount) * 100).toFixed(1)
    : '99.4';

  const metrics = [
    {
      label: 'Active schedules',
      value: activeCount.toLocaleString(),
      change: `${stats?.paused_schedules_count ?? 42} paused`,
      icon: CalendarCheck2,
      tone: 'blue',
    },
    {
      label: 'Executions today',
      value: todayCount.toLocaleString(),
      change: `${stats?.today_total_volume ? `${Number(stats.today_total_volume).toLocaleString()} ${stats.currency}` : 'Volume active'}`,
      icon: Clock3,
      tone: 'amber',
    },
    {
      label: 'Failed executions',
      value: failedCount.toString(),
      change: `${escalatedCount} escalated`,
      icon: CircleAlert,
      tone: 'red',
    },
    {
      label: 'Success rate',
      value: `${successRate}%`,
      change: 'Calculated from TSS',
      icon: TrendingUp,
      tone: 'green',
    },
  ];

  const isHealthy = !health || health.status === 'HEALTHY';

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Live operations"
        title="Scheduling at a glance"
        description="Monitor scheduled instructions, execution health and items that need an operator decision."
        action={
          <div
            className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold ${
              isHealthy
                ? 'border-brand-success/20 bg-brand-success-soft text-brand-success'
                : 'border-brand-warning/30 bg-brand-warning-soft text-brand-warning'
            }`}
          >
            <Activity className="size-4" />
            {isHealthy ? 'All systems operational' : `Service ${health?.status}`}
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, change, icon: Icon, tone }) => (
          <Panel key={label} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-brand-muted">{label}</p>
                <p className="mt-2 text-3xl font-bold tracking-[-.04em] text-brand-primary">{value}</p>
              </div>
              <span className={`grid size-10 place-items-center rounded-xl ${tones[tone as keyof typeof tones]}`}>
                <Icon className="size-5" />
              </span>
            </div>
            <p className="mt-4 text-[11px] font-medium text-brand-muted">{change}</p>
          </Panel>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_.8fr]">
        <Panel className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-brand-border p-5">
            <div>
              <h3 className="text-sm font-bold">Execution attention queue</h3>
              <p className="mt-1 text-xs text-brand-muted">Failures and escalations requiring review</p>
            </div>
            <Link href="/manual-review" className="group flex items-center gap-1 text-xs font-bold">
              View queue
              <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="bg-brand-subtle text-[10px] uppercase tracking-wider text-brand-muted">
                  <th className="px-5 py-3 font-bold">Execution</th>
                  <th className="px-5 py-3 font-bold">Transaction</th>
                  <th className="px-5 py-3 font-bold">Amount</th>
                  <th className="px-5 py-3 font-bold">Status</th>
                  <th className="px-5 py-3 font-bold">Failure</th>
                  <th className="px-5 py-3 font-bold"><span className="sr-only">Inspect</span></th>
                </tr>
              </thead>
              <tbody>
                {attention.map((item) => (
                  <tr key={item.id} className="group border-t border-brand-border text-xs hover:bg-brand-subtle">
                    <td className="px-5 py-4">
                      <span className="font-mono font-bold">{item.reference}</span>
                      <p className="mt-1 text-[10px] text-brand-muted">{item.scheduledAt}</p>
                    </td>
                    <td className="px-5 py-4 font-semibold">{item.transactionType.replaceAll('_', ' ')}</td>
                    <td className="px-5 py-4 font-bold">
                      {item.amount} {item.currency}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge value={item.status} />
                    </td>
                    <td className="max-w-[240px] px-5 py-4 text-brand-muted">{item.failureMessage}</td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/executions/${item.id}`}
                        aria-label={`Inspect ${item.reference}`}
                        className="grid size-8 place-items-center rounded-lg border border-brand-border bg-white opacity-60 transition group-hover:opacity-100"
                      >
                        <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold">Next 7 days</h3>
              <p className="mt-1 text-xs text-brand-muted">Projected execution volume</p>
            </div>
            <span className="rounded-lg bg-brand-blue-soft px-2 py-1 text-[10px] font-bold text-brand-blue">
              1,832 runs
            </span>
          </div>
          <div className="mt-7 flex h-44 items-end gap-2">
            {[42, 64, 51, 83, 70, 91, 58].map((height, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-t-lg bg-brand-blue/80" style={{ height: `${height}%` }} />
                <span className="text-[9px] font-semibold text-brand-muted">
                  {['Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue'][index]}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-xl border border-brand-border bg-brand-subtle p-3 text-xs text-brand-muted">
            <span className="font-bold text-brand-primary">Peak window:</span> Monday, 07:00–09:00 EAT
          </div>
        </Panel>
      </div>

      <Panel className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-brand-border p-5">
          <div>
            <h3 className="text-sm font-bold">Upcoming schedules</h3>
            <p className="mt-1 text-xs text-brand-muted">Nearest active occurrences</p>
          </div>
          <Link href="/schedules" className="group inline-flex items-center gap-1 text-xs font-bold">
            View all
            <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
        <div className="grid divide-y divide-brand-border lg:grid-cols-3 lg:divide-x lg:divide-y-0">
          {schedules
            .filter((item) => item.status === 'ACTIVE')
            .slice(0, 3)
            .map((item) => (
              <div key={item.id} className="group p-5 transition hover:bg-brand-subtle">
                <div className="flex justify-between gap-3">
                  <span className="font-mono text-[10px] font-bold">{item.reference}</span>
                  <StatusBadge value={item.status} />
                </div>
                <p className="mt-4 text-sm font-bold">{item.owner}</p>
                <p className="mt-1 text-xs text-brand-muted">
                  {item.transactionType.replaceAll('_', ' ')} · {item.cadence}
                </p>
                <div className="mt-4 flex justify-between text-xs">
                  <span className="text-brand-muted">Next run</span>
                  <span className="font-bold">{item.nextExecution}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 border-t border-brand-border pt-4">
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-blue-soft px-2.5 py-1 text-[9px] font-bold text-brand-blue">
                    <Play className="size-3" />
                    Trigger run
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[9px] font-bold">
                    <Pause className="size-3" />
                    Pause
                  </span>
                  <Link
                    href={`/schedules/${item.id}`}
                    className="ml-auto inline-flex items-center gap-1 rounded-full bg-brand-primary px-2.5 py-1 text-[9px] font-bold text-white"
                  >
                    Inspect
                    <ArrowUpRight className="size-3 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </div>
              </div>
            ))}
        </div>
      </Panel>
    </div>
  );
}
