import { useState } from 'react';
import { Smartphone, Loader2 } from 'lucide-react';
import { useApp, useT } from '../context/AppContext';
import { mockNafathVerify } from '../services/mockApi';
import { Button, Card } from './ui';

interface NafathModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  personId: string;
}

export function NafathModal({ open, onClose, onSuccess, personId }: NafathModalProps) {
  const t = useT();
  const { verifyIdentity } = useApp();
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'code' | 'waiting' | 'done'>('code');
  const demoCode = String(Math.floor(Math.random() * 90) + 10);

  if (!open) return null;

  const handleConfirm = async () => {
    if (code.length !== 2) return;
    setStep('waiting');
    const result = await mockNafathVerify(code);
    if (result.success) {
      verifyIdentity(personId);
      setStep('done');
      setTimeout(() => {
        onSuccess();
        onClose();
        setStep('code');
        setCode('');
      }, 1200);
    } else {
      setStep('code');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Card className="w-full max-w-md" title={t('nafath.title')}>
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg bg-brand-50 p-4">
            <Smartphone className="h-8 w-8 text-brand-600" />
            <div>
              <p className="text-sm font-medium">{t('badge.nafath')}</p>
              <p className="text-xs text-slate-600">{t('badge.nafath.desc')}</p>
            </div>
          </div>

          {step === 'code' && (
            <>
              <p className="text-sm text-slate-600">{t('nafath.code')}</p>
              <div className="rounded-lg bg-slate-100 p-4 text-center">
                <span className="text-3xl font-bold tracking-widest text-brand-700">{demoCode}</span>
              </div>
              <input
                type="text"
                maxLength={2}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 2))}
                placeholder="00"
                dir="ltr"
                className="w-full rounded-lg border border-border px-3 py-3 text-center text-2xl tracking-widest"
              />
              <Button onClick={handleConfirm} disabled={code.length !== 2} className="w-full">
                {t('nafath.confirm')}
              </Button>
            </>
          )}

          {step === 'waiting' && (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
              <p className="text-sm text-slate-600">{t('nafath.waiting')}</p>
            </div>
          )}

          {step === 'done' && (
            <div className="py-6 text-center text-success font-medium">{t('nafath.success')}</div>
          )}

          <Button variant="ghost" onClick={onClose} className="w-full">
            {t('common.cancel')}
          </Button>
        </div>
      </Card>
    </div>
  );
}
