import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import {
  DEMO_BUYER_ID,
  DEMO_CR_CLEAN,
  DEMO_SELLER_ID,
  seedCompanies,
  seedPersons,
} from '../data/seed';
import type {
  AppState,
  AuditEntry,
  DemoGuide,
  FairnessOpinion,
  KybDocumentType,
  Language,
  Role,
  Transfer,
  TransferStep,
} from '../types';
import {
  guideAfterBuyerConfirm,
  guideAfterEscrowFunded,
  guideAfterFoIssued,
  guideAfterSigning,
  guideAfterTransferComplete,
  guideAfterTransferInit,
  guideAfterWathqVerified,
} from '../utils/demoGuide';
import {
  generateCertificateId,
  generateFOReference,
  generateZatcaInvoice,
  getCompanyAgeNote,
  validatePrice,
} from '../utils/fairnessOpinion';
import { calculateFees } from '../utils/fees';
import { applyDemoBranch } from '../utils/demoBranchSetup';
import { resetWathqApiFailDemo } from '../services/wathqMock';
import { resolveRoleStep } from '../flows/roleFlows';
import { t as translate, type TranslationKey } from '../i18n/translations';

type Action =
  | { type: 'SET_LANGUAGE'; language: Language }
  | { type: 'SET_ROLE'; role: Role; userId?: string }
  | { type: 'SET_STEP'; step: TransferStep }
  | { type: 'ADD_AUDIT'; entry: Omit<AuditEntry, 'id' | 'timestamp'> }
  | { type: 'VERIFY_IDENTITY'; personId: string }
  | { type: 'VERIFY_WATHQ'; crNumber: string }
  | { type: 'VERIFY_KYB_FALLBACK'; crNumber: string; documentType: KybDocumentType; claimedShares: number }
  | { type: 'SET_KYB_CLAIMED_SHARES'; shares: number | null }
  | { type: 'SET_CR'; crNumber: string }
  | { type: 'RESOLVE_DISCREPANCY' }
  | { type: 'CREATE_TRANSFER'; transfer: Transfer }
  | { type: 'UPDATE_TRANSFER'; id: string; patch: Partial<Transfer> }
  | { type: 'SET_DEMO_BRANCH'; branch: AppState['demoBranch'] }
  | { type: 'APPLY_DEMO_BRANCH'; branch: AppState['demoBranch'] }
  | { type: 'SET_FO_ENABLED'; enabled: boolean }
  | { type: 'SYNC_ROLE_STEP' }
  | { type: 'SET_DEMO_GUIDE'; guide: AppState['demoGuide'] }
  | { type: 'WAIVE_ROFR'; crNumber: string; shareholderId: string }
  | { type: 'INIT_DEMO' };

const initialState: AppState = {
  language: 'ar',
  currentRole: 'seller',
  currentStep: 'auth',
  currentUserId: DEMO_SELLER_ID,
  persons: { ...seedPersons },
  companies: JSON.parse(JSON.stringify(seedCompanies)),
  activeTransferId: null,
  transfers: {},
  auditTrail: [],
  discrepancyResolved: false,
  kybClaimedShares: null,
  selectedCr: DEMO_CR_CLEAN,
  demoBranch: 'happy',
  demoMarketCondition: 'normal',
  foEnabled: false,
  demoGuide: null,
};

function addAudit(
  state: AppState,
  eventKey: string,
  event: string,
  actor: string,
  actorRole: Role,
  details?: string
): AuditEntry[] {
  const entry: AuditEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    event,
    eventKey,
    actor,
    actorRole,
    timestamp: new Date().toISOString(),
    details,
  };
  return [entry, ...state.auditTrail];
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_LANGUAGE':
      return { ...state, language: action.language };
    case 'SET_ROLE': {
      const roleUserMap: Record<Role, string> = {
        seller: DEMO_SELLER_ID,
        buyer: DEMO_BUYER_ID,
        company_admin: seedCompanies[DEMO_CR_CLEAN].adminId,
        platform_admin: 'platform',
        shareholder: 'sh-3',
      };
      const next: AppState = {
        ...state,
        currentRole: action.role,
        currentUserId: action.userId ?? roleUserMap[action.role],
        demoGuide:
          state.demoGuide?.switchToRole === action.role ? null : state.demoGuide,
      };
      return { ...next, currentStep: resolveRoleStep(next) };
    }
    case 'SET_STEP':
      return { ...state, currentStep: action.step };
    case 'ADD_AUDIT':
      return {
        ...state,
        auditTrail: addAudit(
          state,
          action.entry.eventKey,
          action.entry.event,
          action.entry.actor,
          action.entry.actorRole,
          action.entry.details
        ),
      };
    case 'VERIFY_IDENTITY': {
      const persons = { ...state.persons };
      if (persons[action.personId]) {
        persons[action.personId] = { ...persons[action.personId], identityVerified: true };
      }
      return { ...state, persons };
    }
    case 'VERIFY_WATHQ': {
      const companies = { ...state.companies };
      if (companies[action.crNumber]) {
        companies[action.crNumber] = {
          ...companies[action.crNumber],
          wathqVerified: true,
          kybVerificationMethod: 'wathq',
          lastVerifiedAt: new Date().toISOString(),
        };
      }
      return { ...state, companies, kybClaimedShares: null };
    }
    case 'VERIFY_KYB_FALLBACK': {
      const companies = { ...state.companies };
      const company = companies[action.crNumber];
      const seller = state.persons[state.currentUserId];
      if (!company || !seller) return state;

      const totalShares = company.totalShares;
      const percentage =
        totalShares > 0
          ? Math.round((action.claimedShares / totalShares) * 1000) / 10
          : 0;
      const sellerShareholder = {
        id: `sh-fallback-${action.crNumber}`,
        nameAr: seller.nameAr,
        nameEn: seller.nameEn,
        nationalId: seller.nationalId,
        shares: action.claimedShares,
        percentage,
      };
      const hasSeller = company.shareholders.some((sh) => sh.nationalId === seller.nationalId);

      companies[action.crNumber] = {
        ...company,
        wathqVerified: true,
        kybVerificationMethod: 'document_fallback',
        kybFallbackDocument: action.documentType,
        lastVerifiedAt: new Date().toISOString(),
        shareholders: hasSeller
          ? company.shareholders.map((sh) =>
              sh.nationalId === seller.nationalId
                ? { ...sh, shares: action.claimedShares, percentage }
                : sh
            )
          : [...company.shareholders, sellerShareholder],
      };

      return {
        ...state,
        companies,
        kybClaimedShares: action.claimedShares,
      };
    }
    case 'SET_KYB_CLAIMED_SHARES':
      return { ...state, kybClaimedShares: action.shares };
    case 'SET_CR':
      return { ...state, selectedCr: action.crNumber };
    case 'RESOLVE_DISCREPANCY':
      return { ...state, discrepancyResolved: true };
    case 'CREATE_TRANSFER':
      return {
        ...state,
        transfers: { ...state.transfers, [action.transfer.id]: action.transfer },
        activeTransferId: action.transfer.id,
      };
    case 'UPDATE_TRANSFER': {
      const existing = state.transfers[action.id];
      if (!existing) return state;
      return {
        ...state,
        transfers: {
          ...state.transfers,
          [action.id]: { ...existing, ...action.patch },
        },
      };
    }
    case 'SET_DEMO_BRANCH':
      return { ...state, demoBranch: action.branch };
    case 'APPLY_DEMO_BRANCH':
      return applyDemoBranch(state, action.branch);
    case 'SET_FO_ENABLED':
      return { ...state, foEnabled: action.enabled };
    case 'SYNC_ROLE_STEP':
      return { ...state, currentStep: resolveRoleStep(state) };
    case 'SET_DEMO_GUIDE':
      return { ...state, demoGuide: action.guide };
    case 'WAIVE_ROFR': {
      const companies = { ...state.companies };
      const company = companies[action.crNumber];
      if (!company) return state;
      companies[action.crNumber] = {
        ...company,
        shareholders: company.shareholders.map((sh) =>
          sh.id === action.shareholderId ? { ...sh, rofrStatus: 'waived' as const } : sh
        ),
      };
      return { ...state, companies };
    }
    case 'INIT_DEMO':
      return { ...initialState, language: state.language };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  setLanguage: (lang: Language) => void;
  setRole: (role: Role, userId?: string) => void;
  setStep: (step: TransferStep) => void;
  logAudit: (eventKey: string, event: string, details?: string) => void;
  verifyIdentity: (personId: string) => void;
  verifyWathq: (crNumber: string) => void;
  verifyKybFallback: (params: {
    crNumber: string;
    documentType: KybDocumentType;
    claimedShares: number;
  }) => void;
  setKybClaimedShares: (shares: number | null) => void;
  setCr: (crNumber: string) => void;
  resolveDiscrepancy: () => void;
  submitTransferInit: (params: {
    pricePerShare: number;
    shares: number;
    relatedParty: boolean;
    forceOutOfRange?: boolean;
  }) => void;
  syncRoleStep: () => void;
  updateTransfer: (id: string, patch: Partial<Transfer>) => void;
  issueFairnessOpinion: (justification?: string) => void;
  acceptBuyerOffer: () => void;
  startRoFR: () => void;
  waiveRoFR: (shareholderId: string) => void;
  exerciseRoFR: () => void;
  signDocument: (party: 'seller' | 'company' | 'buyer') => void;
  fundEscrow: () => void;
  completeMoci: () => void;
  triggerBranch: (branch: AppState['demoBranch']) => void;
  jumpToStep: (step: TransferStep) => void;
  simulateBuyerAcceptance: () => void;
  setDemoGuide: (guide: DemoGuide | null) => void;
  followDemoGuide: () => void;
  dismissDemoGuide: () => void;
  getActiveTransfer: () => Transfer | null;
  getPersonName: (id: string) => string;
  getCompany: (cr?: string) => (typeof seedCompanies)[string] | undefined;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const lang = state.language;

  const logAudit = useCallback(
    (eventKey: string, event: string, details?: string) => {
      const person = state.persons[state.currentUserId];
      const actor =
        state.currentRole === 'platform_admin'
          ? 'Platform System'
          : person
            ? lang === 'ar'
              ? person.nameAr
              : person.nameEn
            : state.currentUserId;
      dispatch({
        type: 'ADD_AUDIT',
        entry: { eventKey, event, actor, actorRole: state.currentRole, details },
      });
    },
    [state.currentUserId, state.currentRole, state.persons, lang]
  );

  const setLanguage = useCallback((language: Language) => {
    dispatch({ type: 'SET_LANGUAGE', language });
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, []);

  const setRole = useCallback((role: Role, userId?: string) => {
    dispatch({ type: 'SET_ROLE', role, userId });
  }, []);

  const setStep = useCallback((step: TransferStep) => {
    dispatch({ type: 'SET_STEP', step });
  }, []);

  const verifyIdentity = useCallback(
    (personId: string) => {
      dispatch({ type: 'VERIFY_IDENTITY', personId });
      logAudit('kyc.nafath', 'Nafath identity verification completed', personId);
    },
    [logAudit]
  );

  const verifyWathq = useCallback(
    (crNumber: string) => {
      dispatch({ type: 'VERIFY_WATHQ', crNumber });
      logAudit('kyb.wathq', 'Wathq company verification completed', crNumber);
      dispatch({ type: 'SET_DEMO_GUIDE', guide: guideAfterWathqVerified() });
    },
    [logAudit]
  );

  const verifyKybFallback = useCallback(
    (params: { crNumber: string; documentType: KybDocumentType; claimedShares: number }) => {
      dispatch({ type: 'VERIFY_KYB_FALLBACK', ...params });
      logAudit(
        'kyb.document_fallback',
        `Shareholding verified via uploaded ${params.documentType.replace(/_/g, ' ')}`,
        `${params.crNumber} · ${params.claimedShares.toLocaleString()} shares (seller declaration)`
      );
      dispatch({ type: 'SET_DEMO_GUIDE', guide: guideAfterWathqVerified() });
    },
    [logAudit]
  );

  const setKybClaimedShares = useCallback((shares: number | null) => {
    dispatch({ type: 'SET_KYB_CLAIMED_SHARES', shares });
  }, []);

  const setCr = useCallback((crNumber: string) => {
    dispatch({ type: 'SET_CR', crNumber });
  }, []);

  const resolveDiscrepancy = useCallback(() => {
    dispatch({ type: 'RESOLVE_DISCREPANCY' });
    logAudit('kyb.discrepancy', 'Shareholding discrepancy reconciled via board resolution');
  }, [logAudit]);

  const syncRoleStep = useCallback(() => {
    dispatch({ type: 'SYNC_ROLE_STEP' });
  }, []);

  const createTransfer = useCallback(
    (params: {
      pricePerShare: number;
      shares: number;
      relatedParty: boolean;
      forceOutOfRange?: boolean;
    }) => {
      const id = `txn-${Date.now()}`;
      const feeBreakdown = calculateFees(params.pricePerShare, params.shares);
      const transfer: Transfer = {
        id,
        sellerId: state.currentUserId,
        buyerId: DEMO_BUYER_ID,
        companyCr: state.selectedCr,
        shares: params.shares,
        pricePerShare: params.pricePerShare,
        marketCondition: state.demoMarketCondition,
        relatedParty: params.relatedParty,
        status: 'fo_pending',
        feeBreakdown,
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
        branch: params.forceOutOfRange ? 'price_out_of_range' : state.demoBranch,
      };
      dispatch({ type: 'CREATE_TRANSFER', transfer });
      logAudit(
        'transfer.initiated',
        'Transfer initiated by seller',
        `${params.shares} shares @ SAR ${params.pricePerShare}`
      );
      return id;
    },
    [state.companies, state.selectedCr, state.currentUserId, state.demoBranch, state.demoMarketCondition, logAudit]
  );

  const updateTransfer = useCallback((id: string, patch: Partial<Transfer>) => {
    dispatch({ type: 'UPDATE_TRANSFER', id, patch });
  }, []);

  const getActiveTransfer = useCallback((): Transfer | null => {
    if (!state.activeTransferId) return null;
    return state.transfers[state.activeTransferId] ?? null;
  }, [state.activeTransferId, state.transfers]);

  const issueFairnessOpinion = useCallback(
    (justification?: string, transferOverride?: Transfer) => {
      const transfer = transferOverride ?? getActiveTransfer();
      if (!transfer) return;
      const company = state.companies[transfer.companyCr];
      const validation = validatePrice(
        transfer.pricePerShare,
        company.referencePricePerShare,
        transfer.marketCondition
      );
      const fo: FairnessOpinion = {
        referenceNumber: generateFOReference(),
        referencePrice: company.referencePricePerShare,
        agreedPrice: transfer.pricePerShare,
        marketCondition: transfer.marketCondition,
        discountBand: validation.band,
        floor: validation.floor,
        ceiling: validation.ceiling,
        midpoint: validation.midpoint,
        discountToReference: validation.discountToReference,
        inRange: validation.inRange && !justification,
        gapPercent: validation.gapPercent,
        companyAgeNote: getCompanyAgeNote(company.foundedYear, lang),
        issuedAt: new Date().toISOString(),
        justification,
      };
      updateTransfer(transfer.id, {
        fairnessOpinion: fo,
        status: fo.inRange ? 'buyer_pending' : 'fo_flagged',
      });
      logAudit(
        fo.inRange ? 'fo.issued' : 'fo.flagged',
        fo.inRange ? 'Fairness Opinion issued' : 'Price flagged outside validation range',
        fo.referenceNumber
      );
      if (fo.inRange || justification) {
        dispatch({ type: 'SET_DEMO_GUIDE', guide: guideAfterFoIssued() });
      }
    },
    [getActiveTransfer, state.companies, lang, updateTransfer, logAudit]
  );

  const submitTransferInit = useCallback(
    (params: {
      pricePerShare: number;
      shares: number;
      relatedParty: boolean;
      forceOutOfRange?: boolean;
    }) => {
      const id = `txn-${Date.now()}`;
      const feeBreakdown = calculateFees(params.pricePerShare, params.shares);
      const transfer: Transfer = {
        id,
        sellerId: state.currentUserId,
        buyerId: DEMO_BUYER_ID,
        companyCr: state.selectedCr,
        shares: params.shares,
        pricePerShare: params.pricePerShare,
        marketCondition: state.demoMarketCondition,
        relatedParty: params.relatedParty,
        status: 'fo_pending',
        feeBreakdown,
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
        branch: params.forceOutOfRange ? 'price_out_of_range' : state.demoBranch,
      };
      dispatch({ type: 'CREATE_TRANSFER', transfer });
      logAudit(
        'transfer.initiated',
        'Transfer initiated by seller',
        `${params.shares} shares @ SAR ${params.pricePerShare}`
      );

      if (!state.foEnabled) {
        issueFairnessOpinion(undefined, transfer);
        logAudit('fo.silent', 'Price validation completed (FO step hidden)');
        dispatch({ type: 'SET_DEMO_GUIDE', guide: guideAfterTransferInit(false) });
      } else {
        logAudit('fo.queued', 'Transfer queued for Fairness Opinion — switch to Platform Admin');
        dispatch({ type: 'SET_DEMO_GUIDE', guide: guideAfterTransferInit(true) });
      }
      dispatch({ type: 'SET_STEP', step: 'seller_dashboard' });
    },
    [
      state.currentUserId,
      state.selectedCr,
      state.demoMarketCondition,
      state.demoBranch,
      state.foEnabled,
      issueFairnessOpinion,
      logAudit,
    ]
  );

  const acceptBuyerOffer = useCallback(() => {
    const transfer = getActiveTransfer();
    if (!transfer) return;
    updateTransfer(transfer.id, { status: 'rofr_active' });
    logAudit('buyer.accepted', 'Buyer confirmed agreed price and accepted offer');
    dispatch({ type: 'SET_DEMO_GUIDE', guide: guideAfterBuyerConfirm() });
  }, [getActiveTransfer, updateTransfer, logAudit]);

  const startRoFR = useCallback(() => {
    const transfer = getActiveTransfer();
    if (!transfer) return;
    updateTransfer(transfer.id, {
      rofrLocked: true,
      rofrStartDate: new Date().toISOString(),
      rofrDay: 1,
      status: 'rofr_active',
    });
    logAudit('rofr.started', 'ROFR process started — price locked for 30 days');
  }, [getActiveTransfer, updateTransfer, logAudit]);

  const waiveRoFR = useCallback(
    (shareholderId: string) => {
      const transfer = getActiveTransfer();
      if (!transfer) return;
      dispatch({
        type: 'WAIVE_ROFR',
        crNumber: transfer.companyCr,
        shareholderId,
      });
      logAudit('rofr.waived', 'Shareholder waived ROFR', shareholderId);
    },
    [getActiveTransfer, logAudit]
  );

  const exerciseRoFR = useCallback(() => {
    const transfer = getActiveTransfer();
    if (!transfer) return;
    updateTransfer(transfer.id, {
      status: 'rofr_exercised',
      branch: 'rofr_exercised',
      escrowStatus: 'refunded',
    });
    logAudit('rofr.exercised', 'ROFR exercised — original buyer to receive refund');
  }, [getActiveTransfer, updateTransfer, logAudit]);

  const signDocument = useCallback(
    (party: 'seller' | 'company' | 'buyer') => {
      const transfer = getActiveTransfer();
      if (!transfer) return;
      const signatures = transfer.signatures.map((s) =>
        s.party === party
          ? { ...s, status: 'signed' as const, signedAt: new Date().toISOString() }
          : s
      );
      const allSigned = signatures.every((s) => s.status === 'signed');
      const updatedTransfer: Transfer = {
        ...transfer,
        signatures,
        status: allSigned ? 'escrow_pending' : 'signing',
      };
      updateTransfer(transfer.id, {
        signatures,
        status: updatedTransfer.status,
      });
      logAudit('esign.signed', `${party} signed Transfer Deed via Nafath`);
      dispatch({ type: 'SET_DEMO_GUIDE', guide: guideAfterSigning(updatedTransfer) });
    },
    [getActiveTransfer, updateTransfer, logAudit]
  );

  const fundEscrow = useCallback(() => {
    const transfer = getActiveTransfer();
    if (!transfer || !transfer.feeBreakdown) return;
    updateTransfer(transfer.id, {
      escrowStatus: 'funded',
      escrowAmount: transfer.feeBreakdown.dealValue,
      status: 'escrow_funded',
    });
    logAudit('escrow.funded', 'Buyer funded Dhamen escrow', `SAR ${transfer.feeBreakdown.dealValue}`);
    dispatch({ type: 'SET_DEMO_GUIDE', guide: guideAfterEscrowFunded() });
  }, [getActiveTransfer, updateTransfer, logAudit]);

  const completeMoci = useCallback(() => {
    const transfer = getActiveTransfer();
    if (!transfer || !transfer.feeBreakdown) return;
    updateTransfer(transfer.id, {
      mociFiled: true,
      mociConfirmed: true,
      escrowStatus: 'released',
      status: 'complete',
      zatcaInvoiceNumber: generateZatcaInvoice(),
      completionCertificateId: generateCertificateId(),
    });
    logAudit('moci.confirmed', 'MoCI filing confirmed — Wathq cap-table match');
    logAudit(
      'escrow.released',
      'Dhamen escrow released to seller (minus platform fee + VAT)',
      `Fee: SAR ${transfer.feeBreakdown.totalInvoicedToSeller}`
    );
    dispatch({ type: 'SET_DEMO_GUIDE', guide: guideAfterTransferComplete() });
  }, [getActiveTransfer, updateTransfer, logAudit]);

  const triggerBranch = useCallback(
    (branch: AppState['demoBranch']) => {
      resetWathqApiFailDemo();
      dispatch({ type: 'APPLY_DEMO_BRANCH', branch });
      logAudit('demo.branch', `Demo branch applied: ${branch}`);
    },
    [logAudit]
  );

  const jumpToStep = useCallback(
    (step: TransferStep) => {
      dispatch({ type: 'SET_STEP', step });
    },
    []
  );

  const setDemoGuide = useCallback((guide: DemoGuide | null) => {
    dispatch({ type: 'SET_DEMO_GUIDE', guide });
  }, []);

  const dismissDemoGuide = useCallback(() => {
    dispatch({ type: 'SET_DEMO_GUIDE', guide: null });
  }, []);

  const followDemoGuide = useCallback(() => {
    if (!state.demoGuide) return;
    const { switchToRole, targetStep } = state.demoGuide;
    dispatch({ type: 'SET_DEMO_GUIDE', guide: null });
    dispatch({ type: 'SET_ROLE', role: switchToRole });
    if (targetStep) {
      dispatch({ type: 'SET_STEP', step: targetStep });
    }
  }, [state.demoGuide]);

  const simulateBuyerAcceptance = useCallback(() => {
    const transfer = getActiveTransfer();
    if (!transfer || !['buyer_pending', 'fo_flagged'].includes(transfer.status)) return;
    const buyer = state.persons[transfer.buyerId];
    const buyerName = lang === 'ar' ? buyer?.nameAr : buyer?.nameEn;
    acceptBuyerOffer();
    logAudit('demo.buyer_accepted', 'Buyer accepted transfer offer (simulated)', buyerName);
  }, [getActiveTransfer, state.persons, lang, acceptBuyerOffer, logAudit]);

  const getPersonName = useCallback(
    (id: string) => {
      const p = state.persons[id];
      if (!p) return id;
      return lang === 'ar' ? p.nameAr : p.nameEn;
    },
    [state.persons, lang]
  );

  const getCompany = useCallback(
    (cr?: string) => state.companies[cr ?? state.selectedCr],
    [state.companies, state.selectedCr]
  );

  const value = useMemo(
    () => ({
      state,
      setLanguage,
      setRole,
      setStep,
      logAudit,
      verifyIdentity,
      verifyWathq,
      verifyKybFallback,
      setKybClaimedShares,
      setCr,
      resolveDiscrepancy,
      createTransfer,
      submitTransferInit,
      updateTransfer,
      issueFairnessOpinion,
      acceptBuyerOffer,
      startRoFR,
      waiveRoFR,
      exerciseRoFR,
      signDocument,
      fundEscrow,
      completeMoci,
      triggerBranch,
      syncRoleStep,
      jumpToStep,
      simulateBuyerAcceptance,
      setDemoGuide,
      followDemoGuide,
      dismissDemoGuide,
      getActiveTransfer,
      getPersonName,
      getCompany,
    }),
    [
      state,
      setLanguage,
      setRole,
      setStep,
      logAudit,
      verifyIdentity,
      verifyWathq,
      verifyKybFallback,
      setKybClaimedShares,
      setCr,
      resolveDiscrepancy,
      createTransfer,
      submitTransferInit,
      updateTransfer,
      issueFairnessOpinion,
      acceptBuyerOffer,
      startRoFR,
      waiveRoFR,
      exerciseRoFR,
      signDocument,
      fundEscrow,
      completeMoci,
      triggerBranch,
      syncRoleStep,
      jumpToStep,
      simulateBuyerAcceptance,
      setDemoGuide,
      followDemoGuide,
      dismissDemoGuide,
      getActiveTransfer,
      getPersonName,
      getCompany,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function useT() {
  const { state } = useApp();
  return useCallback(
    (key: TranslationKey) => translate(key, state.language),
    [state.language]
  );
}
