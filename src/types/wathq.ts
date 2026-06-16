/** Shapes aligned with Wathq Commercial Registration (New Legislation) — API #31 */

export interface WathqLocalized {
  ar: string;
  en: string | null;
}

export interface WathqDatePair {
  gregorian: string;
  hijri: string;
}

export interface WathqEntityType {
  id: number;
  name: WathqLocalized;
  formId: number;
  formName: WathqLocalized;
}

export interface WathqStatus {
  id: number;
  name: WathqLocalized;
  confirmationDate: WathqDatePair;
  reactivationDate?: WathqDatePair | null;
  suspensionDate?: WathqDatePair | null;
  deletionDate?: WathqDatePair | null;
}

export interface WathqIdentity {
  id: string;
  typeId: number;
  typeName: WathqLocalized;
}

export interface WathqParty {
  name: WathqLocalized;
  typeId: number;
  typeName: WathqLocalized;
  identity: WathqIdentity;
  partnership: Array<{ id: number; name: WathqLocalized }>;
  partnerShare?: {
    cashContributionCount: number;
    inKindContributionCount: number;
    totalContributionCount: number;
  };
  nationality?: WathqLocalized;
  crNumber?: string | null;
}

export interface WathqManager {
  name: WathqLocalized;
  typeId: number;
  typeName: WathqLocalized;
  isLicensed: boolean;
  identity: WathqIdentity;
  nationality: WathqLocalized;
  positions: Array<{ id: number; name: WathqLocalized }>;
}

export interface WathqStockCapital {
  typeId: number;
  typeName: WathqLocalized;
  capital: number;
  announcedCapital: number;
  paidCapital: number;
  stocks: Array<{
    count: number;
    value: number;
    typeId: number;
    typeName: WathqLocalized;
    classReferenceId: number;
    className: WathqLocalized;
  }>;
}

export interface WathqCommercialRegistration {
  crNationalNumber: string;
  crNumber: string;
  versionNo: number;
  name: WathqLocalized;
  crCapital: number;
  isMain: boolean;
  issueDateGregorian: string;
  issueDateHijri: string;
  inLiquidationProcess: boolean;
  hasEcommerce: boolean;
  headquarterCityName: WathqLocalized;
  isLicenseBased: boolean;
  entityType: WathqEntityType;
  status: WathqStatus;
  contactInfo?: {
    phoneNo: string;
    mobileNo: string;
    email: string;
    websiteUrl?: string;
  };
  capital: {
    currencyName: WathqLocalized;
    stockCapital: WathqStockCapital;
  };
  parties: WathqParty[];
  management: {
    structureId: number;
    structureName: WathqLocalized;
    managers: WathqManager[];
  };
  activities: Array<{ id: string; name: WathqLocalized }>;
}

export type WathqLookupResult =
  | { ok: true; data: WathqCommercialRegistration }
  | { ok: false; error: 'NOT_FOUND' | 'INACTIVE' | 'NOT_ELIGIBLE' | 'IN_LIQUIDATION' };
