import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useApp, useT } from '../context/AppContext';
import { Button, Card, Input } from '../components/ui';
import { WathqErrorPanel, WathqResultPanel } from '../components/WathqResultPanel';
import {
  getSellerWathqShares,
  lookupCommercialRegistration,
  sellerInWathqParties,
} from '../services/wathqMock';
import {
  DEMO_CR_API_FAIL,
  DEMO_CR_CLEAN,
  DEMO_CR_DISCREPANCY,
  DEMO_CR_INELIGIBLE,
  DEMO_CR_NOT_IN_REGISTRY,
  DEMO_SELLER_DISCREPANCY_ID,
} from '../data/seed';
import type { Company } from '../types';

export function CompanyKYBPage() {
  const { state, setCr, verifyWathq, setKybClaimedShares, setStep, logAudit } = useApp();
  const t = useT();
  const [cr, setCrLocal] = useState(state.selectedCr);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Company | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [claimedShares, setClaimedShares] = useState('250000');

  const sellerNidForCr = (crNumber: string) =>
    crNumber === DEMO_CR_DISCREPANCY
      ? state.persons[DEMO_SELLER_DISCREPANCY_ID]?.nationalId
      : state.persons[state.currentUserId]?.nationalId;

  const handleUseDocumentFallback = () => {
    if (!state.companies[cr]) return;
    const sellerClaim = parseInt(claimedShares, 10) || 250_000;
    setKybClaimedShares(sellerClaim);
    setError(null);
    logAudit(
      'kyb.api_fallback',
      'Wathq unavailable — seller proceeding with document upload fallback',
      cr
    );
    setStep('kyb_fallback');
  };

  const handleLookup = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setCr(cr);

    const response = await lookupCommercialRegistration(cr);

    if (!response.ok) {
      setError(response.error);
      logAudit('kyb.wathq_failed', `Wathq lookup failed: ${response.error}`, cr);
      setLoading(false);
      return;
    }

    const seeded = state.companies[cr];
    if (!seeded) {
      setError('NOT_FOUND');
      setLoading(false);
      return;
    }

    const company: Company = {
      ...seeded,
      wathq: response.data,
      lastVerifiedAt: new Date().toISOString(),
    };

    const sellerClaim = parseInt(claimedShares, 10);
    const sellerNid = sellerNidForCr(cr);

    if (sellerNid && !sellerInWathqParties(response.data, sellerNid)) {
      setKybClaimedShares(sellerClaim);
      logAudit(
        'kyb.seller_not_in_wathq',
        'Seller not found in Wathq parties — document fallback offered',
        `${cr} · declared ${sellerClaim.toLocaleString()} shares`
      );
      setLoading(false);
      setTimeout(() => setStep('kyb_fallback'), 400);
      return;
    }

    setResult({ ...company, wathqVerified: true });
    verifyWathq(cr);
    logAudit(
      'kyb.lookup',
      'Wathq Commercial Registration (New Legislation) lookup completed',
      `${cr} · UNN ${response.data.crNationalNumber}`
    );

    setLoading(false);

    const wathqShares = sellerNid ? getSellerWathqShares(response.data, sellerNid) : 0;
    const hasDiscrepancy =
      state.demoBranch === 'discrepancy' ||
      (cr === DEMO_CR_DISCREPANCY && sellerClaim !== wathqShares);

    if (hasDiscrepancy) {
      setTimeout(() => setStep('discrepancy'), 500);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2" title={t('step.company_kyb')} subtitle={t('badge.wathq.desc')}>
        <div className="space-y-4">
          <Input
            label={t('kyb.cr_number')}
            value={cr}
            onChange={setCrLocal}
            dir="ltr"
            placeholder={DEMO_CR_CLEAN}
          />
          <Input
            label={t('kyb.claimed_shares')}
            value={claimedShares}
            onChange={setClaimedShares}
            dir="ltr"
          />
          <p className="text-xs text-slate-500">{t('kyb.demo_crs')}</p>
          <ul className="list-disc space-y-0.5 ps-4 text-xs text-slate-500">
            <li dir="ltr">{DEMO_CR_CLEAN} — SJSC · Active · Wathq match</li>
            <li dir="ltr">{DEMO_CR_DISCREPANCY} — SJSC · share count mismatch</li>
            <li dir="ltr">{DEMO_CR_NOT_IN_REGISTRY} — SJSC · seller not in Wathq parties</li>
            <li dir="ltr">{DEMO_CR_API_FAIL} — Wathq API fail (retry once) · then fallback</li>
            <li dir="ltr">{DEMO_CR_INELIGIBLE} — LLC · Suspended (ineligible)</li>
          </ul>
          <Button onClick={handleLookup} disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> {t('kyb.verifying')}
              </span>
            ) : (
              t('kyb.lookup')
            )}
          </Button>

          {error && (
            <WathqErrorPanel
              error={error}
              onRetry={error === 'API_UNAVAILABLE' ? handleLookup : undefined}
              onDocumentFallback={
                error === 'API_UNAVAILABLE' ? handleUseDocumentFallback : undefined
              }
            />
          )}
          {result?.wathqVerified && (
            <WathqResultPanel company={result} onContinue={() => setStep('transfer_init')} />
          )}
        </div>
      </Card>
      <Card title={t('badge.wathq')}>
        <p className="text-sm text-slate-600">{t('badge.wathq.desc')}</p>
        <p className="mt-3 text-xs leading-relaxed text-slate-500">{t('kyb.eligibility_note')}</p>
        <p className="mt-2 text-xs text-slate-500">{t('kyb.fallback.reg03_note')}</p>
        <p className="mt-2 text-xs text-slate-500">
          {t('kyb.source')}:{' '}
          <a
            href="https://developer.wathq.sa/en/api/31"
            target="_blank"
            rel="noreferrer"
            className="text-brand-600 underline"
          >
            Wathq API #31
          </a>
        </p>
      </Card>
    </div>
  );
}
