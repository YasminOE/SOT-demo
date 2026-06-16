import type { TranslationKey } from '../i18n/translations';

export type Language = 'ar' | 'en';
export type Role = 'seller' | 'buyer' | 'company_admin' | 'platform_admin' | 'shareholder';
export type MarketCondition = 'normal' | 'stress' | 'hot';
export type TransferStep =
  | 'auth'
  | 'company_kyb'
  | 'discrepancy'
  | 'transfer_init'
  | 'fairness_opinion'
  | 'buyer_confirm'
  | 'company_rofr'
  | 'signing'
  | 'escrow'
  | 'moci_filing'
  | 'complete'
  | 'seller_dashboard'
  | 'seller_transfers'
  | 'buyer_dashboard'
  | 'buyer_offers'
  | 'platform_admin';

export type TransferStatus =
  | 'draft'
  | 'fo_pending'
  | 'fo_flagged'
  | 'buyer_pending'
  | 'rofr_active'
  | 'rofr_exercised'
  | 'signing'
  | 'escrow_pending'
  | 'escrow_funded'
  | 'moci_pending'
  | 'complete'
  | 'cancelled'
  | 'refunded';

export type EscrowStatus = 'pending' | 'funded' | 'released' | 'refunded';
export type RoFRStatus = 'pending' | 'waived' | 'exercised';
export type SigningStatus = 'pending' | 'signed';

export interface Person {
  id: string;
  nameAr: string;
  nameEn: string;
  nationalId: string;
  mobile: string;
  dob: string;
  identityVerified: boolean;
}

export interface Shareholder {
  id: string;
  nameAr: string;
  nameEn: string;
  nationalId: string;
  shares: number;
  percentage: number;
  rofrStatus?: RoFRStatus;
}

export interface Company {
  crNumber: string;
  crNationalNumber: string;
  nameAr: string;
  nameEn: string;
  type: 'SJSC' | 'CJSC';
  entityType: import('./wathq').WathqEntityType;
  status: import('./wathq').WathqStatus;
  foundedYear: number;
  referencePricePerShare: number;
  lastVerifiedAt?: string;
  wathqVerified: boolean;
  wathq: import('./wathq').WathqCommercialRegistration;
  shareholders: Shareholder[];
  adminId: string;
  totalShares: number;
  paidCapital: number;
  headquarterCity: import('./wathq').WathqLocalized;
  activities: Array<{ id: string; name: import('./wathq').WathqLocalized }>;
  managers: import('./wathq').WathqManager[];
}

export interface FairnessOpinion {
  referenceNumber: string;
  referencePrice: number;
  agreedPrice: number;
  marketCondition: MarketCondition;
  discountBand: { min: number; max: number };
  floor: number;
  ceiling: number;
  midpoint: number;
  discountToReference: number;
  inRange: boolean;
  gapPercent?: number;
  companyAgeNote: string;
  issuedAt: string;
  justification?: string;
}

export interface FeeBreakdown {
  dealValue: number;
  platformFee: number;
  vatOnFee: number;
  totalInvoicedToSeller: number;
  buyerPlatformFee: number;
  feeCapped: boolean;
  feeFloored: boolean;
}

export interface SignatureRecord {
  party: 'seller' | 'company' | 'buyer';
  signedAt?: string;
  status: SigningStatus;
}

export interface AuditEntry {
  id: string;
  event: string;
  eventKey: string;
  actor: string;
  actorRole: Role;
  timestamp: string;
  details?: string;
}

export interface Transfer {
  id: string;
  sellerId: string;
  buyerId: string;
  companyCr: string;
  shares: number;
  pricePerShare: number;
  marketCondition: MarketCondition;
  relatedParty: boolean;
  status: TransferStatus;
  fairnessOpinion?: FairnessOpinion;
  feeBreakdown?: FeeBreakdown;
  rofrStartDate?: string;
  rofrDay: number;
  rofrLocked: boolean;
  signatures: SignatureRecord[];
  escrowStatus: EscrowStatus;
  escrowAmount?: number;
  mociFiled: boolean;
  mociConfirmed: boolean;
  zatcaInvoiceNumber?: string;
  completionCertificateId?: string;
  branch?: 'happy' | 'discrepancy' | 'price_out_of_range' | 'rofr_exercised' | 'declined_sign';
}

export interface DemoGuide {
  switchToRole: Role;
  messageKey: TranslationKey;
  targetStep?: TransferStep;
  stepKey?: TranslationKey;
}

export interface AppState {
  language: Language;
  currentRole: Role;
  currentStep: TransferStep;
  currentUserId: string;
  persons: Record<string, Person>;
  companies: Record<string, Company>;
  activeTransferId: string | null;
  transfers: Record<string, Transfer>;
  auditTrail: AuditEntry[];
  discrepancyResolved: boolean;
  selectedCr: string;
  demoBranch: 'happy' | 'discrepancy' | 'price_out_of_range' | 'rofr_exercised' | 'declined_sign';
  /** Presenter-only: drives Jada band on FO — never seller-selected */
  demoMarketCondition: MarketCondition;
  /** When false, FO step is hidden and validation runs silently */
  foEnabled: boolean;
  /** Demo-only: prompts presenter to switch role for the next step */
  demoGuide: DemoGuide | null;
}

export interface DemoDirectorActions {
  switchRole: (role: Role) => void;
  triggerBranch: (branch: AppState['demoBranch']) => void;
  jumpToStep: (step: TransferStep) => void;
}
