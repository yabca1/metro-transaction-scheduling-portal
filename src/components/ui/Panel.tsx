import { twMerge } from 'tailwind-merge';

export function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={twMerge('rounded-2xl border border-brand-border bg-white', className)}>{children}</section>;
}
