import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useApp, useT } from '../context/AppContext';
import { Button, Card } from '../components/ui';
import { NafathModal } from '../components/NafathModal';

export function DiscrepancyPage() {
  const { state, resolveDiscrepancy, setStep, logAudit } = useApp();
  const t = useT();
  const [selected, setSelected] = useState<'wathq' | 'seller' | null>(null);
  const [showNafath, setShowNafath] = useState(false);
  const company = state.companies[state.selectedCr];

  const handleBoardSign = () => {
    setShowNafath(true);
  };

  const handleSigned = () => {
    resolveDiscrepancy();
    logAudit('kyb.board_resolution', 'Board resolution e-signed — authoritative baseline stored');
    setStep('transfer_init');
  };

  return (
    <>
      <Card title={t('discrepancy.title')} subtitle={t('discrepancy.desc')}>
        <div className="mb-4 flex items-start gap-3 rounded-lg bg-amber-50 p-4 text-amber-900">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="text-sm">{t('discrepancy.desc')}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <button
            onClick={() => setSelected('seller')}
            className={`rounded-lg border p-4 text-start ${selected === 'seller' ? 'border-brand-500 bg-brand-50' : 'border-border'}`}
          >
            <h3 className="font-semibold">Seller declaration</h3>
            <p className="mt-1 text-sm">250,000 shares (25%)</p>
          </button>
          <button
            onClick={() => setSelected('wathq')}
            className={`rounded-lg border p-4 text-start ${selected === 'wathq' ? 'border-emerald-500 bg-emerald-50' : 'border-border'}`}
          >
            <h3 className="font-semibold">Wathq registry</h3>
            <p className="mt-1 text-sm">
              {company?.shareholders[0]?.shares.toLocaleString()} shares (
              {company?.shareholders[0]?.percentage}%)
            </p>
          </button>
        </div>

        {selected && (
          <div className="mt-6">
            <p className="mb-3 text-sm text-slate-600">{t('discrepancy.resolve')}</p>
            <Button onClick={handleBoardSign}>{t('discrepancy.board')}</Button>
          </div>
        )}
      </Card>

      <NafathModal
        open={showNafath}
        onClose={() => setShowNafath(false)}
        onSuccess={handleSigned}
        personId={company?.adminId ?? ''}
      />
    </>
  );
}
