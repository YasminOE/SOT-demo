import {
  DEMO_BUYER_ID,
  DEMO_CR_CLEAN,
  DEMO_CR_DISCREPANCY,
  DEMO_DEAL,
  DEMO_SELLER_DISCREPANCY_ID,
  DEMO_SELLER_ID,
  seedCompanies,
} from '../data/seed';
import type { AppState, FairnessOpinion, Transfer } from '../types';
import {
  generateFOReference,
  getCompanyAgeNote,
  validatePrice,
} from './fairnessOpinion';
import { calculateFees } from './fees';

function cloneCompanies() {
  return JSON.parse(JSON.stringify(seedCompanies)) as AppState['companies'];
}

function verifyAllPersons(persons: AppState['persons']): AppState['persons'] {
  return Object.fromEntries(
    Object.entries(persons).map(([id, person]) => [id, { ...person, identityVerified: true }])
  );
}

function markWathqVerified(companies: AppState['companies'], cr: string) {
  if (companies[cr]) {
    companies[cr] = {
      ...companies[cr],
      wathqVerified: true,
      kybVerificationMethod: 'wathq',
      lastVerifiedAt: new Date().toISOString(),
    };
  }
}

function buildTransfer(id: string, patch: Partial<Transfer> & Pick<Transfer, 'status'>): Transfer {
  const price = patch.pricePerShare ?? DEMO_DEAL.inRangePrice;
  const shares = patch.shares ?? DEMO_DEAL.shares;
  const { status, ...rest } = patch;
  return {
    id,
    sellerId: DEMO_SELLER_ID,
    buyerId: DEMO_BUYER_ID,
    companyCr: DEMO_CR_CLEAN,
    shares,
    pricePerShare: price,
    marketCondition: 'normal',
    relatedParty: false,
    status,
    feeBreakdown: calculateFees(price, shares),
    rofrDay: 0,
    rofrLocked: false,
    signatures: [
      { party: 'seller', status: 'pending' },
      { party: 'company', status: 'pending' },
      { party: 'buyer', status: 'pending' },
    ],
    escrowStatus: 'pending',
    mociFiled: false,
    mociConfirmed: false,
    branch: 'happy',
    ...rest,
  };
}

function buildInRangeFo(companyCr: string, lang: AppState['language']): FairnessOpinion {
  const company = seedCompanies[companyCr];
  const price = DEMO_DEAL.inRangePrice;
  const validation = validatePrice(price, company.referencePricePerShare, 'normal');
  return {
    referenceNumber: generateFOReference(),
    referencePrice: company.referencePricePerShare,
    agreedPrice: price,
    marketCondition: 'normal',
    discountBand: validation.band,
    floor: validation.floor,
    ceiling: validation.ceiling,
    midpoint: validation.midpoint,
    discountToReference: validation.discountToReference,
    inRange: true,
    companyAgeNote: getCompanyAgeNote(company.foundedYear, lang),
    issuedAt: new Date().toISOString(),
  };
}

function buildFlaggedFo(companyCr: string, lang: AppState['language']): FairnessOpinion {
  const company = seedCompanies[companyCr];
  const price = DEMO_DEAL.outOfRangePrice;
  const validation = validatePrice(price, company.referencePricePerShare, 'normal');
  return {
    referenceNumber: generateFOReference(),
    referencePrice: company.referencePricePerShare,
    agreedPrice: price,
    marketCondition: 'normal',
    discountBand: validation.band,
    floor: validation.floor,
    ceiling: validation.ceiling,
    midpoint: validation.midpoint,
    discountToReference: validation.discountToReference,
    inRange: false,
    gapPercent: validation.gapPercent,
    companyAgeNote: getCompanyAgeNote(company.foundedYear, lang),
    issuedAt: new Date().toISOString(),
  };
}

export function applyDemoBranch(
  state: AppState,
  branch: AppState['demoBranch']
): AppState {
  const companies = cloneCompanies();
  const persons = verifyAllPersons(state.persons);
  const lang = state.language;
  const transferId = `txn-demo-${branch}`;

  const base: AppState = {
    ...state,
    demoBranch: branch,
    demoGuide: null,
    persons,
    companies,
    transfers: {},
    activeTransferId: null,
    discrepancyResolved: false,
    kybClaimedShares: null,
  };

  switch (branch) {
    case 'happy':
      markWathqVerified(companies, DEMO_CR_CLEAN);
      return {
        ...base,
        selectedCr: DEMO_CR_CLEAN,
        currentRole: 'seller',
        currentUserId: DEMO_SELLER_ID,
        currentStep: 'seller_dashboard',
      };

    case 'discrepancy':
      markWathqVerified(companies, DEMO_CR_DISCREPANCY);
      return {
        ...base,
        selectedCr: DEMO_CR_DISCREPANCY,
        currentRole: 'seller',
        currentUserId: DEMO_SELLER_DISCREPANCY_ID,
        currentStep: 'discrepancy',
        kybClaimedShares: 250_000,
      };

    case 'price_out_of_range': {
      markWathqVerified(companies, DEMO_CR_CLEAN);
      const price = DEMO_DEAL.outOfRangePrice;
      const shares = DEMO_DEAL.shares;
      const fo = buildFlaggedFo(DEMO_CR_CLEAN, lang);
      const transfer = buildTransfer(transferId, {
        status: 'fo_flagged',
        pricePerShare: price,
        shares,
        fairnessOpinion: fo,
        branch: 'price_out_of_range',
        feeBreakdown: calculateFees(price, shares),
      });
      return {
        ...base,
        selectedCr: DEMO_CR_CLEAN,
        currentRole: state.foEnabled ? 'platform_admin' : 'buyer',
        currentUserId: state.foEnabled ? DEMO_SELLER_ID : DEMO_BUYER_ID,
        currentStep: state.foEnabled ? 'fairness_opinion' : 'buyer_offers',
        transfers: { [transferId]: transfer },
        activeTransferId: transferId,
      };
    }

    case 'rofr_exercised': {
      markWathqVerified(companies, DEMO_CR_CLEAN);
      const fo = buildInRangeFo(DEMO_CR_CLEAN, lang);
      const transfer = buildTransfer(transferId, {
        status: 'rofr_active',
        fairnessOpinion: fo,
        rofrLocked: true,
        rofrStartDate: new Date().toISOString(),
        rofrDay: 15,
        branch: 'rofr_exercised',
      });
      return {
        ...base,
        selectedCr: DEMO_CR_CLEAN,
        currentRole: 'company_admin',
        currentUserId: companies[DEMO_CR_CLEAN].adminId,
        currentStep: 'company_rofr',
        transfers: { [transferId]: transfer },
        activeTransferId: transferId,
      };
    }

    case 'declined_sign': {
      markWathqVerified(companies, DEMO_CR_CLEAN);
      const fo = buildInRangeFo(DEMO_CR_CLEAN, lang);
      const transfer = buildTransfer(transferId, {
        status: 'signing',
        fairnessOpinion: fo,
        rofrLocked: true,
        rofrDay: 30,
        branch: 'declined_sign',
      });
      return {
        ...base,
        selectedCr: DEMO_CR_CLEAN,
        currentRole: 'seller',
        currentUserId: DEMO_SELLER_ID,
        currentStep: 'signing',
        transfers: { [transferId]: transfer },
        activeTransferId: transferId,
      };
    }

    default:
      return base;
  }
}
