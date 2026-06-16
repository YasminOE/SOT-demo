import { useState } from 'react';
import { Shield, Loader2 } from 'lucide-react';
import { useApp, useT } from '../context/AppContext';
import { Button, Card, StatusChip } from '../components/ui';
import { formatSAR } from '../utils/fees';
import { mockEscrowFund, mockEscrowRefund } from '../services/mockApi';

export function EscrowPage() {
  const { state, getActiveTransfer, fundEscrow, setStep, logAudit } = useApp();
  const t = useT();
  const transfer = getActiveTransfer();
  const [loading, setLoading] = useState(false);
  const locale = state.language === 'ar' ? 'ar-SA' : 'en-SA';

  if (!transfer || !transfer.feeBreakdown) return null;

  const isRefund = transfer.status === 'rofr_exercised' || transfer.escrowStatus === 'refunded';
  const isReleased = transfer.escrowStatus === 'released';

  const handleFund = async () => {
    setLoading(true);
    await mockEscrowFund();
    fundEscrow();
    setLoading(false);
    setStep('buyer_dashboard');
  };

  const handleRefund = async () => {
    setLoading(true);
    await mockEscrowRefund();
    logAudit('escrow.refund', 'Full refund to buyer via Dhamen (3 business days)');
    setLoading(false);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card title={t('escrow.title')} subtitle={t('escrow.subtitle')}>
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <Shield className="h-8 w-8 text-emerald-700" />
          <div>
            <p className="font-semibold text-emerald-900">{t('escrow.provider')}</p>
            <p className="text-xs text-emerald-700">{t('escrow.provider_desc')}</p>
          </div>
        </div>

        <p className="mb-4 text-sm text-slate-600">{t('escrow.note')}</p>

        <dl className="mb-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt>Deal value (escrow)</dt>
            <dd className="font-semibold">{formatSAR(transfer.feeBreakdown.dealValue, locale)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Platform fee + VAT (at release)</dt>
            <dd>{formatSAR(transfer.feeBreakdown.totalInvoicedToSeller, locale)}</dd>
          </div>
        </dl>

        <div className="mb-4">
          <StatusChip
            status={
              isRefund
                ? t('escrow.refund')
                : isReleased
                  ? t('escrow.release')
                  : transfer.escrowStatus === 'funded'
                    ? t('escrow.funded')
                    : 'Pending funding'
            }
            variant={
              isRefund ? 'danger' : isReleased ? 'success' : transfer.escrowStatus === 'funded' ? 'info' : 'warning'
            }
          />
        </div>

        {!isRefund && transfer.escrowStatus === 'pending' && (
          <Button onClick={handleFund} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('escrow.fund')}
          </Button>
        )}

        {isRefund && (
          <Button variant="secondary" onClick={handleRefund} disabled={loading}>
            Simulate refund (3 business days)
          </Button>
        )}

        {transfer.escrowStatus === 'funded' && !isRefund && (
          <Button onClick={() => setStep('buyer_dashboard')}>{t('common.next')}</Button>
        )}
      </Card>

      <Card title="Payment timeline">
        <ol className="space-y-3 text-sm">
          <li className="flex gap-2"><span className="text-success">✓</span> All parties signed</li>
          <li className="flex gap-2"><span>{transfer.escrowStatus !== 'pending' ? '✓' : '○'}</span> Buyer pays deal value into Dhamen escrow</li>
          <li className="flex gap-2"><span>{isReleased ? '✓' : '○'}</span> MoCI filing confirmed</li>
          <li className="flex gap-2"><span>{isReleased ? '✓' : '○'}</span> Release to seller (minus fee + VAT)</li>
        </ol>
      </Card>
    </div>
  );
}
