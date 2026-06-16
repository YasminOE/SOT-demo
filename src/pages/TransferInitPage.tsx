import { useMemo, useState } from 'react';
import { useApp, useT } from '../context/AppContext';
import { Button, Card, Input } from '../components/ui';
import { FeeBreakdownPanel } from '../components/FeeBreakdown';
import { calculateFees } from '../utils/fees';
import { DEMO_BUYER_ID, DEMO_DEAL } from '../data/seed';

export function TransferInitPage() {
  const { state, submitTransferInit, getPersonName } = useApp();
  const t = useT();
  const company = state.companies[state.selectedCr];
  const [price, setPrice] = useState(String(DEMO_DEAL.inRangePrice));
  const [shares, setShares] = useState(String(DEMO_DEAL.shares));
  const [related, setRelated] = useState(false);

  const fees = useMemo(
    () => calculateFees(parseFloat(price) || 0, parseInt(shares, 10) || 0),
    [price, shares]
  );

  const handleSubmit = () => {
    const forceOutOfRange = state.demoBranch === 'price_out_of_range';
    const usePrice = forceOutOfRange ? DEMO_DEAL.outOfRangePrice : parseFloat(price);
    const useShares =
      fees.platformFee >= 20000 - 0.01 ? DEMO_DEAL.largeDealShares : parseInt(shares, 10);
    submitTransferInit({
      pricePerShare: usePrice,
      shares: useShares,
      relatedParty: related,
      forceOutOfRange,
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card title={t('step.transfer_init')}>
        <div className="space-y-4">
          <Input
            label={t('transfer.buyer_nid')}
            value={`${getPersonName(DEMO_BUYER_ID)} (${state.persons[DEMO_BUYER_ID].nationalId})`}
            onChange={() => {}}
          />
          <Input label={t('transfer.price')} value={price} onChange={setPrice} dir="ltr" />
          <Input label={t('transfer.shares')} value={shares} onChange={setShares} dir="ltr" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={related} onChange={(e) => setRelated(e.target.checked)} />
            {t('transfer.related')}
          </label>
          <p className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-brand-800">
            {t('transfer.fo_validation_note')}
          </p>
          <p className="text-xs text-slate-500">
            {state.language === 'ar' ? company?.nameAr : company?.nameEn} ·{' '}
            {t('fo.reference_price')}: SAR {company?.referencePricePerShare}/share
          </p>
          <Button onClick={handleSubmit}>{t('transfer.submit')}</Button>
        </div>
      </Card>
      <FeeBreakdownPanel fees={fees} />
    </div>
  );
}
