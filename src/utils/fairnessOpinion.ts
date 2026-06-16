import type { MarketCondition } from '../types';

export const JADA_SOURCE =
  'Jada Fund of Funds, "Rethinking Secondaries in Private Markets" (November 2025)';

export const DISCOUNT_BANDS: Record<
  MarketCondition,
  { min: number; max: number; labelKey: string }
> = {
  normal: { min: 0.1, max: 0.2, labelKey: 'market.normal' },
  stress: { min: 0.3, max: 0.4, labelKey: 'market.stress' },
  hot: { min: 0, max: 0, labelKey: 'market.hot' },
};

export const MIDPOINT_DISCOUNT = 0.14;

export function computeFairRange(
  referencePrice: number,
  marketCondition: MarketCondition
) {
  const band = DISCOUNT_BANDS[marketCondition];
  const floor = referencePrice * (1 - band.max);
  const ceiling = referencePrice * (1 - band.min);
  const midpoint = referencePrice * (1 - MIDPOINT_DISCOUNT);
  return { floor, ceiling, midpoint, band };
}

export function getCompanyAgeNote(foundedYear: number, lang: 'ar' | 'en'): string {
  const age = new Date().getFullYear() - foundedYear;
  if (age <= 3) {
    return lang === 'ar'
      ? 'شركة في مرحلة تجمع أعمى (0–3 سنوات) — معلوماتية فقط'
      : 'Blind-pool stage company (0–3 yrs) — informational only';
  }
  if (age <= 7) {
    return lang === 'ar'
      ? 'نطاق مثالي للسوق الثانوي (4–7 سنوات) — معلوماتية فقط'
      : 'Secondary-market sweet spot (4–7 yrs) — informational only';
  }
  if (age <= 10) {
    return lang === 'ar'
      ? 'مرحلة نهاية الدورة (8–10 سنوات) — معلوماتية فقط'
      : 'Tail-end stage (8–10 yrs) — informational only';
  }
  return lang === 'ar'
    ? 'شركة ناضجة (+10 سنوات) — خصم حاد متوقع — معلوماتية فقط'
    : 'Mature company (10+ yrs) — steep discount expected — informational only';
}

export function validatePrice(
  agreedPrice: number,
  referencePrice: number,
  marketCondition: MarketCondition
) {
  const { floor, ceiling, midpoint, band } = computeFairRange(
    referencePrice,
    marketCondition
  );
  const inRange = agreedPrice >= floor && agreedPrice <= ceiling;
  const discountToReference = ((referencePrice - agreedPrice) / referencePrice) * 100;
  let gapPercent: number | undefined;
  if (!inRange) {
    if (agreedPrice < floor) {
      gapPercent = ((floor - agreedPrice) / floor) * 100;
    } else {
      gapPercent = ((agreedPrice - ceiling) / ceiling) * 100;
    }
  }
  return { floor, ceiling, midpoint, band, inRange, discountToReference, gapPercent };
}

export function generateFOReference(): string {
  const year = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 90000) + 10000);
  return `FO-${year}-${seq}`;
}

export function generateZatcaInvoice(): string {
  return `INV-${Date.now().toString(36).toUpperCase()}`;
}

export function generateCertificateId(): string {
  return `CERT-${Date.now().toString(36).toUpperCase()}`;
}
