import { Shield, Building2, CheckCircle2 } from 'lucide-react';
import { useT } from '../../context/AppContext';

export function VerificationBadges() {
  const t = useT();
  return (
    <div className="flex flex-wrap gap-3">
      <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm">
        <Shield className="h-4 w-4 text-brand-600" />
        <div>
          <div className="font-medium text-brand-700">{t('badge.nafath')}</div>
          <div className="text-xs text-slate-600">{t('badge.nafath.desc')}</div>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm">
        <Building2 className="h-4 w-4 text-success" />
        <div>
          <div className="font-medium text-emerald-800">{t('badge.wathq')}</div>
          <div className="text-xs text-slate-600">{t('badge.wathq.desc')}</div>
        </div>
      </div>
    </div>
  );
}

export function IdentityBadge({ verified }: { verified: boolean }) {
  const t = useT();
  if (!verified) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-brand-700">
      <CheckCircle2 className="h-3 w-3" />
      {t('badge.identity_verified')}
    </span>
  );
}

export function WathqBadge({ verified, timestamp }: { verified: boolean; timestamp?: string }) {
  const t = useT();
  if (!verified) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
      <CheckCircle2 className="h-3 w-3" />
      {t('badge.wathq_verified')}
      {timestamp && (
        <span className="text-emerald-600">
          · {new Date(timestamp).toLocaleString()}
        </span>
      )}
    </span>
  );
}

export function StatusChip({
  status,
  variant = 'default',
}: {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}) {
  const colors = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-100 text-emerald-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-brand-700',
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[variant]}`}>
      {status}
    </span>
  );
}

export function Card({
  children,
  title,
  subtitle,
  className = '',
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={`od-panel overflow-hidden ${className}`}>
      {(title || subtitle) && (
        <div className="border-b border-[var(--od-border)] px-6 py-4">
          {title && <h2 className="text-base font-medium text-[var(--od-heading)]">{title}</h2>}
          {subtitle && <p className="mt-1 text-sm text-[var(--od-muted)]">{subtitle}</p>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className = '',
  type = 'button',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}) {
  const variants = {
    primary: 'bg-[var(--od-accent)] text-white hover:bg-[var(--od-accent-hover)] disabled:bg-slate-300',
    secondary: 'border border-[var(--od-border)] bg-white text-[var(--od-heading)] hover:bg-[var(--od-bg)]',
    danger: 'bg-danger text-white hover:bg-red-700',
    ghost: 'text-brand-600 hover:bg-brand-50',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Input({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  dir,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  dir?: 'ltr' | 'rtl';
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        dir={dir}
        className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
      />
    </label>
  );
}

export function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
