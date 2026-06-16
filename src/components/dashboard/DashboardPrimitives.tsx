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
      ? 'text-[#248a3d]'
      : deltaTone === 'down'
        ? 'text-[#c93400]'
        : 'text-[var(--apple-text-secondary)]';

  return (
    <div className="od-panel p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="apple-caption">{label}</p>
          <p className="mt-2 text-[32px] font-semibold leading-none tracking-[-0.03em] text-[var(--apple-text)] tabular-nums">
            {value}
          </p>
          {delta && <p className={`mt-2 text-[13px] font-medium tracking-[-0.01em] ${deltaClass}`}>{delta}</p>}
          {hint && !delta && <p className="mt-2 apple-caption">{hint}</p>}
        </div>
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[var(--apple-fill-secondary)] text-[var(--apple-blue)]">
            <Icon className="h-5 w-5" strokeWidth={1.75} />
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
        <div className="flex items-center justify-between gap-3 px-5 pb-0 pt-5">
          <h3 className="apple-headline">{title}</h3>
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
      className={`flex items-center gap-3 px-5 py-3.5 text-start text-[14px] font-medium tracking-[-0.01em] transition-all active:scale-[0.98] ${
        primary
          ? 'apple-btn-primary shadow-sm'
          : 'apple-btn-secondary'
      }`}
    >
      <Icon className={`h-[18px] w-[18px] shrink-0 ${primary ? 'text-white' : 'text-[var(--apple-blue)]'}`} strokeWidth={1.75} />
      {label}
    </button>
  );
}
