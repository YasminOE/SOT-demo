import { ShieldCheck } from 'lucide-react';
import type { FairnessOpinion, Transfer } from '../types';
import type { Company } from '../types';
import { useApp, useT } from '../context/AppContext';
import { formatSAR } from '../utils/fees';
import { JADA_SOURCE } from '../utils/fairnessOpinion';

export function FairnessOpinionDocument({
  fo,
  transfer,
  company,
}: {
  fo: FairnessOpinion;
  transfer: Transfer;
  company: Company;
}) {
  const { state } = useApp();
  const t = useT();
  const locale = state.language === 'ar' ? 'ar-SA' : 'en-SA';
  const lang = state.language;

  return (
    <div className="rounded-lg border-2 border-slate-200 bg-white p-5 text-sm shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3 border-b border-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-brand-600" />
            <span className="font-semibold text-brand-900">{t('fo.document')}</span>
          </div>
          <p className="mt-1 font-mono text-xs text-slate-500" dir="ltr">
            {fo.referenceNumber}
          </p>
        </div>
        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
          {t('fo.no_nav')}
        </span>
      </div>

      <p className="mb-4 rounded bg-blue-50 p-3 text-xs leading-relaxed text-brand-800">
        {t('fo.disclaimer')}
      </p>

      <dl className="grid gap-2.5 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-slate-500">{lang === 'ar' ? 'الشركة' : 'Company'}</dt>
          <dd className="font-medium">{lang === 'ar' ? company.nameAr : company.nameEn}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">{lang === 'ar' ? 'الأسهم' : 'Shares'}</dt>
          <dd dir="ltr">{transfer.shares.toLocaleString()}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">{t('fo.agreed_price')}</dt>
          <dd className="font-semibold">{formatSAR(fo.agreedPrice, locale)}/share</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">{t('fo.reference_price')}</dt>
          <dd>{formatSAR(fo.referencePrice, locale)}/share</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">{t('fo.platform_market_context')}</dt>
          <dd>
            {t(`market.${fo.marketCondition}` as import('../i18n/translations').TranslationKey)}
            <span className="text-xs text-slate-500"> · {t('fo.platform_assigned')}</span>
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">{t('fo.discount_band')}</dt>
          <dd dir="ltr">
            {(fo.discountBand.min * 100).toFixed(0)}% – {(fo.discountBand.max * 100).toFixed(0)}%
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs text-slate-500">{t('fo.fair_range')}</dt>
          <dd dir="ltr" className="font-medium">
            {formatSAR(fo.floor, locale)} – {formatSAR(fo.ceiling, locale)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">{t('fo.discount')}</dt>
          <dd>{fo.discountToReference.toFixed(1)}%</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">{t('fo.floor_ceiling')}</dt>
          <dd dir="ltr">
            {formatSAR(fo.floor, locale)} / {formatSAR(fo.ceiling, locale)}
          </dd>
        </div>
      </dl>

      <p className="mt-3 rounded bg-slate-50 p-2.5 text-xs text-slate-600">{fo.companyAgeNote}</p>

      <div className="mt-4 border-t border-border pt-3">
        <p className="text-xs font-medium text-slate-700">{t('fo.source')}</p>
        <p className="mt-1 text-xs text-slate-500">{JADA_SOURCE}</p>
        <p className="mt-2 text-xs text-slate-400">
          {lang === 'ar' ? 'توقيع رقمي للمنصة' : 'Platform digital signature'} ·{' '}
          {new Date(fo.issuedAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
