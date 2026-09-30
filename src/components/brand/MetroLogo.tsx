import { cn } from '@/lib/utils';

export function MetroLogo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-3 select-none", className)} aria-label="Metro Transaction Scheduling">
      <span className="inline-flex items-center justify-center rounded-xl bg-brand-primary size-11 shrink-0 shadow-sm">
        <svg viewBox="0 0 24 24" className="size-4/5" aria-hidden>
          <text
            x="50%"
            y="52%"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="18"
            className="font-orbitron font-bold fill-brand-white"
          >
            M
          </text>
        </svg>
      </span>
      {!compact && (
        <div className="leading-tight">
          <span className="block font-orbitron text-xl font-semibold tracking-tight text-brand-primary">
            Scheduling
          </span>
          <span className="metro-kicker text-[8.5px] block -mt-0.5">
            Operations Portal
          </span>
        </div>
      )}
    </div>
  );
}
