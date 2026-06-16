import type { Company, Shareholder } from '../types';
import type { WathqCommercialRegistration, WathqLookupResult } from '../types/wathq';
import { WATHQ_REGISTRY, WATHQ_DEMO_CR_API_FAIL } from '../data/wathqResponses';
import { DEMO_COMPANY_ADMIN_ID } from '../data/seed';

/** SJSC + CJSC form IDs under MoCI new legislation */
const ELIGIBLE_FORM_IDS = new Set([2041, 2042]);

const apiFailAttempts = new Map<string, number>();

export function isEligiblePrivateCompany(data: WathqCommercialRegistration): boolean {
  return ELIGIBLE_FORM_IDS.has(data.entityType.formId);
}

export function isCrActive(data: WathqCommercialRegistration): boolean {
  return (
    data.status.id === 1 &&
    !data.inLiquidationProcess &&
    !data.status.suspensionDate &&
    !data.status.deletionDate
  );
}

export function sellerInWathqParties(
  data: WathqCommercialRegistration,
  nationalId: string
): boolean {
  return data.parties.some((p) => p.identity.id === nationalId);
}

export function getSellerWathqShares(
  data: WathqCommercialRegistration,
  nationalId: string
): number {
  return (
    data.parties.find((p) => p.identity.id === nationalId)?.partnerShare
      ?.totalContributionCount ?? 0
  );
}

export function mapWathqToCompany(
  data: WathqCommercialRegistration,
  referencePricePerShare: number,
  foundedYear: number
): Company {
  const totalShares = data.capital.stockCapital.stocks.reduce((s, st) => s + st.count, 0);

  const shareholders: Shareholder[] = data.parties.map((party, idx) => {
    const shares = party.partnerShare?.totalContributionCount ?? 0;
    return {
      id: `sh-${data.crNumber}-${idx}`,
      nameAr: party.name.ar,
      nameEn: party.name.en ?? party.name.ar,
      nationalId: party.identity.id,
      shares,
      percentage: totalShares > 0 ? Math.round((shares / totalShares) * 1000) / 10 : 0,
    };
  });

  const platformType = data.entityType.formId === 2041 ? 'SJSC' : 'CJSC';

  return {
    crNumber: data.crNumber,
    crNationalNumber: data.crNationalNumber,
    nameAr: data.name.ar,
    nameEn: data.name.en ?? data.name.ar,
    type: platformType,
    entityType: data.entityType,
    status: data.status,
    foundedYear,
    referencePricePerShare,
    wathqVerified: false,
    wathq: data,
    shareholders,
    adminId: DEMO_COMPANY_ADMIN_ID,
    totalShares,
    paidCapital: data.capital.stockCapital.paidCapital,
    headquarterCity: data.headquarterCityName,
    activities: data.activities,
    managers: data.management.managers,
  };
}

export async function lookupCommercialRegistration(
  crNumber: string
): Promise<WathqLookupResult> {
  await new Promise((r) => setTimeout(r, 1200 + Math.random() * 1500));

  if (crNumber === WATHQ_DEMO_CR_API_FAIL) {
    const attempts = apiFailAttempts.get(crNumber) ?? 0;
    if (attempts < 1) {
      apiFailAttempts.set(crNumber, attempts + 1);
      return { ok: false, error: 'API_UNAVAILABLE' };
    }
  }

  const data = WATHQ_REGISTRY[crNumber];
  if (!data) return { ok: false, error: 'NOT_FOUND' };
  if (data.inLiquidationProcess) return { ok: false, error: 'IN_LIQUIDATION' };
  if (!isCrActive(data)) return { ok: false, error: 'INACTIVE' };
  if (!isEligiblePrivateCompany(data)) return { ok: false, error: 'NOT_ELIGIBLE' };

  return { ok: true, data };
}

export function resetWathqApiFailDemo(crNumber: string = WATHQ_DEMO_CR_API_FAIL): void {
  apiFailAttempts.delete(crNumber);
}

export function localized(
  value: { ar: string; en: string | null },
  lang: 'ar' | 'en'
): string {
  if (lang === 'ar') return value.ar;
  return value.en ?? value.ar;
}
