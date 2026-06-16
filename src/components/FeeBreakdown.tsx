import type { FeeBreakdown } from '../types';
import { formatSAR, VAT_BASIS_AR, VAT_BASIS_EN } from '../utils/fees';
import { useApp, useT } from '../context/AppContext';

function FeeRow({
  label,
  value,
  badge,
  emphasis = false,
}: {
  label: string;
  value: string;
  badge?: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-1 py-2.5 ${
        emphasis ? 'border-t border-slate-200 pt-3' : ''
      }`}
    >
      <div className="min-w-0">
        <p className={`text-sm ${emphasis ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
          {label}
        </p>
        {badge && (
          <span className="mt-0.5 inline-block rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
            {badge}
          </span>
        )}
      </div>
      <p
        className={`whitespace-nowrap text-end tabular-nums ${
          emphasis ? 'text-base font-bold text-brand-800' : 'text-sm font-semibold text-slate-900'
        }`}
        dir="ltr"
      >
        {value}
      </p>
    </div>
  );
}

export function FeeBreakdownPanel({
  fees,
  variant = 'full',
}: {
  fees: FeeBreakdown;
  variant?: 'full' | 'compact';
}) {
  const t = useT();
  const { state } = useApp();
  const locale = state.language === 'ar' ? 'ar-SA' : 'en-SA';

  const platformBadge = fees.feeCapped
    ? t('fee.badge.cap')
    : fees.feeFloored
      ? t('fee.badge.floor')
      : undefined;

  const content = (
    <>
      <div className="rounded-xl bg-slate-50/80 p-4 ring-1 ring-slate-100">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {t('fee.section.deal')}
        </p>
        <FeeRow
          label={t('fee.deal_value')}
          value={formatSAR(fees.dealValue, locale)}
          badge={t('fee.badge.vat_exempt')}
        />
        <FeeRow
          label={t('fee.buyer_fee')}
          value={formatSAR(fees.buyerPlatformFee, locale)}
          badge={t('fee.badge.buyer_zero')}
        />
      </div>

      <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50/40 p-4">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-amber-700/80">
          {t('fee.section.seller_invoice')}
        </p>
        <p className="mb-2 text-xs text-amber-800/70">{t('fee.section.seller_note')}</p>
        <FeeRow
          label={t('fee.platform')}
          value={formatSAR(fees.platformFee, locale)}
          badge={platformBadge}
        />
        <FeeRow
          label={t('fee.vat')}
          value={formatSAR(fees.vatOnFee, locale)}
          badge={t('fee.badge.vat_rate')}
        />
        <FeeRow
          label={t('fee.total_seller')}
          value={formatSAR(fees.totalInvoicedToSeller, locale)}
          emphasis
        />
      </div>

      {variant === 'full' && (
        <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
          {t('fee.floor_cap')} · {state.language === 'ar' ? VAT_BASIS_AR : VAT_BASIS_EN}
        </p>
      )}
    </>
  );

  if (variant === 'compact') {
    return <div className="text-sm">{content}</div>;
  }

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-base font-semibold text-slate-900">{t('fee.title')}</h3>
      {content}
    </div>
  );
}
