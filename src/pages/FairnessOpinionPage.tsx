import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useApp, useT } from '../context/AppContext';
import { Button, Card, StatusChip } from '../components/ui';
import { FairnessOpinionDocument } from '../components/FairnessOpinionDocument';
import { formatSAR } from '../utils/fees';
import { mockGenerateFO } from '../services/mockApi';

export function FairnessOpinionPage() {
  const { state, getActiveTransfer, getCompany, issueFairnessOpinion, setStep, updateTransfer } =
    useApp();
  const t = useT();
  const transfer = getActiveTransfer();
  const company = getCompany(transfer?.companyCr);
  const [loading, setLoading] = useState(true);
  const [justification, setJustification] = useState('');
  const fo = transfer?.fairnessOpinion;
  const locale = state.language === 'ar' ? 'ar-SA' : 'en-SA';

  useEffect(() => {
    if (!transfer || fo) {
      setLoading(false);
      return;
    }
    mockGenerateFO().then(() => {
      issueFairnessOpinion();
      setLoading(false);
    });
  }, [transfer, fo, issueFairnessOpinion]);

  if (!transfer || !company) return null;

  const handleJustify = () => {
    issueFairnessOpinion(justification);
    updateTransfer(transfer.id, { status: 'buyer_pending' });
    setStep('platform_admin');
  };

  const handleReprice = () => {
    setStep('transfer_init');
  };

  if (loading) {
    return (
      <Card title={t('fo.title')}>
        <p>{t('common.loading')}</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2" title={t('fo.title')}>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <StatusChip status={t('fo.no_nav')} variant="info" />
          <span className="text-xs text-slate-500">{t('fo.anchor_note')}</span>
        </div>

        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-brand-800">
          {t('fo.disclaimer')}
        </div>

        {fo && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {fo.inRange ? (
                <StatusChip status={t('fo.in_range')} variant="success" />
              ) : (
                <StatusChip status={t('fo.out_of_range')} variant="warning" />
              )}
              <span className="font-mono text-sm" dir="ltr">
                {fo.referenceNumber}
              </span>
            </div>

            <dl className="grid gap-3 sm:grid-cols-2 text-sm">
              <div>
                <dt className="text-slate-500">{t('fo.reference_price')}</dt>
                <dd className="font-semibold">{formatSAR(fo.referencePrice, locale)}/share</dd>
              </div>
              <div>
                <dt className="text-slate-500">{t('fo.agreed_price')}</dt>
                <dd className="font-semibold">{formatSAR(fo.agreedPrice, locale)}/share</dd>
              </div>
              <div>
                <dt className="text-slate-500">{t('fo.fair_range')}</dt>
                <dd dir="ltr">
                  {formatSAR(fo.floor, locale)} – {formatSAR(fo.ceiling, locale)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">{t('fo.discount')}</dt>
                <dd>{fo.discountToReference.toFixed(1)}%</dd>
              </div>
              <div>
                <dt className="text-slate-500">{t('fo.platform_market_context')}</dt>
                <dd>
                  {t(`market.${fo.marketCondition}` as import('../i18n/translations').TranslationKey)}
                  <span className="ms-1 text-xs text-slate-500">({t('fo.platform_assigned')})</span>
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">{t('fo.discount_band')}</dt>
                <dd dir="ltr">
                  {(fo.discountBand.min * 100).toFixed(0)}% – {(fo.discountBand.max * 100).toFixed(0)}%
                </dd>
              </div>
            </dl>

            <p className="rounded bg-slate-50 p-3 text-sm text-slate-600">{fo.companyAgeNote}</p>

            {!fo.inRange && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-center gap-2 text-amber-800">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">
                    {fo.gapPercent?.toFixed(1)}%{' '}
                    {fo.agreedPrice < fo.floor
                      ? state.language === 'ar'
                        ? 'أقل من حد النطاق'
                        : 'below validation floor'
                      : state.language === 'ar'
                        ? 'أعلى من سقف النطاق'
                        : 'above validation ceiling'}
                  </span>
                </div>
                <textarea
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder={
                    state.language === 'ar' ? 'المبرر المكتوب...' : 'Written justification...'
                  }
                  className="mt-3 w-full rounded border p-2 text-sm"
                  rows={3}
                />
                <div className="mt-3 flex gap-2">
                  <Button variant="secondary" onClick={handleReprice}>
                    {t('fo.reprice')}
                  </Button>
                  <Button onClick={handleJustify} disabled={!justification.trim()}>
                    {t('fo.justify')}
                  </Button>
                </div>
              </div>
            )}

            {fo.inRange && (
              <Button onClick={() => setStep('platform_admin')}>{t('common.next')}</Button>
            )}
          </div>
        )}
      </Card>

      <div className="space-y-4">
        {fo && <FairnessOpinionDocument fo={fo} transfer={transfer} company={company} />}
      </div>
    </div>
  );
}
