import { useState } from 'react';
import { FileSignature, CheckCircle2 } from 'lucide-react';
import { useApp, useT } from '../context/AppContext';
import { NafathModal } from '../components/NafathModal';
import { Button, Card, StatusChip } from '../components/ui';
import { DEMO_COMPANY_ADMIN_ID, DEMO_BUYER_ID } from '../data/seed';
import type { Role, TransferStep } from '../types';

const SIGN_ORDER: Array<'seller' | 'company' | 'buyer'> = ['seller', 'company', 'buyer'];

const ROLE_PARTY: Partial<Record<Role, 'seller' | 'company' | 'buyer'>> = {
  seller: 'seller',
  buyer: 'buyer',
  company_admin: 'company',
};

function afterSignStep(role: Role, allSigned: boolean): TransferStep {
  if (allSigned && role === 'buyer') return 'escrow';
  if (role === 'seller') return 'seller_dashboard';
  if (role === 'buyer') return 'buyer_dashboard';
  if (role === 'company_admin') return 'company_rofr';
  return 'signing';
}

export function SigningPage() {
  const { state, getActiveTransfer, signDocument, setStep, getPersonName } = useApp();
  const t = useT();
  const transfer = getActiveTransfer();
  const [showNafath, setShowNafath] = useState(false);
  const [signingParty, setSigningParty] = useState<'seller' | 'company' | 'buyer' | null>(null);

  if (!transfer) return null;

  if (state.demoBranch === 'declined_sign') {
    return (
      <Card title={t('sign.title')}>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="font-medium text-red-800">Party declined to sign</p>
          <p className="mt-1 text-sm">Dhamen escrow refund initiated for buyer</p>
        </div>
      </Card>
    );
  }

  const myParty = ROLE_PARTY[state.currentRole];
  const partyPersonId: Record<'seller' | 'company' | 'buyer', string> = {
    seller: transfer.sellerId,
    company: DEMO_COMPANY_ADMIN_ID,
    buyer: DEMO_BUYER_ID,
  };
  const nextToSign = SIGN_ORDER.find(
    (p) => transfer.signatures.find((s) => s.party === p)?.status !== 'signed'
  );
  const allSigned = transfer.signatures.every((s) => s.status === 'signed');
  const mySig = myParty ? transfer.signatures.find((s) => s.party === myParty) : null;
  const mySigned = mySig?.status === 'signed';
  const isMyTurn = myParty === nextToSign;

  const handleSign = () => {
    if (!myParty) return;
    setSigningParty(myParty);
    setShowNafath(true);
  };

  const handleSigned = () => {
    if (!signingParty) return;
    signDocument(signingParty);
    const willAllBeSigned = transfer.signatures.every(
      (s) => s.party === signingParty || s.status === 'signed'
    );
    setStep(afterSignStep(state.currentRole, willAllBeSigned));
    setSigningParty(null);
  };

  return (
    <>
      <Card title={t('sign.title')} subtitle={t('sign.order')}>
        <div className="mb-6 rounded-lg border bg-slate-50 p-4">
          <div className="flex items-center gap-2">
            <FileSignature className="h-5 w-5 text-brand-600" />
            <span className="font-medium">Transfer Deed + ZATCA Price Declaration</span>
          </div>
          <p className="mt-2 text-sm text-slate-600">Bilingual · Tamper-proof · Document vault</p>
        </div>

        {myParty ? (
          <div className="space-y-4">
            <div
              className={`flex items-center justify-between rounded-lg border p-4 ${
                mySigned
                  ? 'border-emerald-200 bg-emerald-50'
                  : isMyTurn
                    ? 'border-brand-200 bg-brand-50'
                    : 'border-border bg-slate-50'
              }`}
            >
              <div>
                <span className="font-medium capitalize">{myParty}</span>
                <span className="ms-2 text-sm text-slate-500">
                  {getPersonName(partyPersonId[myParty])}
                </span>
              </div>
              {mySigned ? (
                <StatusChip status={t('status.signed')} variant="success" />
              ) : isMyTurn ? (
                <Button onClick={handleSign}>Sign via Nafath</Button>
              ) : (
                <StatusChip status={t('dashboard.waiting_signing')} variant="default" />
              )}
            </div>

            {!mySigned && !isMyTurn && (
              <p className="text-sm text-slate-600">{t('dashboard.waiting_signing')}</p>
            )}

            {mySigned && allSigned && state.currentRole === 'buyer' && (
              <div className="flex items-center gap-2 text-success">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">{t('sign.sealed')}</span>
                <Button className="ms-auto" onClick={() => setStep('escrow')}>
                  {t('dashboard.action.pay')}
                </Button>
              </div>
            )}

            {mySigned && !allSigned && (
              <p className="text-sm text-slate-600">{t('dashboard.waiting_signing')}</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-600">Switch to Seller, Company Admin, or Buyer to sign.</p>
        )}
      </Card>

      <NafathModal
        open={showNafath}
        onClose={() => setShowNafath(false)}
        onSuccess={handleSigned}
        personId={signingParty ? partyPersonId[signingParty] : transfer.sellerId}
      />
    </>
  );
}
