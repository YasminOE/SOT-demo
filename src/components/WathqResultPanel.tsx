import { Building2, CheckCircle2, XCircle } from 'lucide-react';
import type { Company } from '../types';
import { useApp, useT } from '../context/AppContext';
import { localized } from '../services/wathqMock';
import { formatSAR } from '../utils/fees';
import { Button, StatusChip, WathqBadge } from './ui';

export function WathqResultPanel({
  company,
  onContinue,
}: {
  company: Company;
  onContinue?: () => void;
}) {
  const { state } = useApp();
  const t = useT();
  const lang = state.language;
  const w = company.wathq;
  const locale = lang === 'ar' ? 'ar-SA' : 'en-SA';

  return (
    <div className="mt-4 space-y-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <WathqBadge verified={company.wathqVerified} timestamp={company.lastVerifiedAt} />
        <StatusChip
          status={localized(w.status.name, lang)}
          variant={w.status.id === 1 ? 'success' : 'danger'}
        />
        <StatusChip status={company.type} variant="info" />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900">
          {lang === 'ar' ? company.nameAr : company.nameEn}
        </h3>
        <p className="text-xs text-slate-500">{t('kyb.api_ref')}</p>
      </div>

      <dl className="grid gap-3 rounded-lg bg-white/70 p-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-slate-500">{t('kyb.cr_number')}</dt>
          <dd dir="ltr" className="font-mono font-medium">
            {company.crNumber}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">{t('kyb.cr_national')}</dt>
          <dd dir="ltr" className="font-mono font-medium">
            {company.crNationalNumber}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">{t('kyb.entity_type')}</dt>
          <dd>{localized(company.entityType.formName, lang)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">{t('kyb.legal_form')}</dt>
          <dd>{localized(company.entityType.name, lang)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">{t('kyb.status')}</dt>
          <dd className="flex items-center gap-1">
            {w.status.id === 1 ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
            ) : (
              <XCircle className="h-3.5 w-3.5 text-danger" />
            )}
            {localized(w.status.name, lang)}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">{t('kyb.confirmation_date')}</dt>
          <dd dir="ltr">{w.status.confirmationDate.gregorian}</dd>
        </div>
        <div>
          <dt className="text-slate-500">{t('kyb.headquarters')}</dt>
          <dd>{localized(company.headquarterCity, lang)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">{t('kyb.capital')}</dt>
          <dd>{formatSAR(w.crCapital, locale)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">{t('kyb.paid_capital')}</dt>
          <dd>{formatSAR(company.paidCapital, locale)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">{t('kyb.total_shares')}</dt>
          <dd dir="ltr">{company.totalShares.toLocaleString()}</dd>
        </div>
        <div>
          <dt className="text-slate-500">{t('kyb.issue_date')}</dt>
          <dd dir="ltr">{w.issueDateGregorian}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-slate-500">{t('kyb.activities')}</dt>
          <dd className="mt-1 flex flex-wrap gap-1">
            {company.activities.map((a) => (
              <span
                key={a.id}
                className="rounded bg-slate-100 px-2 py-0.5 text-xs"
                dir="ltr"
              >
                {a.id} · {localized(a.name, lang)}
              </span>
            ))}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-slate-500">{t('kyb.manager')}</dt>
          <dd>
            {company.managers.map((m) => localized(m.name, lang)).join(' · ')}
          </dd>
        </div>
      </dl>

      <div className="flex items-center gap-2 text-xs text-emerald-800">
        <Building2 className="h-3.5 w-3.5" />
        {t('kyb.new_legislation_note')}
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold">{t('kyb.parties')}</h4>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-emerald-200 text-start">
              <th className="py-2">{t('kyb.shareholding')}</th>
              <th>{t('kyb.identity')}</th>
              <th>{t('kyb.shares')}</th>
              <th>%</th>
            </tr>
          </thead>
          <tbody>
            {company.shareholders.map((sh) => (
              <tr key={sh.id} className="border-b border-emerald-100">
                <td className="py-2">{lang === 'ar' ? sh.nameAr : sh.nameEn}</td>
                <td dir="ltr" className="font-mono text-xs">
                  {sh.nationalId}
                </td>
                <td dir="ltr">{sh.shares.toLocaleString()}</td>
                <td>{sh.percentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {onContinue && <Button onClick={onContinue}>{t('common.next')}</Button>}
    </div>
  );
}

export function WathqErrorPanel({ error }: { error: string }) {
  const t = useT();
  const messages: Record<string, string> = {
    NOT_FOUND: t('kyb.error.not_found'),
    INACTIVE: t('kyb.error.inactive'),
    NOT_ELIGIBLE: t('kyb.error.not_eligible'),
    IN_LIQUIDATION: t('kyb.error.liquidation'),
  };

  return (
    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <div className="flex items-center gap-2 font-medium">
        <XCircle className="h-4 w-4" />
        {messages[error] ?? error}
      </div>
    </div>
  );
}
