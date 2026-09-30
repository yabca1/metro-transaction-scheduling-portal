export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div>{eyebrow && <p className="metro-kicker text-brand-link mb-1">{eyebrow}</p>}<h2 className="text-2xl font-bold tracking-tight text-brand-primary">{title}</h2><p className="mt-1 max-w-2xl text-sm leading-relaxed text-brand-muted">{description}</p></div>{action}</div>;
}
