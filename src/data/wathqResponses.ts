import type { WathqCommercialRegistration } from '../types/wathq';

export const WATHQ_DEMO_CR_CLEAN = '1010123456';
export const WATHQ_DEMO_CR_DISCREPANCY = '1010987654';
export const WATHQ_DEMO_CR_NOT_IN_REGISTRY = '1010444444';
export const WATHQ_DEMO_CR_API_FAIL = '1010222222';

/** Active SJSC — eligible for SOT platform */
export const wathqFutureTech: WathqCommercialRegistration = {
  crNationalNumber: '7009123456',
  crNumber: WATHQ_DEMO_CR_CLEAN,
  versionNo: 3,
  name: {
    ar: 'شركة تقنية المستقبل للمساهمة المبسطة',
    en: 'Future Tech Ventures SJSC',
  },
  crCapital: 10_000_000,
  isMain: true,
  issueDateGregorian: '2019-04-15',
  issueDateHijri: '1440-08-09',
  inLiquidationProcess: false,
  hasEcommerce: false,
  headquarterCityName: { ar: 'الرياض', en: 'Riyadh' },
  isLicenseBased: false,
  entityType: {
    id: 204,
    name: { ar: 'شركة مساهمة', en: 'Joint Stock Company' },
    formId: 2041,
    formName: {
      ar: 'مساهمة مبسطة',
      en: 'Simplified Joint Stock Company (SJSC)',
    },
  },
  status: {
    id: 1,
    name: { ar: 'فعال', en: 'Active' },
    confirmationDate: { gregorian: '2025-11-20', hijri: '1447-05-28' },
    reactivationDate: null,
    suspensionDate: null,
    deletionDate: null,
  },
  contactInfo: {
    phoneNo: '0112345678',
    mobileNo: '0505556677',
    email: 'registry@futuretech.sa',
  },
  capital: {
    currencyName: { ar: 'ريال سعودي', en: 'Saudi Riyal' },
    stockCapital: {
      typeId: 1,
      typeName: { ar: 'أسهم', en: 'Stock' },
      capital: 10_000_000,
      announcedCapital: 10_000_000,
      paidCapital: 10_000_000,
      stocks: [
        {
          count: 1_000_000,
          value: 10,
          typeId: 1,
          typeName: { ar: 'عادية', en: 'Ordinary' },
          classReferenceId: 1,
          className: { ar: 'فئة أ', en: 'Class A' },
        },
      ],
    },
  },
  parties: [
    {
      name: { ar: 'فهد العتيبي', en: 'Fahad Al-Otaibi' },
      typeId: 1,
      typeName: { ar: 'فرد سعودي', en: 'Saudi Individual' },
      identity: { id: '1087654321', typeId: 1, typeName: { ar: 'هوية وطنية', en: 'National ID' } },
      partnership: [{ id: 1, name: { ar: 'مساهم', en: 'Shareholder' } }],
      partnerShare: { cashContributionCount: 250_000, inKindContributionCount: 0, totalContributionCount: 250_000 },
      nationality: { ar: 'سعودي', en: 'Saudi' },
    },
    {
      name: { ar: 'شركة الابتكار القابضة', en: 'Innovation Holdings Co.' },
      typeId: 2,
      typeName: { ar: 'شركة', en: 'Company' },
      identity: { id: '7001234567', typeId: 2, typeName: { ar: 'سجل تجاري', en: 'Commercial Registration' } },
      partnership: [{ id: 1, name: { ar: 'مساهم', en: 'Shareholder' } }],
      partnerShare: { cashContributionCount: 300_000, inKindContributionCount: 0, totalContributionCount: 300_000 },
      crNumber: '7001234567',
    },
    {
      name: { ar: 'خالد المطيري', en: 'Khalid Al-Mutairi' },
      typeId: 1,
      typeName: { ar: 'فرد سعودي', en: 'Saudi Individual' },
      identity: { id: '1065432109', typeId: 1, typeName: { ar: 'هوية وطنية', en: 'National ID' } },
      partnership: [{ id: 1, name: { ar: 'مساهم', en: 'Shareholder' } }],
      partnerShare: { cashContributionCount: 200_000, inKindContributionCount: 0, totalContributionCount: 200_000 },
      nationality: { ar: 'سعودي', en: 'Saudi' },
    },
    {
      name: { ar: 'سارة الحربي', en: 'Sara Al-Harbi' },
      typeId: 1,
      typeName: { ar: 'فرد سعودي', en: 'Saudi Individual' },
      identity: { id: '1111222333', typeId: 1, typeName: { ar: 'هوية وطنية', en: 'National ID' } },
      partnership: [{ id: 1, name: { ar: 'مساهم', en: 'Shareholder' } }],
      partnerShare: { cashContributionCount: 150_000, inKindContributionCount: 0, totalContributionCount: 150_000 },
      nationality: { ar: 'سعودي', en: 'Saudi' },
    },
    {
      name: { ar: 'مؤسسة النمو', en: 'Growth Foundation' },
      typeId: 3,
      typeName: { ar: 'مؤسسة', en: 'Establishment' },
      identity: { id: '7009876543', typeId: 2, typeName: { ar: 'سجل تجاري', en: 'Commercial Registration' } },
      partnership: [{ id: 1, name: { ar: 'مساهم', en: 'Shareholder' } }],
      partnerShare: { cashContributionCount: 100_000, inKindContributionCount: 0, totalContributionCount: 100_000 },
    },
  ],
  management: {
    structureId: 1,
    structureName: { ar: 'مدير', en: 'Manager' },
    managers: [
      {
        name: { ar: 'عبدالله الشمري', en: 'Abdullah Al-Shammari' },
        typeId: 1,
        typeName: { ar: 'سعودي', en: 'Saudi' },
        isLicensed: true,
        identity: { id: '1076543210', typeId: 1, typeName: { ar: 'هوية وطنية', en: 'National ID' } },
        nationality: { ar: 'سعودي', en: 'Saudi' },
        positions: [{ id: 1, name: { ar: 'مدير', en: 'Manager' } }],
      },
    ],
  },
  activities: [
    { id: '620101', name: { ar: 'تطوير البرمجيات', en: 'Software development' } },
    { id: '620102', name: { ar: 'استشارات تقنية المعلومات', en: 'IT consulting' } },
  ],
};

/** Active SJSC — seller not listed in Wathq parties (outdated MoCI records) */
export const wathqNebulaVentures: WathqCommercialRegistration = {
  ...wathqFutureTech,
  crNationalNumber: '7009444444',
  crNumber: WATHQ_DEMO_CR_NOT_IN_REGISTRY,
  name: {
    ar: 'شركة نيبولا للمساهمة المبسطة',
    en: 'Nebula Ventures SJSC',
  },
  parties: wathqFutureTech.parties.filter((p) => p.identity.id !== '1087654321'),
};

export const wathqDigitalSolutions: WathqCommercialRegistration = {
  crNationalNumber: '7008765432',
  crNumber: WATHQ_DEMO_CR_DISCREPANCY,
  versionNo: 2,
  name: {
    ar: 'شركة الحلول الرقمية للمساهمة المبسطة',
    en: 'Digital Solutions SJSC',
  },
  crCapital: 10_000_000,
  isMain: true,
  issueDateGregorian: '2021-06-01',
  issueDateHijri: '1442-10-20',
  inLiquidationProcess: false,
  hasEcommerce: true,
  headquarterCityName: { ar: 'جدة', en: 'Jeddah' },
  isLicenseBased: false,
  entityType: {
    id: 204,
    name: { ar: 'شركة مساهمة', en: 'Joint Stock Company' },
    formId: 2041,
    formName: {
      ar: 'مساهمة مبسطة',
      en: 'Simplified Joint Stock Company (SJSC)',
    },
  },
  status: {
    id: 1,
    name: { ar: 'فعال', en: 'Active' },
    confirmationDate: { gregorian: '2025-09-10', hijri: '1447-03-17' },
    reactivationDate: null,
    suspensionDate: null,
    deletionDate: null,
  },
  contactInfo: {
    phoneNo: '0126543210',
    mobileNo: '0559876543',
    email: 'info@digitalsolutions.sa',
  },
  capital: {
    currencyName: { ar: 'ريال سعودي', en: 'Saudi Riyal' },
    stockCapital: {
      typeId: 1,
      typeName: { ar: 'أسهم', en: 'Stock' },
      capital: 10_000_000,
      announcedCapital: 10_000_000,
      paidCapital: 8_500_000,
      stocks: [
        {
          count: 1_000_000,
          value: 10,
          typeId: 1,
          typeName: { ar: 'عادية', en: 'Ordinary' },
          classReferenceId: 1,
          className: { ar: 'فئة أ', en: 'Class A' },
        },
      ],
    },
  },
  parties: [
    {
      name: { ar: 'سلمان الدوسري', en: 'Salman Al-Dossari' },
      typeId: 1,
      typeName: { ar: 'فرد سعودي', en: 'Saudi Individual' },
      identity: { id: '1098765432', typeId: 1, typeName: { ar: 'هوية وطنية', en: 'National ID' } },
      partnership: [{ id: 1, name: { ar: 'مساهم', en: 'Shareholder' } }],
      partnerShare: { cashContributionCount: 180_000, inKindContributionCount: 0, totalContributionCount: 180_000 },
      nationality: { ar: 'سعودي', en: 'Saudi' },
    },
    {
      name: { ar: 'شركة رأس المال', en: 'Capital Partners Co.' },
      typeId: 2,
      typeName: { ar: 'شركة', en: 'Company' },
      identity: { id: '7005551234', typeId: 2, typeName: { ar: 'سجل تجاري', en: 'Commercial Registration' } },
      partnership: [{ id: 1, name: { ar: 'مساهم', en: 'Shareholder' } }],
      partnerShare: { cashContributionCount: 420_000, inKindContributionCount: 0, totalContributionCount: 420_000 },
      crNumber: '7005551234',
    },
    {
      name: { ar: 'فاطمة الزهراني', en: 'Fatima Al-Zahrani' },
      typeId: 1,
      typeName: { ar: 'فرد سعودي', en: 'Saudi Individual' },
      identity: { id: '1122334455', typeId: 1, typeName: { ar: 'هوية وطنية', en: 'National ID' } },
      partnership: [{ id: 1, name: { ar: 'مساهم', en: 'Shareholder' } }],
      partnerShare: { cashContributionCount: 400_000, inKindContributionCount: 0, totalContributionCount: 400_000 },
      nationality: { ar: 'سعودي', en: 'Saudi' },
    },
  ],
  management: {
    structureId: 1,
    structureName: { ar: 'مدير', en: 'Manager' },
    managers: [
      {
        name: { ar: 'عبدالله الشمري', en: 'Abdullah Al-Shammari' },
        typeId: 1,
        typeName: { ar: 'سعودي', en: 'Saudi' },
        isLicensed: true,
        identity: { id: '1076543210', typeId: 1, typeName: { ar: 'هوية وطنية', en: 'National ID' } },
        nationality: { ar: 'سعودي', en: 'Saudi' },
        positions: [{ id: 1, name: { ar: 'مدير', en: 'Manager' } }],
      },
    ],
  },
  activities: [{ id: '631101', name: { ar: 'معالجة البيانات', en: 'Data processing' } }],
};

/** Suspended LLC — ineligible + inactive demo */
export const wathqSuspendedLLC: WathqCommercialRegistration = {
  crNationalNumber: '7001111111',
  crNumber: '1010111111',
  versionNo: 1,
  name: { ar: 'شركة تجريبية ذات مسؤولية محدودة', en: 'Demo LLC (ineligible)' },
  crCapital: 100_000,
  isMain: true,
  issueDateGregorian: '2015-01-01',
  issueDateHijri: '1436-03-11',
  inLiquidationProcess: false,
  hasEcommerce: false,
  headquarterCityName: { ar: 'الدمام', en: 'Dammam' },
  isLicenseBased: false,
  entityType: {
    id: 205,
    name: { ar: 'شركة ذات مسؤولية محدودة', en: 'Limited Liability Company' },
    formId: 2051,
    formName: { ar: 'ذات مسؤولية محدودة', en: 'LLC' },
  },
  status: {
    id: 3,
    name: { ar: 'موقوف', en: 'Suspended' },
    confirmationDate: { gregorian: '2023-01-01', hijri: '1444-06-08' },
    suspensionDate: { gregorian: '2024-06-01', hijri: '1445-11-24' },
    reactivationDate: null,
    deletionDate: null,
  },
  capital: {
    currencyName: { ar: 'ريال سعودي', en: 'Saudi Riyal' },
    stockCapital: {
      typeId: 1,
      typeName: { ar: 'حصص', en: 'Quota' },
      capital: 100_000,
      announcedCapital: 100_000,
      paidCapital: 100_000,
      stocks: [
        {
          count: 100,
          value: 1000,
          typeId: 1,
          typeName: { ar: 'حصة', en: 'Quota' },
          classReferenceId: 1,
          className: { ar: '—', en: '—' },
        },
      ],
    },
  },
  parties: [],
  management: { structureId: 1, structureName: { ar: 'مدير', en: 'Manager' }, managers: [] },
  activities: [],
};

export const WATHQ_REGISTRY: Record<string, WathqCommercialRegistration> = {
  [WATHQ_DEMO_CR_CLEAN]: wathqFutureTech,
  [WATHQ_DEMO_CR_DISCREPANCY]: wathqDigitalSolutions,
  [WATHQ_DEMO_CR_NOT_IN_REGISTRY]: wathqNebulaVentures,
  [WATHQ_DEMO_CR_API_FAIL]: wathqFutureTech,
  '1010111111': wathqSuspendedLLC,
};
