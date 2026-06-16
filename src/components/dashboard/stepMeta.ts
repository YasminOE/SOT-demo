import type { Role, TransferStep } from '../../types';
import type { TranslationKey } from '../../i18n/translations';

export interface StepMeta {
  titleKey: TranslationKey;
  subtitleKey?: TranslationKey;
  breadcrumbKey: TranslationKey;
}

const META: Partial<Record<TransferStep, StepMeta>> = {
  auth: { titleKey: 'step.auth', subtitleKey: 'dash.subtitle.auth', breadcrumbKey: 'step.auth' },
  company_kyb: {
    titleKey: 'step.company_kyb',
    subtitleKey: 'dash.subtitle.company',
    breadcrumbKey: 'step.company_kyb',
  },
  discrepancy: {
    titleKey: 'step.discrepancy',
    subtitleKey: 'dash.subtitle.company',
    breadcrumbKey: 'step.discrepancy',
  },
  transfer_init: {
    titleKey: 'step.transfer_init',
    subtitleKey: 'dash.subtitle.transfer',
    breadcrumbKey: 'nav.stock_transfers',
  },
  fairness_opinion: {
    titleKey: 'step.fairness_opinion',
    subtitleKey: 'dash.subtitle.admin',
    breadcrumbKey: 'step.fairness_opinion',
  },
  buyer_confirm: {
    titleKey: 'step.buyer_confirm',
    subtitleKey: 'dash.subtitle.buyer',
    breadcrumbKey: 'nav.offers',
  },
  company_rofr: {
    titleKey: 'step.company_rofr',
    subtitleKey: 'dash.subtitle.rofr',
    breadcrumbKey: 'step.company_rofr',
  },
  signing: {
    titleKey: 'step.signing',
    subtitleKey: 'dash.subtitle.signing',
    breadcrumbKey: 'step.signing',
  },
  escrow: {
    titleKey: 'step.buyer_payment',
    subtitleKey: 'dash.subtitle.payment',
    breadcrumbKey: 'step.buyer_payment',
  },
  moci_filing: {
    titleKey: 'step.moci_filing',
    subtitleKey: 'dash.subtitle.moci',
    breadcrumbKey: 'step.moci_filing',
  },
  complete: {
    titleKey: 'step.complete',
    subtitleKey: 'dash.subtitle.complete',
    breadcrumbKey: 'step.complete',
  },
  seller_dashboard: {
    titleKey: 'nav.dashboard',
    subtitleKey: 'dash.subtitle.overview',
    breadcrumbKey: 'nav.dashboard',
  },
  seller_transfers: {
    titleKey: 'nav.stock_transfers',
    subtitleKey: 'dash.subtitle.transfer',
    breadcrumbKey: 'nav.stock_transfers',
  },
  buyer_dashboard: {
    titleKey: 'nav.dashboard',
    subtitleKey: 'dash.subtitle.buyer_home',
    breadcrumbKey: 'nav.dashboard',
  },
  buyer_offers: {
    titleKey: 'nav.offers',
    subtitleKey: 'dash.subtitle.buyer',
    breadcrumbKey: 'nav.offers',
  },
  platform_admin: {
    titleKey: 'nav.dashboard',
    subtitleKey: 'dash.subtitle.admin',
    breadcrumbKey: 'nav.dashboard',
  },
};

export function getStepMeta(step: TransferStep, role: Role): StepMeta {
  const meta = META[step];
  if (meta) return meta;
  if (role === 'seller') {
    return {
      titleKey: 'nav.dashboard',
      subtitleKey: 'dash.subtitle.transfer',
      breadcrumbKey: 'nav.dashboard',
    };
  }
  return {
    titleKey: 'nav.dashboard',
    breadcrumbKey: 'nav.dashboard',
  };
}
