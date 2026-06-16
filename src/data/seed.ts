import type { Company, Person, Shareholder } from '../types';
import { mapWathqToCompany } from '../services/wathqMock';
import {
  WATHQ_DEMO_CR_CLEAN,
  WATHQ_DEMO_CR_DISCREPANCY,
  WATHQ_DEMO_CR_NOT_IN_REGISTRY,
  wathqDigitalSolutions,
  wathqFutureTech,
  wathqNebulaVentures,
} from './wathqResponses';

export const DEMO_SELLER_ID = 'seller-1';
export const DEMO_SELLER_DISCREPANCY_ID = 'seller-2';
export const DEMO_BUYER_ID = 'buyer-1';
export const DEMO_ROFR_SHAREHOLDER_ID = 'sh-3';
export const DEMO_COMPANY_ADMIN_ID = 'admin-1';
export const DEMO_CR_CLEAN = WATHQ_DEMO_CR_CLEAN;
export const DEMO_CR_DISCREPANCY = WATHQ_DEMO_CR_DISCREPANCY;
export const DEMO_CR_NOT_IN_REGISTRY = WATHQ_DEMO_CR_NOT_IN_REGISTRY;
export const DEMO_CR_API_FAIL = '1010222222';
export const DEMO_CR_INELIGIBLE = '1010111111';

export const seedPersons: Record<string, Person> = {
  [DEMO_SELLER_ID]: {
    id: DEMO_SELLER_ID,
    nameAr: 'فهد العتيبي',
    nameEn: 'Fahad Al-Otaibi',
    nationalId: '1087654321',
    mobile: '0501234567',
    dob: '1985-03-15',
    identityVerified: false,
  },
  [DEMO_SELLER_DISCREPANCY_ID]: {
    id: DEMO_SELLER_DISCREPANCY_ID,
    nameAr: 'سلمان الدوسري',
    nameEn: 'Salman Al-Dossari',
    nationalId: '1098765432',
    mobile: '0509876543',
    dob: '1982-07-22',
    identityVerified: false,
  },
  [DEMO_BUYER_ID]: {
    id: DEMO_BUYER_ID,
    nameAr: 'نورة القحطاني',
    nameEn: 'Noura Al-Qahtani',
    nationalId: '1102345678',
    mobile: '0551122334',
    dob: '1990-11-08',
    identityVerified: false,
  },
  [DEMO_COMPANY_ADMIN_ID]: {
    id: DEMO_COMPANY_ADMIN_ID,
    nameAr: 'عبدالله الشمري',
    nameEn: 'Abdullah Al-Shammari',
    nationalId: '1076543210',
    mobile: '0505556677',
    dob: '1978-01-30',
    identityVerified: false,
  },
};

/** Stable demo shareholder IDs for ROFR / waiver flows */
const futureTechShareholderIds = ['sh-1', 'sh-2', 'sh-3', 'sh-4', 'sh-5'];
const digitalShareholderIds = ['sh-d1', 'sh-d2', 'sh-d3'];

function attachShareholderIds(company: Company, ids: string[]): Company {
  return {
    ...company,
    shareholders: company.shareholders.map((sh, i) => ({
      ...sh,
      id: ids[i] ?? sh.id,
    })),
  };
}

const nebulaShareholderIds = ['sh-n1', 'sh-n2', 'sh-n3', 'sh-n4'];

export const seedCompanies: Record<string, Company> = {
  [DEMO_CR_CLEAN]: attachShareholderIds(
    mapWathqToCompany(wathqFutureTech, 100, 2019),
    futureTechShareholderIds
  ),
  [DEMO_CR_DISCREPANCY]: attachShareholderIds(
    mapWathqToCompany(wathqDigitalSolutions, 85, 2021),
    digitalShareholderIds
  ),
  [DEMO_CR_NOT_IN_REGISTRY]: attachShareholderIds(
    mapWathqToCompany(wathqNebulaVentures, 95, 2020),
    nebulaShareholderIds
  ),
  [DEMO_CR_API_FAIL]: attachShareholderIds(
    mapWathqToCompany(wathqFutureTech, 100, 2019),
    futureTechShareholderIds
  ),
};

/** Demo deal presets */
export const DEMO_DEAL = {
  referencePrice: 100,
  shares: 50000,
  inRangePrice: 85,
  outOfRangePrice: 65,
  largeDealShares: 1500000,
  largeDealPrice: 85,
};

export const PLATFORM_VAT_NUMBER = '300012345600003';
export const PLATFORM_NAME_AR = 'منصة نقل ملكية الأسهم';
export const PLATFORM_NAME_EN = 'Stock Ownership Transfer Platform';

export type { Shareholder };
