import { Award, Receipt, ArrowLeft } from 'lucide-react';
import { useApp, useT } from '../context/AppContext';
import { Button, Card } from '../components/ui';
import { formatSAR, VAT_BASIS_EN } from '../utils/fees';
import { PLATFORM_VAT_NUMBER, PLATFORM_NAME_EN } from '../data/seed';

export function CompletionPage() {
  const { state, getActiveTransfer, getCompany, getPersonName, setStep } = useApp();
  const t = useT();
  const transfer = getActiveTransfer();
  const company = getCompany();
  const locale = state.language === 'ar' ? 'ar-SA' : 'en-SA';
  const role = state.currentRole;

  if (!transfer || !transfer.feeBreakdown) return null;

  const sellerProceeds =
    transfer.feeBreakdown.dealValue - transfer.feeBreakdown.totalInvoicedToSeller;
  const companyName = company
    ? state.language === 'ar'
      ? company.nameAr
      : company.nameEn
    : '—';

  const dashboardStep =
    role === 'buyer'
      ? 'buyer_dashboard'
      : role === 'seller'
        ? 'seller_dashboard'
        : role === 'platform_admin'
          ? 'platform_admin'
          : 'seller_dashboard';

  return (
    <div className="space-y-6">
      <Card title={t('complete.title')}>
        <div className="flex items-center gap-3 text-success">
          <Award className="h-8 w-8" />
          <div>
            <p className="text-lg font-semibold">{t('status.complete')}</p>
            <p className="text-sm text-slate-600">
              {t('complete.certificate_id')}: {transfer.completionCertificateId}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title={t('complete.certificate')}>
          <div className="relative overflow-hidden rounded-2xl border-2 border-brand-200 bg-gradient-to-br from-brand-50 via-white to-emerald-50/30 p-8 text-center">
            <div className="pointer-events-none absolute -end-8 -top-8 h-24 w-24 rounded-full bg-brand-100/40 blur-2xl" />
            <Award className="mx-auto h-10 w-10 text-brand-600" />
            <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
              {t('complete.certificate_heading')}
            </p>
            <p className="mt-2 font-mono text-xl font-bold text-brand-700">
              {transfer.completionCertificateId}
            </p>
            <p className="mt-4 text-sm font-medium text-slate-800">{companyName}</p>
            <p className="mt-1 text-sm text-slate-600">
              {transfer.shares.toLocaleString(locale)} {t('transfer.shares').toLowerCase()} ·{' '}
              {formatSAR(transfer.feeBreakdown.dealValue, locale)}
            </p>
            <p className="mt-4 text-xs text-slate-500">{t('complete.anonymized_note')}</p>
          </div>
        </Card>

        {role === 'buyer' ? (
          <Card title={t('complete.buyer_summary')}>
            <dl className="space-y-4 text-sm">
              <div className="flex justify-between border-b border-slate-100 pb-3">
                <dt className="text-slate-500">{t('dashboard.seller.company')}</dt>
                <dd className="font-medium">{companyName}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-3">
                <dt className="text-slate-500">{t('dash.table.seller')}</dt>
                <dd className="font-medium">{getPersonName(transfer.sellerId)}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-3">
                <dt className="text-slate-500">{t('transfer.shares')}</dt>
                <dd dir="ltr">{transfer.shares.toLocaleString(locale)}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-3">
                <dt className="text-slate-500">{t('fee.deal_value')}</dt>
                <dd className="font-semibold text-brand-700">
                  {formatSAR(transfer.feeBreakdown.dealValue, locale)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">{t('dashboard.buyer.escrow_status')}</dt>
                <dd className="font-medium text-success">{t('escrow.release')}</dd>
              </div>
            </dl>
          </Card>
        ) : (
          <Card title={t('complete.invoice')}>
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 border-b pb-3">
                <Receipt className="h-5 w-5 text-slate-500" />
                <span className="font-semibold">ZATCA Tax Invoice</span>
              </div>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt>Invoice #</dt>
                  <dd dir="ltr" className="font-mono">
                    {transfer.zatcaInvoiceNumber}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Seller</dt>
                  <dd>{transfer.sellerId}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Platform VAT #</dt>
                  <dd dir="ltr">
                    {PLATFORM_VAT_NUMBER}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>{PLATFORM_NAME_EN}</dt>
                  <dd></dd>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <dt>Platform fee (2%)</dt>
                  <dd>{formatSAR(transfer.feeBreakdown.platformFee, locale)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>VAT 15%</dt>
                  <dd>{formatSAR(transfer.feeBreakdown.vatOnFee, locale)}</dd>
                </div>
                <div className="flex justify-between font-semibold">
                  <dt>Total</dt>
                  <dd>{formatSAR(transfer.feeBreakdown.totalInvoicedToSeller, locale)}</dd>
                </div>
              </dl>
              <p className="mt-3 text-xs text-slate-500">{VAT_BASIS_EN}</p>
            </div>
          </Card>
        )}
      </div>

      {role !== 'buyer' && (
        <Card title={t('complete.escrow_settlement')}>
          <dl className="grid gap-2 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-slate-500">{t('fee.deal_value')}</dt>
              <dd>{formatSAR(transfer.feeBreakdown.dealValue, locale)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">{t('complete.fee_deducted')}</dt>
              <dd>{formatSAR(transfer.feeBreakdown.totalInvoicedToSeller, locale)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">{t('complete.net_seller')}</dt>
              <dd className="font-semibold text-success">{formatSAR(sellerProceeds, locale)}</dd>
            </div>
          </dl>
        </Card>
      )}

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => setStep(dashboardStep)} className="gap-2">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t('complete.back_dashboard')}
        </Button>
      </div>
    </div>
  );
}
