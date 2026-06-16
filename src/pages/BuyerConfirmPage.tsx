import { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Circle,
  FileCheck,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useApp, useT } from '../context/AppContext';
import { NafathModal } from '../components/NafathModal';
import { Button, IdentityBadge, StatusChip } from '../components/ui';
import { formatSAR } from '../utils/fees';
import { DEMO_BUYER_ID } from '../data/seed';
import type { TranslationKey } from '../i18n/translations';
import type { TransferStatus } from '../types';

function milestoneDone(status: TransferStatus, milestone: string): boolean {
  if (status === 'complete') return true;
  if (milestone === 'initiated') return true;
  const order = [
    'fo_pending',
    'fo_flagged',
    'buyer_pending',
    'rofr_active',
    'signing',
    'escrow_pending',
    'escrow_funded',
    'moci_pending',
    'complete',
  ];
  const idx = order.indexOf(status);
  const map: Record<string, number> = {
    fo: 1,
    buyer: 2,
    rofr: 3,
    signing: 4,
    payment: 5,
    complete: 6,
  };
  return idx >= (map[milestone] ?? 0);
}

export function BuyerConfirmPage() {
  const {
    state,
    getActiveTransfer,
    getCompany,
    acceptBuyerOffer,
    setStep,
    verifyIdentity,
  } = useApp();
  const t = useT();
  const transfer = getActiveTransfer();
  const company = getCompany(transfer?.companyCr);
  const seller = transfer ? state.persons[transfer.sellerId] : null;
  const buyer = state.persons[state.currentUserId] ?? state.persons[DEMO_BUYER_ID];
  const fo = transfer?.fairnessOpinion;
  const [showNafath, setShowNafath] = useState(false);
  const locale = state.language === 'ar' ? 'ar-SA' : 'en-SA';

  if (!transfer || !company || !seller) return null;

  const companyName = state.language === 'ar' ? company.nameAr : company.nameEn;
  const sellerName = state.language === 'ar' ? seller.nameAr : seller.nameEn;
  const dealValue = transfer.feeBreakdown?.dealValue ?? transfer.pricePerShare * transfer.shares;
  const ownershipPct = ((transfer.shares / company.totalShares) * 100).toFixed(2);

  const milestones: { key: string; label: TranslationKey }[] = [
    { key: 'initiated', label: 'timeline.initiated' },
    { key: 'fo', label: 'timeline.fo' },
    { key: 'buyer', label: 'timeline.buyer' },
    { key: 'rofr', label: 'timeline.rofr' },
    { key: 'signing', label: 'timeline.signing' },
    { key: 'payment', label: 'timeline.payment' },
    { key: 'complete', label: 'timeline.complete' },
  ];

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
      <div className="space-y-6">
        <div className="od-panel p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-[var(--apple-blue)]" strokeWidth={1.75} />
                <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-[var(--apple-text)]">
                  {companyName}
                </h2>
              </div>
              <p className="apple-subhead">{t('buyer.confirm.intro')}</p>
            </div>
            <StatusChip status={t('status.transfer.buyer_pending')} variant="info" />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="od-panel p-6">
            <h3 className="mb-4 text-[15px] font-semibold tracking-[-0.01em] text-[var(--apple-text)]">
              {t('buyer.confirm.deal_summary')}
            </h3>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="apple-caption">{t('dash.table.seller')}</dt>
                <dd className="mt-1 flex items-center gap-2 font-medium text-[var(--apple-text)]">
                  <User className="h-4 w-4 text-[var(--apple-text-secondary)]" strokeWidth={1.75} />
                  {sellerName}
                </dd>
                <dd className="mt-0.5 text-[13px] text-[var(--apple-text-secondary)]" dir="ltr">
                  {seller.mobile}
                </dd>
              </div>
              <div>
                <dt className="apple-caption">{t('buyer.confirm.transfer_id')}</dt>
                <dd className="mt-1 font-mono text-[13px] text-[var(--apple-text)]" dir="ltr">
                  {transfer.id}
                </dd>
              </div>
              <div>
                <dt className="apple-caption">{t('fo.agreed_price')}</dt>
                <dd className="mt-1 text-[17px] font-semibold text-[var(--apple-text)]">
                  {formatSAR(transfer.pricePerShare, locale)}
                  <span className="text-[13px] font-normal text-[var(--apple-text-secondary)]">
                    {' '}
                    / {t('buyer.confirm.per_share')}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="apple-caption">{t('transfer.shares')}</dt>
                <dd className="mt-1 text-[17px] font-semibold text-[var(--apple-text)]">
                  {transfer.shares.toLocaleString(locale)}
                </dd>
              </div>
              <div>
                <dt className="apple-caption">{t('buyer.confirm.ownership_pct')}</dt>
                <dd className="mt-1 font-semibold text-[var(--apple-text)]">{ownershipPct}%</dd>
              </div>
              <div>
                <dt className="apple-caption">{t('dashboard.seller.deal_value')}</dt>
                <dd className="mt-1 text-[20px] font-bold tracking-[-0.02em] text-[var(--apple-blue)]">
                  {formatSAR(dealValue, locale)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="od-panel p-6">
            <h3 className="mb-4 text-[15px] font-semibold tracking-[-0.01em] text-[var(--apple-text)]">
              {t('buyer.confirm.validation_payment')}
            </h3>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="apple-caption">{t('fo.fair_range')}</dt>
                <dd className="mt-1 font-medium text-[var(--apple-text)]" dir="ltr">
                  {fo
                    ? `${formatSAR(fo.floor, locale)} – ${formatSAR(fo.ceiling, locale)}`
                    : '—'}
                </dd>
              </div>
              <div>
                <dt className="apple-caption">{t('fo.discount')}</dt>
                <dd className="mt-1 font-medium text-[var(--apple-text)]">
                  {fo ? `${fo.discountToReference.toFixed(1)}%` : '—'}
                </dd>
              </div>
              <div>
                <dt className="apple-caption">{t('dashboard.seller.fo_ref')}</dt>
                <dd className="mt-1 font-mono text-[13px] text-[var(--apple-text)]" dir="ltr">
                  {fo?.referenceNumber ?? '—'}
                </dd>
              </div>
              <div>
                <dt className="apple-caption">{t('buyer.confirm.fo_status')}</dt>
                <dd className="mt-1">
                  {fo ? (
                    <StatusChip
                      status={fo.inRange ? t('fo.in_range') : t('fo.out_of_range')}
                      variant={fo.inRange ? 'success' : 'warning'}
                    />
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
              <div>
                <dt className="apple-caption">{t('dashboard.buyer.escrow_due')}</dt>
                <dd className="mt-1 text-[17px] font-semibold text-[var(--apple-text)]">
                  {formatSAR(dealValue, locale)}
                </dd>
                <dd className="mt-0.5 text-[12px] text-[var(--apple-text-secondary)]">
                  {t('buyer.confirm.escrow_note')}
                </dd>
              </div>
              <div>
                <dt className="apple-caption">{t('fee.buyer_fee')}</dt>
                <dd className="mt-1 font-semibold text-[var(--apple-green)]">{t('buyer.fee_zero')}</dd>
              </div>
            </dl>

            {fo && (
              <div className="mt-4 flex items-start gap-2 rounded-[12px] bg-[rgba(0,122,255,0.06)] p-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--apple-blue)]" strokeWidth={1.75} />
                <p className="text-[13px] leading-relaxed text-[var(--apple-text-secondary)]">
                  {t('fo.disclaimer')}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="od-panel p-6 lg:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <IdentityBadge verified={buyer.identityVerified} />
              <span className="font-medium text-[var(--apple-text)]">
                {state.language === 'ar' ? buyer.nameAr : buyer.nameEn}
              </span>
            </div>
            <p className="mb-5 text-[14px] text-[var(--apple-text-secondary)]">
              {t('buyer.confirm_price')}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleAccept} className="gap-2">
                <FileCheck className="h-4 w-4" />
                {t('buyer.accept')}
              </Button>
              <Button variant="secondary" onClick={() => setStep('buyer_offers')}>
                {t('buyer.confirm.back_offers')}
              </Button>
            </div>
            <p className="mt-4 text-[12px] text-[var(--apple-text-secondary)]">
              {t('buyer.confirm.next_steps')}
            </p>
          </div>

          <div className="od-panel p-6">
            <h3 className="mb-4 text-[15px] font-semibold tracking-[-0.01em] text-[var(--apple-text)]">
              {t('dashboard.seller.timeline')}
            </h3>
            <ol className="space-y-2.5">
              {milestones.map(({ key, label }) => {
                const done = milestoneDone(transfer.status, key);
                const current = key === 'buyer';
                return (
                  <li key={key} className="flex items-center gap-2.5 text-[14px]">
                    {done ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--apple-green)]" strokeWidth={2} />
                    ) : (
                      <Circle
                        className={`h-4 w-4 shrink-0 ${current ? 'text-[var(--apple-blue)]' : 'text-[var(--apple-text-tertiary)]'}`}
                        strokeWidth={current ? 2 : 1.5}
                      />
                    )}
                    <span
                      className={
                        done
                          ? 'text-[var(--apple-text)]'
                          : current
                            ? 'font-medium text-[var(--apple-blue)]'
                            : 'text-[var(--apple-text-secondary)]'
                      }
                    >
                      {t(label)}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>

      <NafathModal
        open={showNafath}
        onClose={() => setShowNafath(false)}
        onSuccess={handleVerified}
        personId={buyer.id}
      />
    </>
  );
}
