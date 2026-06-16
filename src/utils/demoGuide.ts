import type { DemoGuide, Role, Transfer, TransferStep } from '../types';
import type { TranslationKey } from '../i18n/translations';

const SIGN_ORDER: Array<'seller' | 'company' | 'buyer'> = ['seller', 'company', 'buyer'];

function nextUnsignedParty(transfer: Transfer): 'seller' | 'company' | 'buyer' | null {
  return (
    SIGN_ORDER.find((p) => transfer.signatures.find((s) => s.party === p)?.status !== 'signed') ??
    null
  );
}

const PARTY_ROLE: Record<'seller' | 'company' | 'buyer', Role> = {
  seller: 'seller',
  company: 'company_admin',
  buyer: 'buyer',
};

const PARTY_SIGN_KEY: Record<'seller' | 'company' | 'buyer', TranslationKey> = {
  seller: 'demo.guide.sign_seller',
  company: 'demo.guide.sign_company',
  buyer: 'demo.guide.sign_buyer',
};

export function guideAfterTransferInit(foEnabled: boolean): DemoGuide {
  if (foEnabled) {
    return {
      switchToRole: 'platform_admin',
      messageKey: 'demo.guide.fo_pending',
      targetStep: 'fairness_opinion',
    };
  }
  return {
    switchToRole: 'buyer',
    messageKey: 'demo.guide.transfer_initiated',
    targetStep: 'buyer_offers',
    stepKey: 'nav.offers',
  };
}

export function guideAfterFoIssued(): DemoGuide {
  return {
    switchToRole: 'buyer',
    messageKey: 'demo.guide.transfer_initiated',
    targetStep: 'buyer_offers',
    stepKey: 'nav.offers',
  };
}

export function guideAfterBuyerConfirm(): DemoGuide {
  return {
    switchToRole: 'company_admin',
    messageKey: 'demo.guide.buyer_confirmed',
    targetStep: 'company_rofr',
  };
}

export function guideAfterRofrComplete(): DemoGuide {
  return {
    switchToRole: 'seller',
    messageKey: 'demo.guide.rofr_complete',
    targetStep: 'signing',
  };
}

export function guideAfterSigning(transfer: Transfer): DemoGuide {
  const next = nextUnsignedParty(transfer);
  if (!next) {
    return {
      switchToRole: 'buyer',
      messageKey: 'demo.guide.signing_complete',
      targetStep: 'escrow',
    };
  }
  return {
    switchToRole: PARTY_ROLE[next],
    messageKey: PARTY_SIGN_KEY[next],
    targetStep: 'signing',
  };
}

export function guideAfterEscrowFunded(): DemoGuide {
  return {
    switchToRole: 'company_admin',
    messageKey: 'demo.guide.escrow_funded',
    targetStep: 'moci_filing',
  };
}

export function guideAfterTransferComplete(): DemoGuide {
  return {
    switchToRole: 'buyer',
    messageKey: 'demo.guide.transfer_complete',
    targetStep: 'complete',
  };
}

export function guideAfterWathqVerified(): DemoGuide {
  return {
    switchToRole: 'seller',
    messageKey: 'demo.guide.seller_kyb_done',
    targetStep: 'transfer_init',
    stepKey: 'step.transfer_init',
  };
}

export function defaultStepForRole(role: Role): TransferStep {
  switch (role) {
    case 'seller':
      return 'seller_dashboard';
    case 'buyer':
      return 'buyer_dashboard';
    case 'company_admin':
      return 'company_rofr';
    case 'platform_admin':
      return 'platform_admin';
    default:
      return 'auth';
  }
}
