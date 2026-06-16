import { useState } from 'react';
import { FileUp, Info } from 'lucide-react';
import { useApp, useT } from '../context/AppContext';
import { Button, Card } from '../components/ui';
import type { KybDocumentType } from '../types';

const DOC_TYPES: KybDocumentType[] = [
  'share_certificate',
  'subscription_agreement',
  'board_resolution',
];

export function KybFallbackPage() {
  const { state, verifyKybFallback, setStep } = useApp();
  const t = useT();
  const company = state.companies[state.selectedCr];
  const claimedShares = state.kybClaimedShares ?? 250_000;
  const [docType, setDocType] = useState<KybDocumentType>('share_certificate');
  const [uploaded, setUploaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!company) return null;

  const handleUpload = () => {
    setUploaded(true);
  };

  const handleSubmit = () => {
    setSubmitting(true);
    verifyKybFallback({
      crNumber: state.selectedCr,
      documentType: docType,
      claimedShares,
    });
    setTimeout(() => {
      setSubmitting(false);
      setStep('transfer_init');
    }, 800);
  };

  return (
    <Card title={t('kyb.fallback.title')} subtitle={t('kyb.fallback.subtitle')}>
      <div className="mb-4 flex items-start gap-3 rounded-lg bg-amber-50 p-4 text-amber-900">
        <Info className="h-5 w-5 shrink-0" />
        <p className="text-sm">{t('kyb.fallback.reason')}</p>
      </div>

      <dl className="mb-6 grid gap-2 rounded-lg border bg-slate-50 p-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-slate-500">{t('kyb.cr_number')}</dt>
          <dd dir="ltr" className="font-mono font-medium">
            {company.crNumber}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">{t('kyb.claimed_shares')}</dt>
          <dd dir="ltr" className="font-medium">
            {claimedShares.toLocaleString()}
          </dd>
        </div>
      </dl>

      <p className="mb-3 text-sm font-medium text-slate-700">{t('kyb.fallback.doc_type')}</p>
      <div className="mb-6 grid gap-2 sm:grid-cols-3">
        {DOC_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setDocType(type)}
            className={`rounded-lg border p-3 text-start text-sm ${
              docType === type
                ? 'border-brand-500 bg-brand-50 text-brand-900'
                : 'border-border hover:border-slate-300'
            }`}
          >
            {t(`kyb.fallback.doc.${type}`)}
          </button>
        ))}
      </div>

      <div className="mb-6 rounded-lg border border-dashed border-slate-300 p-6 text-center">
        {uploaded ? (
          <p className="text-sm font-medium text-emerald-700">{t('kyb.fallback.uploaded')}</p>
        ) : (
          <>
            <FileUp className="mx-auto mb-2 h-8 w-8 text-slate-400" />
            <p className="mb-3 text-sm text-slate-600">{t('kyb.fallback.upload_hint')}</p>
            <Button variant="secondary" onClick={handleUpload}>
              {t('kyb.fallback.upload')}
            </Button>
          </>
        )}
      </div>

      <p className="mb-4 text-xs text-slate-500">{t('kyb.fallback.review_note')}</p>

      <Button onClick={handleSubmit} disabled={!uploaded || submitting}>
        {submitting ? t('kyb.fallback.submitting') : t('kyb.fallback.submit')}
      </Button>
    </Card>
  );
}
