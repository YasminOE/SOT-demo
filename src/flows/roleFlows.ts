import type { AppState, Role, Transfer, TransferStep } from '../types';

/** Steps each role actually sees in their own journey */
export function getRoleSteps(role: Role, foEnabled: boolean): TransferStep[] {
  switch (role) {
    case 'seller':
      return ['company_kyb', 'transfer_init', 'signing', 'complete'];
    case 'buyer':
      return ['buyer_confirm', 'signing', 'escrow', 'complete'];
    case 'company_admin':
      return ['company_rofr', 'signing', 'moci_filing', 'complete'];
    case 'platform_admin':
      return foEnabled
        ? ['fairness_opinion', 'platform_admin', 'complete']
        : ['platform_admin', 'complete'];
    case 'shareholder':
      return ['company_rofr', 'complete'];
    default:
      return ['auth'];
  }
}

export function canRoleAccessStep(
  role: Role,
  step: TransferStep,
  foEnabled: boolean
): boolean {
  if (step === 'auth' && role !== 'platform_admin') return true;
  const allowed = new Set(getRoleSteps(role, foEnabled));
  if (allowed.has(step)) return true;
  // Branch steps map to parent role step
  if (step === 'discrepancy' && role === 'seller') return true;
  if (step === 'kyb_fallback' && role === 'seller') return true;
  if (step === 'seller_dashboard' && role === 'seller') return true;
  if (step === 'seller_transfers' && role === 'seller') return true;
  if (step === 'buyer_dashboard' && role === 'buyer') return true;
  if (step === 'buyer_offers' && role === 'buyer') return true;
  return false;
}

function signingTurn(transfer: Transfer, party: 'seller' | 'company' | 'buyer'): boolean {
  const order: Array<'seller' | 'company' | 'buyer'> = ['seller', 'company', 'buyer'];
  const next = order.find(
    (p) => transfer.signatures.find((s) => s.party === p)?.status !== 'signed'
  );
  return next === party;
}

/** Land each role on the screen they would see at the current transfer phase */
export function resolveRoleStep(state: AppState): TransferStep {
  const transfer = state.activeTransferId
    ? state.transfers[state.activeTransferId]
    : null;
  const person = state.persons[state.currentUserId];
  const company = state.companies[state.selectedCr];

  switch (state.currentRole) {
    case 'seller':
      return resolveSellerStep(person, company, transfer, state.foEnabled, state);
    case 'buyer':
      return resolveBuyerStep(person, transfer);
    case 'company_admin':
      return resolveCompanyStep(person, transfer);
    case 'platform_admin':
      return resolvePlatformStep(transfer, state.foEnabled);
    case 'shareholder':
      return 'company_rofr';
    default:
      return 'auth';
  }
}

function resolveSellerStep(
  person: AppState['persons'][string] | undefined,
  company: AppState['companies'][string] | undefined,
  transfer: Transfer | null,
  _foEnabled: boolean,
  state: AppState
): TransferStep {
  if (!person?.identityVerified) return 'auth';
  if (!company?.wathqVerified) {
    if (state.currentStep === 'kyb_fallback') return 'kyb_fallback';
    return 'company_kyb';
  }
  if (!transfer) return 'seller_dashboard';
  if (transfer.status === 'signing' && signingTurn(transfer, 'seller')) return 'signing';
  if (transfer.status === 'complete') return 'complete';
  return 'seller_dashboard';
}

function resolveBuyerStep(
  person: AppState['persons'][string] | undefined,
  transfer: Transfer | null
): TransferStep {
  if (!person?.identityVerified) return 'auth';
  if (!transfer || transfer.status === 'fo_pending' || transfer.status === 'fo_flagged') {
    return 'buyer_dashboard';
  }
  if (transfer.status === 'buyer_pending') return 'buyer_dashboard';
  if (transfer.status === 'signing' && signingTurn(transfer, 'buyer')) return 'signing';
  if (transfer.status === 'escrow_pending') return 'escrow';
  if (transfer.status === 'complete') return 'complete';
  return 'buyer_dashboard';
}

function resolveCompanyStep(
  person: AppState['persons'][string] | undefined,
  transfer: Transfer | null
): TransferStep {
  if (!person?.identityVerified) return 'auth';
  if (!transfer || ['fo_pending', 'fo_flagged', 'buyer_pending'].includes(transfer.status)) {
    return 'company_rofr';
  }
  if (transfer.status === 'rofr_active') return 'company_rofr';
  if (transfer.status === 'signing' && signingTurn(transfer, 'company')) return 'signing';
  if (transfer.status === 'escrow_funded' || transfer.status === 'moci_pending') return 'moci_filing';
  if (['escrow_pending', 'signing'].includes(transfer.status)) return 'company_rofr';
  if (transfer.status === 'complete') return 'complete';
  return 'company_rofr';
}

function resolvePlatformStep(transfer: Transfer | null, foEnabled: boolean): TransferStep {
  if (
    foEnabled &&
    transfer &&
    (transfer.status === 'fo_pending' || transfer.status === 'fo_flagged')
  ) {
    return 'fairness_opinion';
  }
  return 'platform_admin';
}

/** First screen after Nafath — role-specific dashboard or prerequisite step */
export function getPostAuthDashboard(state: AppState): TransferStep {
  const person = state.persons[state.currentUserId];
  const company = state.companies[state.selectedCr];

  switch (state.currentRole) {
    case 'seller':
      if (!person?.identityVerified) return 'auth';
      if (!company?.wathqVerified) return 'company_kyb';
      return 'seller_dashboard';
    case 'buyer':
      return 'buyer_dashboard';
    case 'company_admin':
      return 'company_rofr';
    case 'platform_admin':
      return 'platform_admin';
    default:
      return resolveRoleStep(state);
  }
}

export function nextStepAfterTransferInit(foEnabled: boolean): TransferStep {
  return foEnabled ? 'seller_dashboard' : 'seller_dashboard';
}

export function nextStepAfterFOComplete(role: Role): TransferStep {
  if (role === 'platform_admin') return 'platform_admin';
  return 'seller_dashboard';
}
