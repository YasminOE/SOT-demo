import { Award, Receipt } from 'lucide-react';
import { useApp, useT } from '../context/AppContext';
import { Button, Card } from '../components/ui';
import { formatSAR, VAT_BASIS_EN } from '../utils/fees';
import { PLATFORM_VAT_NUMBER, PLATFORM_NAME_EN } from '../data/seed';

export function CompletionPage() {
  const { state, getActiveTransfer, setStep } = useApp();
  const t = useT();
  const transfer = getActiveTransfer();
  const locale = state.language === 'ar' ? 'ar-SA' : 'en-SA';

  if (!transfer || !transfer.feeBreakdown) return null;

  const sellerProceeds =
    transfer.feeBreakdown.dealValue - transfer.feeBreakdown.totalInvoicedToSeller;

  return (
    <div className="space-y-6">
      <Card title={t('complete.title')}>
        <div className="flex items-center gap-3 text-success">
          <Award className="h-8 w-8" />
          <div>
            <p className="text-lg font-semibold">{t('status.complete')}</p>
            <p className="text-sm text-slate-600">Certificate: {transfer.completionCertificateId}</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title={t('complete.certificate')}>
          <div className="rounded-lg border-2 border-brand-200 p-6 text-center">
            <p className="text-xs uppercase tracking-wide text-slate-500">Certificate of Completion</p>
            <p className="mt-2 font-mono text-lg font-bold text-brand-700">{transfer.completionCertificateId}</p>
            <p className="mt-4 text-sm">{transfer.shares.toLocaleString()} shares transferred</p>
            <p className="text-sm text-slate-600">Anonymized record added to market dataset</p>
          </div>
        </Card>

        <Card title={t('complete.invoice')}>
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 border-b pb-3">
              <Receipt className="h-5 w-5 text-slate-500" />
              <span className="font-semibold">ZATCA Tax Invoice</span>
            </div>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><dt>Invoice #</dt><dd dir="ltr" className="font-mono">{transfer.zatcaInvoiceNumber}</dd></div>
              <div className="flex justify-between"><dt>Seller</dt><dd>{transfer.sellerId}</dd></div>
              <div className="flex justify-between"><dt>Platform VAT #</dt><dd dir="ltr">{PLATFORM_VAT_NUMBER}</dd></div>
              <div className="flex justify-between"><dt>{PLATFORM_NAME_EN}</dt><dd></dd></div>
              <div className="flex justify-between border-t pt-2"><dt>Platform fee (2%)</dt><dd>{formatSAR(transfer.feeBreakdown.platformFee, locale)}</dd></div>
              <div className="flex justify-between"><dt>VAT 15%</dt><dd>{formatSAR(transfer.feeBreakdown.vatOnFee, locale)}</dd></div>
              <div className="flex justify-between font-semibold"><dt>Total</dt><dd>{formatSAR(transfer.feeBreakdown.totalInvoicedToSeller, locale)}</dd></div>
            </dl>
            <p className="mt-3 text-xs text-slate-500">{VAT_BASIS_EN}</p>
          </div>
        </Card>
      </div>

      <Card title="Escrow settlement">
        <dl className="grid gap-2 text-sm sm:grid-cols-3">
          <div><dt className="text-slate-500">Deal value</dt><dd>{formatSAR(transfer.feeBreakdown.dealValue, locale)}</dd></div>
          <div><dt className="text-slate-500">Fee + VAT deducted</dt><dd>{formatSAR(transfer.feeBreakdown.totalInvoicedToSeller, locale)}</dd></div>
          <div><dt className="text-slate-500">Net to seller</dt><dd className="font-semibold text-success">{formatSAR(sellerProceeds, locale)}</dd></div>
        </dl>
      </Card>

      <div className="flex gap-3">
        <Button onClick={() => setStep('seller_dashboard')}>Seller Dashboard</Button>
        <Button variant="secondary" onClick={() => setStep('buyer_dashboard')}>Buyer Dashboard</Button>
        <Button variant="secondary" onClick={() => setStep('platform_admin')}>Platform Admin</Button>
      </div>
    </div>
  );
}
