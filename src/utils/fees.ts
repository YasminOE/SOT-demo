import type { FeeBreakdown } from '../types';

const FEE_RATE = 0.02;
const FEE_FLOOR = 2000;
const FEE_CAP = 20000;
const VAT_RATE = 0.15;

export function calculateFees(
  pricePerShare: number,
  shares: number
): FeeBreakdown {
  const dealValue = pricePerShare * shares;
  let platformFee = dealValue * FEE_RATE;
  let feeCapped = false;
  let feeFloored = false;

  if (platformFee < FEE_FLOOR) {
    platformFee = FEE_FLOOR;
    feeFloored = true;
  }
  if (platformFee > FEE_CAP) {
    platformFee = FEE_CAP;
    feeCapped = true;
  }

  const vatOnFee = platformFee * VAT_RATE;
  const totalInvoicedToSeller = platformFee + vatOnFee;

  return {
    dealValue,
    platformFee,
    vatOnFee,
    totalInvoicedToSeller,
    buyerPlatformFee: 0,
    feeCapped,
    feeFloored,
  };
}

export function formatSAR(amount: number, locale: string = 'en-SA'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export const VAT_BASIS_EN =
  'ZATCA VAT Implementing Regulations Art. 29 (financial services) + ZATCA Agents Guideline (equity transfer exempt, commission taxable)';

export const VAT_BASIS_AR =
  'لائحة تنفيذ ضريبة القيمة المضافة — المادة 29 (الخدمات المالية) + دليل وكلاء هيئة الزكاة (إعفاء نقل الأسهم، خضوع العمولة)';
