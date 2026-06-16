import { useEffect, useState } from 'react';
import { MessageSquare, ExternalLink } from 'lucide-react';
import { useApp, useT } from '../context/AppContext';
import { Button, Card, StatusChip } from '../components/ui';
import { formatSAR } from '../utils/fees';
import { DEMO_ROFR_SHAREHOLDER_ID } from '../data/seed';
import { guideAfterRofrComplete } from '../utils/demoGuide';

export function CompanyROFRPage() {
  const {
    state,
    getActiveTransfer,
    getCompany,
    startRoFR,
    waiveRoFR,
    exerciseRoFR,
    setStep,
    setRole,
    updateTransfer,
    setDemoGuide,
  } = useApp();
  const t = useT();
  const transfer = getActiveTransfer();
  const company = getCompany(transfer?.companyCr);
  const [smsShown, setSmsShown] = useState(false);
  const [rofrStarted, setRofrStarted] = useState(false);
  const locale = state.language === 'ar' ? 'ar-SA' : 'en-SA';

  useEffect(() => {
    if (transfer?.rofrLocked) setRofrStarted(true);
  }, [transfer?.rofrLocked]);

  if (!transfer || !company) return null;

  const eligibleShareholders = company.shareholders.filter(
    (sh) => sh.id !== company.shareholders.find((s) => s.nationalId === state.persons[transfer.sellerId]?.nationalId)?.id
  );

  const handleStart = () => {
    startRoFR();
    setRofrStarted(true);
    setSmsShown(true);
  };

  const handleAllWaived = () => {
    eligibleShareholders.forEach((sh) => waiveRoFR(sh.id));
    if (state.demoBranch !== 'rofr_exercised') {
      updateTransfer(transfer.id, { status: 'signing' });
      setStep('signing');
      setDemoGuide(guideAfterRofrComplete());
    }
  };

  const handleExercise = () => {
    exerciseRoFR();
    setRole('shareholder', DEMO_ROFR_SHAREHOLDER_ID);
  };

  const rofrDay = transfer.rofrDay;
  const waitingForBuyer = transfer.status === 'buyer_pending';

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2" title={t('rofr.title')}>
        {waitingForBuyer ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm">
            <p className="font-medium text-amber-900">{t('dashboard.waiting_buyer')}</p>
            <p className="mt-1 text-amber-800">
              {transfer.shares.toLocaleString()} shares @ {formatSAR(transfer.pricePerShare, locale)}
            </p>
          </div>
        ) : !rofrStarted ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              {state.language === 'ar' ? company.nameAr : company.nameEn} — Review transfer request
            </p>
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div><dt className="text-slate-500">Deal value</dt><dd>{formatSAR(transfer.pricePerShare * transfer.shares, locale)}</dd></div>
              <div><dt className="text-slate-500">{t('fo.agreed_price')}</dt><dd>{formatSAR(transfer.pricePerShare, locale)}</dd></div>
            </dl>
            <Button onClick={handleStart}>{t('common.next')} — Lock price & start ROFR</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatusChip status={`${t('rofr.day')} ${rofrDay}/30`} variant="info" />
              {transfer.rofrLocked && <StatusChip status={t('rofr.locked')} variant="warning" />}
              {rofrDay >= 15 && <StatusChip status={t('rofr.market_update')} variant="default" />}
              {rofrDay >= 30 && <StatusChip status={t('rofr.window_close')} variant="success" />}
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-start">
                  <th className="py-2">Shareholder</th>
                  <th>ROFR</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {eligibleShareholders.map((sh) => (
                  <tr key={sh.id} className="border-b">
                    <td className="py-2">{state.language === 'ar' ? sh.nameAr : sh.nameEn}</td>
                    <td>
                      <StatusChip
                        status={sh.rofrStatus === 'waived' ? t('rofr.waived') : t('rofr.pending')}
                        variant={sh.rofrStatus === 'waived' ? 'success' : 'warning'}
                      />
                    </td>
                    <td>
                      {!sh.rofrStatus && (
                        <Button
                          variant="ghost"
                          className="!px-2 !py-1 !text-xs"
                          onClick={() => waiveRoFR(sh.id)}
                        >
                          Waive
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {transfer.status === 'escrow_pending' && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm">
                <p className="font-medium text-blue-900">{t('dashboard.waiting_escrow')}</p>
              </div>
            )}

            {transfer.status === 'escrow_funded' && (
              <Button onClick={() => setStep('moci_filing')}>{t('common.next')} — MoCI filing</Button>
            )}

            <div className="flex flex-wrap gap-2">
              <Button onClick={handleAllWaived}>All waived — proceed</Button>
              {state.demoBranch === 'rofr_exercised' && (
                <Button variant="danger" onClick={handleExercise}>
                  {t('rofr.exercised')} (branch)
                </Button>
              )}
            </div>

            {transfer.status === 'rofr_exercised' && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm">
                <p className="font-medium text-red-800">ROFR exercised by Khalid Al-Mutairi</p>
                <p className="mt-1">Original buyer refund initiated via Dhamen (3 business days simulated)</p>
                <Button variant="secondary" className="mt-3" onClick={() => setStep('escrow')}>
                  View refund status
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      {smsShown && (
        <Card title={t('sms.preview')}>
          <div className="flex items-start gap-2 rounded-lg bg-slate-100 p-3 text-sm">
            <MessageSquare className="h-4 w-4 shrink-0 text-slate-500" />
            <div>
              <p>SOT Platform: Transfer request for {company.nameEn}. Review within 30 days.</p>
              <a href="#" className="mt-2 inline-flex items-center gap-1 text-brand-600">
                <ExternalLink className="h-3 w-3" /> {t('sms.link')}
              </a>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
