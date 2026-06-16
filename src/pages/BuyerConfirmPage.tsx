import { useState } from 'react';
import { useApp, useT } from '../context/AppContext';
import { NafathModal } from '../components/NafathModal';
import { Button, Card, IdentityBadge } from '../components/ui';
import { formatSAR } from '../utils/fees';
import { DEMO_BUYER_ID } from '../data/seed';

export function BuyerConfirmPage() {
  const { state, getActiveTransfer, acceptBuyerOffer, setStep, verifyIdentity } = useApp();
  const t = useT();
  const transfer = getActiveTransfer();
  const buyer = state.persons[state.currentUserId] ?? state.persons[DEMO_BUYER_ID];
  const fo = transfer?.fairnessOpinion;
  const [showNafath, setShowNafath] = useState(false);
  const locale = state.language === 'ar' ? 'ar-SA' : 'en-SA';

  if (!transfer) return null;

  const completeAcceptance = () => {
    if (!buyer.identityVerified) {
      verifyIdentity(buyer.id);
    }
    acceptBuyerOffer();
    setStep('buyer_dashboard');
  };

  const handleAccept = () => {
    if (buyer.identityVerified) {
      completeAcceptance();
      return;
    }
    setShowNafath(true);
  };

  const handleVerified = () => {
    completeAcceptance();
  };

  return (
    <>
      <Card title={t('step.buyer_confirm')}>
        <div className="mb-4 flex items-center gap-2">
          <IdentityBadge verified={buyer.identityVerified} />
          <span className="font-medium">{state.language === 'ar' ? buyer.nameAr : buyer.nameEn}</span>
        </div>

        <dl className="grid gap-3 sm:grid-cols-2 text-sm mb-6">
          <div><dt className="text-slate-500">{t('fo.agreed_price')}</dt><dd className="text-lg font-semibold">{formatSAR(transfer.pricePerShare, locale)}/share</dd></div>
          <div><dt className="text-slate-500">{t('transfer.shares')}</dt><dd className="text-lg font-semibold">{transfer.shares.toLocaleString()}</dd></div>
          <div><dt className="text-slate-500">{t('fo.fair_range')}</dt><dd dir="ltr">{fo ? `${formatSAR(fo.floor, locale)} – ${formatSAR(fo.ceiling, locale)}` : '—'}</dd></div>
          <div><dt className="text-slate-500">{t('fee.buyer_fee')}</dt><dd className="text-lg font-semibold text-success">{t('buyer.fee_zero')}</dd></div>
        </dl>

        <p className="mb-4 text-sm text-slate-600">{t('buyer.confirm_price')}</p>
        <Button onClick={handleAccept}>{t('buyer.accept')}</Button>
      </Card>

      <NafathModal
        open={showNafath}
        onClose={() => setShowNafath(false)}
        onSuccess={handleVerified}
        personId={buyer.id}
      />
    </>
  );
}
