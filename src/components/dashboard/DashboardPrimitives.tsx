import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export function KpiCard({
  label,
  value,
  hint,
  delta,
  deltaTone = 'neutral',
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  delta?: string;
  deltaTone?: 'up' | 'down' | 'neutral';
  icon?: LucideIcon;
}) {
  const deltaClass =
    deltaTone === 'up'
      ? 'text-emerald-600'
      : deltaTone === 'down'
        ? 'text-amber-600'
        : 'text-[var(--od-muted)]';

  return (
    <div className="od-panel p-[18px]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--od-muted)]">
            {label}
          </p>
          <p className="mt-2 text-[28px] font-semibold leading-none tracking-[-0.02em] text-[var(--od-heading)]">
            {value}
          </p>
          {delta && <p className={`mt-1.5 text-xs ${deltaClass}`}>{delta}</p>}
          {hint && !delta && <p className="mt-1.5 text-xs text-[var(--od-muted)]">{hint}</p>}
        </div>
        {Icon && (
          <div className="rounded-lg bg-[var(--od-accent-soft)] p-2.5 text-[var(--od-accent)]">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}

export function DashboardPanel({
  title,
  action,
  children,
  className = '',
  noPadding = false,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}) {
  return (
    <section className={`od-panel overflow-hidden ${className}`}>
      {title && (
        <div className="flex items-center justify-between gap-3 border-b border-[var(--od-border)] px-5 py-3.5">
          <h3 className="text-sm font-medium text-[var(--od-heading)]">{title}</h3>
          {action}
        </div>
      )}
      <div className={noPadding ? '' : 'p-5'}>{children}</div>
    </section>
  );
}

export function QuickActionTile({
  label,
  onClick,
  icon: Icon,
  primary = false,
}: {
  label: string;
  onClick: () => void;
  icon: LucideIcon;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 rounded-[10px] border px-4 py-3.5 text-start text-sm font-medium transition-colors ${
        primary
          ? 'border-[var(--od-accent)] bg-[var(--od-accent)] text-white hover:bg-[var(--od-accent-hover)]'
          : 'od-panel-interactive text-[var(--od-heading)] hover:bg-[var(--od-bg)]'
      }`}
    >
      <Icon className={`h-4 w-4 shrink-0 ${primary ? 'text-white/90' : 'text-[var(--od-muted)]'}`} />
      {label}
    </button>
  );
}
