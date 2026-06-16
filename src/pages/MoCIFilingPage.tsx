import { useState } from 'react';
import { Building, Loader2 } from 'lucide-react';
import { useApp, useT } from '../context/AppContext';
import { Button, Card, WathqBadge } from '../components/ui';
import { mockMociRequery } from '../services/mockApi';

export function MoCIFilingPage() {
  const { state, getActiveTransfer, getCompany, completeMoci, setStep, logAudit } = useApp();
  const t = useT();
  const transfer = getActiveTransfer();
  const company = getCompany(transfer?.companyCr);
  const [step, setLocalStep] = useState(0);
  const [loading, setLoading] = useState(false);

  if (!transfer || !company) return null;

  const guideSteps = [
    'Log in to SBC Portal (sbc.gov.sa)',
    'Navigate to Corporate Changes → Share Transfer',
    'Upload signed Transfer Deed from SOT vault',
    'Submit ZATCA price declaration reference',
    'Pay MoCI filing fee',
    'Confirm submission',
  ];

  const handleConfirm = async () => {
    setLoading(true);
    logAudit('moci.submitted', 'MoCI filing submitted via SBC portal');
    await mockMociRequery();
    completeMoci();
    setLoading(false);
    setStep('complete');
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card title={t('moci.title')}>
        <div className="mb-4 flex items-center gap-2">
          <Building className="h-5 w-5 text-brand-600" />
          <span className="font-medium">{state.language === 'ar' ? company.nameAr : company.nameEn}</span>
        </div>

        <h3 className="mb-3 text-sm font-semibold">{t('moci.guide')}</h3>
        <ol className="space-y-2">
          {guideSteps.map((s, i) => (
            <li
              key={i}
              className={`flex items-start gap-2 rounded-lg p-2 text-sm ${i <= step ? 'bg-brand-50' : 'bg-slate-50'}`}
            >
              <span className="font-mono text-brand-600">{i + 1}.</span>
              {s}
            </li>
          ))}
        </ol>

        <div className="mt-4 flex gap-2">
          {step < guideSteps.length - 1 && (
            <Button variant="secondary" onClick={() => setLocalStep(step + 1)}>
              Next guide step
            </Button>
          )}
          <Button onClick={handleConfirm} disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> {t('moci.requery')}
              </span>
            ) : (
              t('moci.confirm')
            )}
          </Button>
        </div>
      </Card>

      <Card title="Pre-filled MoCI summary">
        <dl className="space-y-2 text-sm">
          <div><dt className="text-slate-500">CR</dt><dd dir="ltr">{company.crNumber}</dd></div>
          <div><dt className="text-slate-500">UNN</dt><dd dir="ltr">{company.crNationalNumber}</dd></div>
          <div><dt className="text-slate-500">{t('kyb.entity_type')}</dt><dd>{state.language === 'ar' ? company.entityType.formName.ar : company.entityType.formName.en}</dd></div>
          <div><dt className="text-slate-500">{t('kyb.status')}</dt><dd>{state.language === 'ar' ? company.status.name.ar : company.status.name.en}</dd></div>
          <div><dt className="text-slate-500">{t('transfer.shares')}</dt><dd>{transfer.shares.toLocaleString()}</dd></div>
          <div><dt className="text-slate-500">From</dt><dd>{transfer.sellerId}</dd></div>
          <div><dt className="text-slate-500">To</dt><dd>{transfer.buyerId}</dd></div>
        </dl>
        {transfer.mociConfirmed && (
          <div className="mt-4">
            <WathqBadge verified timestamp={new Date().toISOString()} />
            <p className="mt-2 text-sm text-success">Cap-table updated — Wathq match confirmed (24h simulated)</p>
          </div>
        )}
      </Card>
    </div>
  );
}
