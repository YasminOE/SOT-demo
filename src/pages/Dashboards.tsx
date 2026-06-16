import {
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle2,
  Circle,
  ArrowLeftRight,
  PieChart,
  Banknote,
  Eye,
  ChevronRight,
  Building2,
  PlusCircle,
  FileCheck,
  Award,
  Download,
} from 'lucide-react';
import { useApp, useT } from '../context/AppContext';
import { StatusChip, Button } from '../components/ui';
import { formatSAR } from '../utils/fees';
import { DashboardPanel, KpiCard, QuickActionTile } from '../components/dashboard/DashboardPrimitives';
import type { Transfer, TransferStatus } from '../types';
import type { TranslationKey } from '../i18n/translations';

function WaitingBanner({ message }: { message: string }) {
  return (
    <div className="od-panel mb-4 flex items-start gap-3 bg-[rgba(255,149,0,0.08)] p-4">
      <Clock className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[var(--apple-orange)]" strokeWidth={1.75} />
      <p className="text-[14px] tracking-[-0.01em] text-[var(--apple-text)]">{message}</p>
    </div>
  );
}

function CertificateBanner({
  certificateId,
  companyName,
  shares,
  locale,
  onView,
}: {
  certificateId: string;
  companyName: string;
  shares: number;
  locale: string;
  onView: () => void;
}) {
  const t = useT();
  return (
    <div className="od-panel relative overflow-hidden p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[var(--apple-green)] text-white">
            <Award className="h-6 w-6" strokeWidth={1.75} />
          </div>
          <div>
            <p className="apple-caption font-medium text-[#248a3d]">{t('dash.certificate.ready')}</p>
            <p className="apple-headline mt-1">{companyName}</p>
            <p className="mt-0.5 font-mono text-[13px] text-[var(--apple-blue)]">{certificateId}</p>
            <p className="apple-caption mt-1">
              {shares.toLocaleString(locale)} {t('transfer.shares').toLowerCase()}
            </p>
          </div>
        </div>
        <Button onClick={onView} className="gap-2">
          <Download className="h-4 w-4" />
          {t('dash.certificate.view')}
        </Button>
      </div>
    </div>
  );
}

const STATUS_LABEL: Partial<Record<TransferStatus, TranslationKey>> = {
  fo_pending: 'status.transfer.fo_pending',
  fo_flagged: 'status.transfer.fo_flagged',
  buyer_pending: 'status.transfer.buyer_pending',
  rofr_active: 'status.transfer.rofr_active',
  signing: 'status.transfer.signing',
  escrow_pending: 'status.transfer.escrow_pending',
  escrow_funded: 'status.transfer.escrow_funded',
  moci_pending: 'status.transfer.moci_pending',
  complete: 'status.transfer.complete',
};

function statusLabelForRole(
  status: TransferStatus,
  role: 'seller' | 'buyer' | 'company_admin' | 'platform_admin',
  t: ReturnType<typeof useT>
): string | null {
  if (role === 'seller' && status === 'buyer_pending') {
    return t('status.seller.awaiting_buyer');
  }
  if (role === 'buyer' && status === 'buyer_pending') {
    return t('status.buyer.confirm_required');
  }
  const key = STATUS_LABEL[status];
  return key ? t(key) : null;
}

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

function TransferDetailPanel({
  transfer,
  companyName,
  buyerName,
  buyerMobile,
  locale,
}: {
  transfer: Transfer;
  companyName: string;
  buyerName: string;
  buyerMobile: string;
  locale: string;
}) {
  const t = useT();
  const dealValue = transfer.feeBreakdown?.dealValue ?? transfer.pricePerShare * transfer.shares;
  const netProceeds = transfer.feeBreakdown
    ? dealValue - transfer.feeBreakdown.totalInvoicedToSeller
    : dealValue;

  const milestones: { key: string; label: TranslationKey }[] = [
    { key: 'initiated', label: 'timeline.initiated' },
    { key: 'fo', label: 'timeline.fo' },
    { key: 'buyer', label: 'timeline.buyer' },
    { key: 'rofr', label: 'timeline.rofr' },
    { key: 'signing', label: 'timeline.signing' },
    { key: 'payment', label: 'timeline.payment' },
    { key: 'complete', label: 'timeline.complete' },
  ];

  return (
    <div className="border-t border-slate-100 bg-slate-50/50 p-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-800">
            {t('dashboard.seller.transfer_request')}
          </h3>
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-slate-500">{t('dashboard.seller.company')}</dt>
              <dd className="mt-0.5 font-medium">{companyName}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">{t('dashboard.seller.buyer')}</dt>
              <dd className="mt-0.5 font-medium">{buyerName}</dd>
              <dd className="text-xs text-slate-400" dir="ltr">
                {buyerMobile}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">{t('dashboard.seller.deal_value')}</dt>
              <dd className="mt-0.5 text-lg font-bold text-brand-700">{formatSAR(dealValue, locale)}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">{t('dashboard.seller.net_proceeds')}</dt>
              <dd className="mt-0.5 font-semibold">{formatSAR(netProceeds, locale)}</dd>
            </div>
          </dl>
          {transfer.fairnessOpinion && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-500">{t('dashboard.seller.fo_ref')}:</span>
              <span className="font-mono">{transfer.fairnessOpinion.referenceNumber}</span>
              <StatusChip
                status={transfer.fairnessOpinion.inRange ? t('fo.in_range') : t('fo.out_of_range')}
                variant={transfer.fairnessOpinion.inRange ? 'success' : 'warning'}
              />
            </div>
          )}
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold text-slate-800">{t('dashboard.seller.timeline')}</p>
          <ol className="space-y-2">
            {milestones.map(({ key, label }) => {
              const done = milestoneDone(transfer.status, key);
              return (
                <li key={key} className="flex items-center gap-2 text-sm">
                  {done ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Circle className="h-4 w-4 text-slate-300" />
                  )}
                  <span className={done ? 'text-slate-700' : 'text-slate-400'}>{t(label)}</span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}

function BuyerOfferDetailPanel({
  transfer,
  companyName,
  sellerName,
  sellerMobile,
  locale,
  onConfirm,
  onSign,
  onPay,
  canConfirm,
  canSign,
  canPay,
}: {
  transfer: Transfer;
  companyName: string;
  sellerName: string;
  sellerMobile: string;
  locale: string;
  onConfirm: () => void;
  onSign: () => void;
  onPay: () => void;
  canConfirm: boolean;
  canSign: boolean;
  canPay: boolean;
}) {
  const t = useT();
  const dealValue = transfer.feeBreakdown?.dealValue ?? transfer.pricePerShare * transfer.shares;

  const milestones: { key: string; label: TranslationKey }[] = [
    { key: 'initiated', label: 'timeline.initiated' },
    { key: 'fo', label: 'timeline.fo' },
    { key: 'buyer', label: 'timeline.buyer' },
    { key: 'rofr', label: 'timeline.rofr' },
    { key: 'signing', label: 'timeline.signing' },
    { key: 'payment', label: 'timeline.payment' },
    { key: 'complete', label: 'timeline.complete' },
  ];

  return (
    <div className="border-t border-slate-100 bg-slate-50/50 p-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-800">
            {t('dashboard.buyer.offer_detail')}
          </h3>
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-slate-500">{t('dashboard.seller.company')}</dt>
              <dd className="mt-0.5 font-medium">{companyName}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">{t('dash.table.seller')}</dt>
              <dd className="mt-0.5 font-medium">{sellerName}</dd>
              <dd className="text-xs text-slate-400" dir="ltr">
                {sellerMobile}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">{t('dashboard.seller.deal_value')}</dt>
              <dd className="mt-0.5 text-lg font-bold text-brand-700">{formatSAR(dealValue, locale)}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">{t('dashboard.buyer.escrow_due')}</dt>
              <dd className="mt-0.5 font-semibold">
                {transfer.escrowStatus === 'funded' || transfer.escrowStatus === 'released'
                  ? t('escrow.funded')
                  : formatSAR(dealValue, locale)}
              </dd>
            </div>
          </dl>
          {transfer.fairnessOpinion && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-500">{t('dashboard.seller.fo_ref')}:</span>
              <span className="font-mono">{transfer.fairnessOpinion.referenceNumber}</span>
              <StatusChip
                status={transfer.fairnessOpinion.inRange ? t('fo.in_range') : t('fo.out_of_range')}
                variant={transfer.fairnessOpinion.inRange ? 'success' : 'warning'}
              />
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {canConfirm && (
              <Button onClick={onConfirm} className="gap-1">
                {t('dashboard.action.confirm')}
                <ChevronRight className="h-4 w-4 rtl:rotate-180" />
              </Button>
            )}
            {canSign && (
              <Button onClick={onSign}>{t('dashboard.action.sign')}</Button>
            )}
            {canPay && (
              <Button onClick={onPay}>{t('dashboard.action.pay')}</Button>
            )}
          </div>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold text-slate-800">{t('dashboard.seller.timeline')}</p>
          <ol className="space-y-2">
            {milestones.map(({ key, label }) => {
              const done = milestoneDone(transfer.status, key);
              return (
                <li key={key} className="flex items-center gap-2 text-sm">
                  {done ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Circle className="h-4 w-4 text-slate-300" />
                  )}
                  <span className={done ? 'text-slate-700' : 'text-slate-400'}>{t(label)}</span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}

export function SellerDashboard() {
  const { state, getActiveTransfer, getCompany, getPersonName, setStep } = useApp();
  const t = useT();
  const transfer = getActiveTransfer();
  const company = getCompany();
  const locale = state.language === 'ar' ? 'ar-SA' : 'en-SA';

  const waitingBuyer = transfer?.status === 'buyer_pending';
  const waitingRofr = transfer?.status === 'rofr_active';
  const sellerSig = transfer?.signatures.find((s) => s.party === 'seller');
  const canSign = transfer?.status === 'signing' && sellerSig?.status !== 'signed';
  const sellerSigned = sellerSig?.status === 'signed';

  const portfolioValue = company ? 250_000 * company.referencePricePerShare : 0;
  const dealValue = transfer?.feeBreakdown?.dealValue ?? 0;
  const netProceeds = transfer?.feeBreakdown
    ? dealValue - transfer.feeBreakdown.totalInvoicedToSeller
    : 0;
  const transfers = Object.values(state.transfers);
  const activeStatusLabel = transfer
    ? statusLabelForRole(transfer.status, 'seller', t)
    : null;
  const showCertificate =
    transfer?.status === 'complete' && !!transfer.completionCertificateId;

  return (
    <div className="space-y-7">
      {waitingBuyer && <WaitingBanner message={t('dashboard.seller.waiting_buyer')} />}
      {waitingRofr && <WaitingBanner message={t('dashboard.waiting_rofr')} />}
      {transfer?.status === 'signing' && sellerSigned && (
        <WaitingBanner message={t('dashboard.waiting_signing')} />
      )}
      {showCertificate && company && transfer.completionCertificateId && (
        <CertificateBanner
          certificateId={transfer.completionCertificateId}
          companyName={state.language === 'ar' ? company.nameAr : company.nameEn}
          shares={transfer.shares}
          locale={locale}
          onView={() => setStep('complete')}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label={t('dash.stat.portfolio')}
          value={formatSAR(portfolioValue, locale)}
          hint={company ? (state.language === 'ar' ? company.nameAr : company.nameEn) : undefined}
          icon={PieChart}
        />
        <KpiCard
          label={t('dash.stat.active')}
          value={String(transfers.length)}
          hint={t('dash.stat.active_hint')}
          icon={ArrowLeftRight}
        />
        <KpiCard
          label={t('dash.stat.proceeds')}
          value={transfer ? formatSAR(netProceeds, locale) : '—'}
          hint={t('dash.stat.proceeds_hint')}
          icon={Banknote}
        />
      </div>

      <div>
        <h2 className="apple-headline mb-3">{t('dash.cta.quick_actions')}</h2>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {!company?.wathqVerified && (
            <QuickActionTile
              label={t('dash.cta.register_company')}
              icon={Building2}
              onClick={() => setStep('company_kyb')}
              primary
            />
          )}
          <QuickActionTile
            label={t('dash.cta.new_transfer')}
            icon={PlusCircle}
            onClick={() => setStep('transfer_init')}
            primary={!!company?.wathqVerified}
          />
          <QuickActionTile
            label={t('dash.cta.view_transfers')}
            icon={ArrowLeftRight}
            onClick={() => setStep('seller_transfers')}
          />
          {canSign && (
            <QuickActionTile
              label={t('dashboard.action.sign')}
              icon={FileCheck}
              onClick={() => setStep('signing')}
              primary
            />
          )}
          {showCertificate && (
            <QuickActionTile
              label={t('dash.certificate.view')}
              icon={Award}
              onClick={() => setStep('complete')}
              primary
            />
          )}
        </div>
      </div>

      <DashboardPanel title={t('dash.cta.active_transfer')}>
          {transfer && company ? (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-medium">{state.language === 'ar' ? company.nameAr : company.nameEn}</p>
                <p className="text-sm text-slate-500">
                  {transfer.shares.toLocaleString(locale)} @ {formatSAR(transfer.pricePerShare, locale)} ·{' '}
                  {getPersonName(transfer.buyerId)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {activeStatusLabel && (
                  <StatusChip status={activeStatusLabel} variant="info" />
                )}
                <Button variant="secondary" onClick={() => setStep('seller_transfers')}>
                  {t('dash.table.view')}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">{t('dash.cta.no_active')}</p>
          )}
      </DashboardPanel>
    </div>
  );
}

export function SellerTransfersPage() {
  const { state, getActiveTransfer, getCompany, getPersonName, setStep } = useApp();
  const t = useT();
  const transfer = getActiveTransfer();
  const company = getCompany();
  const locale = state.language === 'ar' ? 'ar-SA' : 'en-SA';
  const buyer = transfer ? state.persons[transfer.buyerId] : null;

  const waitingBuyer = transfer?.status === 'buyer_pending';
  const waitingRofr = transfer?.status === 'rofr_active';
  const sellerSig = transfer?.signatures.find((s) => s.party === 'seller');
  const canSign = transfer?.status === 'signing' && sellerSig?.status !== 'signed';
  const transfers = Object.values(state.transfers);

  return (
    <div className="space-y-6">
      {waitingBuyer && <WaitingBanner message={t('dashboard.seller.waiting_buyer')} />}
      {waitingRofr && <WaitingBanner message={t('dashboard.waiting_rofr')} />}
      {canSign && (
        <Button onClick={() => setStep('signing')}>{t('dashboard.action.sign')}</Button>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <div className="od-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-[var(--apple-separator)] bg-[var(--apple-fill-secondary)] text-start od-table-head">
                    <th className="px-5 py-3">{t('dash.table.ref')}</th>
                    <th className="px-5 py-3">{t('dashboard.seller.company')}</th>
                    <th className="px-5 py-3">{t('dashboard.seller.buyer')}</th>
                    <th className="px-5 py-3">{t('transfer.shares')}</th>
                    <th className="px-5 py-3">{t('dashboard.seller.deal_value')}</th>
                    <th className="px-5 py-3">{t('dash.table.status')}</th>
                    <th className="px-5 py-3">{t('dash.table.action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-16 text-center">
                        <ArrowLeftRight className="mx-auto mb-3 h-10 w-10 text-slate-200" />
                        <p className="font-medium text-slate-600">{t('dashboard.seller.no_transfer')}</p>
                        <Button
                          className="mt-4"
                          onClick={() => setStep('transfer_init')}
                        >
                          {t('nav.new_transfer')}
                        </Button>
                      </td>
                    </tr>
                  ) : (
                    transfers.map((tr) => {
                      const co = state.companies[tr.companyCr];
                      const coName = co
                        ? state.language === 'ar'
                          ? co.nameAr
                          : co.nameEn
                        : '—';
                      const statusLabel = statusLabelForRole(tr.status, 'seller', t);
                      const dv = tr.feeBreakdown?.dealValue ?? tr.pricePerShare * tr.shares;
                      return (
                        <tr
                          key={tr.id}
                          className="border-b border-[var(--apple-separator)] transition-colors hover:bg-[var(--apple-fill-secondary)]"
                        >
                          <td className="px-5 py-4 font-mono text-xs text-slate-500">{tr.id}</td>
                          <td className="max-w-[160px] truncate px-5 py-4 font-medium">{coName}</td>
                          <td className="px-5 py-4">{getPersonName(tr.buyerId)}</td>
                          <td className="px-5 py-4" dir="ltr">
                            {tr.shares.toLocaleString(locale)}
                          </td>
                          <td className="px-5 py-4 font-medium">{formatSAR(dv, locale)}</td>
                          <td className="px-5 py-4">
                            {statusLabel && (
                              <StatusChip
                                status={statusLabel}
                                variant={
                                  tr.status === 'complete'
                                    ? 'success'
                                    : tr.status === 'fo_flagged'
                                      ? 'warning'
                                      : 'info'
                                }
                              />
                            )}
                          </td>
                          <td className="px-5 py-4">
                            {tr.status === 'signing' &&
                            tr.signatures.find((s) => s.party === 'seller')?.status !== 'signed' ? (
                              <Button
                                variant="ghost"
                                className="!px-2 !py-1 !text-xs"
                                onClick={() => setStep('signing')}
                              >
                                {t('dashboard.action.sign')}
                              </Button>
                            ) : (
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                {t('dash.table.view')}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {transfer && company && (
              <TransferDetailPanel
                transfer={transfer}
                companyName={state.language === 'ar' ? company.nameAr : company.nameEn}
                buyerName={getPersonName(transfer.buyerId)}
                buyerMobile={buyer?.mobile ?? '—'}
                locale={locale}
              />
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="od-panel p-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-800">{t('dashboard.seller.holdings')}</h3>
            {company ? (
              <div className="space-y-2 text-sm">
                <p className="font-medium">{state.language === 'ar' ? company.nameAr : company.nameEn}</p>
                <p className="text-slate-500">250,000 · 25%</p>
                <p className="text-brand-700">
                  Ref {formatSAR(company.referencePricePerShare, locale)}/share
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-400">—</p>
            )}
          </div>

          <div className="od-panel p-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-800">{t('dashboard.seller.fees')}</h3>
            {transfer?.feeBreakdown ? (
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Platform</dt>
                  <dd>{formatSAR(transfer.feeBreakdown.platformFee, locale)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">VAT</dt>
                  <dd>{formatSAR(transfer.feeBreakdown.vatOnFee, locale)}</dd>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-2 font-semibold">
                  <dt>Total</dt>
                  <dd>{formatSAR(transfer.feeBreakdown.totalInvoicedToSeller, locale)}</dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-slate-400">—</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export function BuyerDashboard() {
  const { state, getActiveTransfer, getPersonName, setStep } = useApp();
  const t = useT();
  const transfer = getActiveTransfer();
  const locale = state.language === 'ar' ? 'ar-SA' : 'en-SA';

  const buyerOffers = Object.values(state.transfers).filter(
    (tr) => tr.buyerId === state.currentUserId
  );
  const pendingCount = buyerOffers.filter((tr) => tr.status === 'buyer_pending').length;
  const canConfirm = transfer?.status === 'buyer_pending';
  const canPay = transfer?.status === 'escrow_pending';
  const buyerSig = transfer?.signatures.find((s) => s.party === 'buyer');
  const canSign = transfer?.status === 'signing' && buyerSig?.status !== 'signed';
  const dealValue = transfer?.feeBreakdown?.dealValue ?? (transfer
    ? transfer.pricePerShare * transfer.shares
    : 0);
  const company = transfer ? state.companies[transfer.companyCr] : null;
  const activeStatusLabel = transfer
    ? statusLabelForRole(transfer.status, 'buyer', t)
    : null;
  const showCertificate =
    transfer?.status === 'complete' && !!transfer.completionCertificateId;

  return (
    <div className="space-y-7">
      {transfer?.status === 'rofr_active' && (
        <WaitingBanner message={t('dashboard.waiting_rofr')} />
      )}
      {transfer?.status === 'signing' && !canSign && (
        <WaitingBanner message={t('dashboard.waiting_signing')} />
      )}
      {canPay && <WaitingBanner message={t('dashboard.waiting_escrow')} />}
      {showCertificate && company && transfer.completionCertificateId && (
        <CertificateBanner
          certificateId={transfer.completionCertificateId}
          companyName={state.language === 'ar' ? company.nameAr : company.nameEn}
          shares={transfer.shares}
          locale={locale}
          onView={() => setStep('complete')}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label={t('dash.stat.pending_offers')}
          value={String(pendingCount)}
          hint={t('dashboard.buyer.offers')}
          icon={TrendingUp}
        />
        <KpiCard
          label={t('dash.stat.investment')}
          value={transfer ? formatSAR(dealValue, locale) : '—'}
          hint={company ? (state.language === 'ar' ? company.nameAr : company.nameEn) : undefined}
          icon={PieChart}
        />
        <KpiCard
          label={t('dash.stat.buyer_fee')}
          value={formatSAR(0, locale)}
          hint={t('dash.stat.buyer_fee_hint')}
          icon={Wallet}
        />
      </div>

      <div>
        <h2 className="apple-headline mb-3">{t('dash.cta.quick_actions')}</h2>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {canConfirm && (
            <QuickActionTile
              label={t('dash.cta.confirm_offer')}
              icon={FileCheck}
              onClick={() => setStep('buyer_confirm')}
              primary
            />
          )}
          <QuickActionTile
            label={t('dash.cta.view_offers')}
            icon={TrendingUp}
            onClick={() => setStep('buyer_offers')}
            primary={!canConfirm}
          />
          {canSign && (
            <QuickActionTile
              label={t('dashboard.action.sign')}
              icon={FileCheck}
              onClick={() => setStep('signing')}
              primary
            />
          )}
          {canPay && (
            <QuickActionTile
              label={t('dashboard.action.pay')}
              icon={Wallet}
              onClick={() => setStep('escrow')}
              primary
            />
          )}
          {showCertificate && (
            <QuickActionTile
              label={t('dash.certificate.view')}
              icon={Award}
              onClick={() => setStep('complete')}
              primary
            />
          )}
        </div>
      </div>

      <DashboardPanel title={t('dash.cta.active_transfer')}>
          {transfer && company ? (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-medium">{state.language === 'ar' ? company.nameAr : company.nameEn}</p>
                <p className="text-sm text-slate-500">
                  {t('dash.table.from')} {getPersonName(transfer.sellerId)} ·{' '}
                  {formatSAR(dealValue, locale)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {activeStatusLabel && <StatusChip status={activeStatusLabel} variant="info" />}
                <Button variant="secondary" onClick={() => setStep('buyer_offers')}>
                  {t('dash.table.view')}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">{t('dashboard.buyer.no_offers')}</p>
          )}
      </DashboardPanel>
    </div>
  );
}

export function BuyerOffersPage() {
  const { state, getActiveTransfer, getPersonName, setStep } = useApp();
  const t = useT();
  const transfer = getActiveTransfer();
  const locale = state.language === 'ar' ? 'ar-SA' : 'en-SA';

  const buyerOffers = Object.values(state.transfers).filter(
    (tr) => tr.buyerId === state.currentUserId
  );
  const canConfirm = transfer?.status === 'buyer_pending';
  const canPay = transfer?.status === 'escrow_pending';
  const buyerSig = transfer?.signatures.find((s) => s.party === 'buyer');
  const canSign = transfer?.status === 'signing' && buyerSig?.status !== 'signed';

  const dealValue = transfer?.feeBreakdown?.dealValue ?? (transfer
    ? transfer.pricePerShare * transfer.shares
    : 0);
  const company = transfer ? state.companies[transfer.companyCr] : null;
  const seller = transfer ? state.persons[transfer.sellerId] : null;

  return (
    <div className="space-y-6">
      {transfer?.status === 'rofr_active' && (
        <WaitingBanner message={t('dashboard.waiting_rofr')} />
      )}
      {canPay && <WaitingBanner message={t('dashboard.waiting_escrow')} />}

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <div className="od-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-[var(--apple-separator)] bg-[var(--apple-fill-secondary)] text-start od-table-head">
                    <th className="px-5 py-3">{t('dash.table.ref')}</th>
                    <th className="px-5 py-3">{t('dashboard.seller.company')}</th>
                    <th className="px-5 py-3">{t('dash.table.seller')}</th>
                    <th className="px-5 py-3">{t('transfer.shares')}</th>
                    <th className="px-5 py-3">{t('dashboard.seller.deal_value')}</th>
                    <th className="px-5 py-3">{t('dash.table.status')}</th>
                    <th className="px-5 py-3">{t('dash.table.action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {buyerOffers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-16 text-center">
                        <TrendingUp className="mx-auto mb-3 h-10 w-10 text-slate-200" />
                        <p className="font-medium text-slate-600">{t('dashboard.buyer.no_offers')}</p>
                      </td>
                    </tr>
                  ) : (
                    buyerOffers.map((tr) => {
                      const co = state.companies[tr.companyCr];
                      const coName = co
                        ? state.language === 'ar'
                          ? co.nameAr
                          : co.nameEn
                        : '—';
                      const statusLabel = statusLabelForRole(tr.status, 'buyer', t);
                      const dv = tr.feeBreakdown?.dealValue ?? tr.pricePerShare * tr.shares;
                      const isActive = transfer?.id === tr.id;
                      const rowCanConfirm = tr.status === 'buyer_pending';
                      const rowCanPay = tr.status === 'escrow_pending';
                      const rowCanSign =
                        tr.status === 'signing' &&
                        tr.signatures.find((s) => s.party === 'buyer')?.status !== 'signed';
                      return (
                        <tr
                          key={tr.id}
                          className={`border-b border-slate-50 transition-colors hover:bg-slate-50/50 ${
                            isActive ? 'bg-brand-50/30' : ''
                          }`}
                        >
                          <td className="px-5 py-4 font-mono text-xs text-slate-500">{tr.id}</td>
                          <td className="max-w-[160px] truncate px-5 py-4 font-medium">{coName}</td>
                          <td className="px-5 py-4">{getPersonName(tr.sellerId)}</td>
                          <td className="px-5 py-4" dir="ltr">
                            {tr.shares.toLocaleString(locale)}
                          </td>
                          <td className="px-5 py-4 font-medium">{formatSAR(dv, locale)}</td>
                          <td className="px-5 py-4">
                            {statusLabel && (
                              <StatusChip
                                status={statusLabel}
                                variant={
                                  tr.status === 'complete'
                                    ? 'success'
                                    : tr.status === 'fo_flagged'
                                      ? 'warning'
                                      : 'info'
                                }
                              />
                            )}
                          </td>
                          <td className="px-5 py-4">
                            {rowCanConfirm ? (
                              <Button
                                variant="ghost"
                                className="!px-2 !py-1 !text-xs"
                                onClick={() => setStep('buyer_confirm')}
                              >
                                {t('dashboard.action.confirm')}
                              </Button>
                            ) : rowCanSign ? (
                              <Button
                                variant="ghost"
                                className="!px-2 !py-1 !text-xs"
                                onClick={() => setStep('signing')}
                              >
                                {t('dashboard.action.sign')}
                              </Button>
                            ) : rowCanPay ? (
                              <Button
                                variant="ghost"
                                className="!px-2 !py-1 !text-xs"
                                onClick={() => setStep('escrow')}
                              >
                                {t('dashboard.action.pay')}
                              </Button>
                            ) : tr.status === 'complete' && tr.completionCertificateId ? (
                              <Button
                                variant="ghost"
                                className="!px-2 !py-1 !text-xs"
                                onClick={() => setStep('complete')}
                              >
                                <Award className="me-1 inline h-3.5 w-3.5" />
                                {t('dash.certificate.view')}
                              </Button>
                            ) : (
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                {t('dash.table.view')}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {transfer && company && (
              <BuyerOfferDetailPanel
                transfer={transfer}
                companyName={state.language === 'ar' ? company.nameAr : company.nameEn}
                sellerName={getPersonName(transfer.sellerId)}
                sellerMobile={seller?.mobile ?? '—'}
                locale={locale}
                canConfirm={canConfirm}
                canSign={canSign}
                canPay={canPay}
                onConfirm={() => setStep('buyer_confirm')}
                onSign={() => setStep('signing')}
                onPay={() => setStep('escrow')}
              />
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="od-panel p-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-800">
              {t('dashboard.buyer.holdings')}
            </h3>
            {transfer && company ? (
              <div className="space-y-2 text-sm">
                <p className="font-medium">{state.language === 'ar' ? company.nameAr : company.nameEn}</p>
                <p className="text-2xl font-bold text-slate-900">{formatSAR(dealValue, locale)}</p>
                <p className="text-slate-500">
                  {transfer.shares.toLocaleString(locale)} @ {formatSAR(transfer.pricePerShare, locale)}
                </p>
                {transfer.status === 'complete' && transfer.completionCertificateId && (
                  <div className="mt-3 space-y-2 rounded-xl border border-emerald-200/70 bg-emerald-50/50 p-3">
                    <div className="flex items-center gap-2 text-emerald-700">
                      <Award className="h-4 w-4" />
                      <span className="text-xs font-semibold uppercase tracking-wide">
                        {t('dash.certificate.ready')}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-brand-700">{transfer.completionCertificateId}</p>
                    <Button
                      variant="secondary"
                      className="w-full !py-1.5 !text-xs"
                      onClick={() => setStep('complete')}
                    >
                      {t('dash.certificate.view')}
                    </Button>
                  </div>
                )}
                {transfer.status === 'complete' && !transfer.completionCertificateId && (
                  <StatusChip status={t('status.transfer.complete')} variant="success" />
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400">—</p>
            )}
          </div>

          <div className="od-panel p-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-800">
              {t('dashboard.buyer.payment_summary')}
            </h3>
            {transfer ? (
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">{t('dashboard.buyer.escrow_due')}</dt>
                  <dd className="font-medium">{formatSAR(dealValue, locale)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">{t('fee.buyer_fee')}</dt>
                  <dd>{formatSAR(0, locale)}</dd>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-2">
                  <dt className="text-slate-500">{t('dashboard.buyer.escrow_status')}</dt>
                  <dd>
                    <StatusChip
                      status={
                        transfer.escrowStatus === 'released'
                          ? t('escrow.release')
                          : transfer.escrowStatus === 'funded'
                            ? t('escrow.funded')
                            : transfer.escrowStatus === 'refunded'
                              ? t('escrow.refund')
                              : t('status.transfer.escrow_pending')
                      }
                      variant={
                        transfer.escrowStatus === 'funded' || transfer.escrowStatus === 'released'
                          ? 'success'
                          : 'warning'
                      }
                    />
                  </dd>
                </div>
                <p className="pt-1 text-xs text-slate-400">{t('escrow.provider')}</p>
              </dl>
            ) : (
              <p className="text-sm text-slate-400">—</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export function PlatformAdminPage() {
  const { state } = useApp();
  const t = useT();
  const transfers = Object.values(state.transfers);
  const foIssuedCount = transfers.filter((tr) => tr.fairnessOpinion).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard label={t('admin.transfers')} value={String(transfers.length)} icon={ArrowLeftRight} />
        <KpiCard
          label={t('admin.fo_issued')}
          value={String(foIssuedCount)}
          icon={FileCheck}
        />
        <KpiCard
          label={t('status.transfer.complete')}
          value={String(transfers.filter((tr) => tr.status === 'complete').length)}
          icon={CheckCircle2}
        />
      </div>

      <div className="od-panel overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-4">
            <h3 className="font-semibold text-slate-800">{t('admin.transfers')}</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-start text-xs font-medium uppercase text-slate-500">
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Branch</th>
                <th className="px-5 py-3">FO</th>
              </tr>
            </thead>
            <tbody>
              {transfers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-slate-500">
                    No transfers yet
                  </td>
                </tr>
              ) : (
                transfers.map((tr) => (
                  <tr key={tr.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-5 py-3 font-mono text-xs">{tr.id}</td>
                    <td className="px-5 py-3">{tr.status}</td>
                    <td className="px-5 py-3">{tr.branch ?? 'happy'}</td>
                    <td className="px-5 py-3">{tr.fairnessOpinion?.referenceNumber ?? '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
      </div>
    </div>
  );
}
