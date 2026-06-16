import {
  LayoutDashboard,
  ArrowLeftRight,
  Building2,
  PlusCircle,
  FileCheck,
  Shield,
  Wallet,
  ClipboardList,
  Award,
  type LucideIcon,
} from 'lucide-react';
import type { Role, TransferStep } from '../../types';
import type { TranslationKey } from '../../i18n/translations';

export interface NavItem {
  id: string;
  labelKey: TranslationKey;
  icon: LucideIcon;
  targetStep: TransferStep;
  activeSteps: TransferStep[];
}

const SELLER_NAV: NavItem[] = [
  {
    id: 'home',
    labelKey: 'nav.dashboard',
    icon: LayoutDashboard,
    targetStep: 'seller_dashboard',
    activeSteps: ['seller_dashboard'],
  },
  {
    id: 'transfers',
    labelKey: 'nav.stock_transfers',
    icon: ArrowLeftRight,
    targetStep: 'seller_transfers',
    activeSteps: ['seller_transfers'],
  },
  {
    id: 'company',
    labelKey: 'nav.company',
    icon: Building2,
    targetStep: 'company_kyb',
    activeSteps: ['company_kyb', 'kyb_fallback', 'discrepancy'],
  },
  {
    id: 'new',
    labelKey: 'nav.new_transfer',
    icon: PlusCircle,
    targetStep: 'transfer_init',
    activeSteps: ['transfer_init'],
  },
];

const BUYER_NAV: NavItem[] = [
  {
    id: 'home',
    labelKey: 'nav.dashboard',
    icon: LayoutDashboard,
    targetStep: 'buyer_dashboard',
    activeSteps: ['buyer_dashboard'],
  },
  {
    id: 'offers',
    labelKey: 'nav.offers',
    icon: FileCheck,
    targetStep: 'buyer_offers',
    activeSteps: ['buyer_offers', 'buyer_confirm'],
  },
  {
    id: 'payment',
    labelKey: 'nav.payments',
    icon: Wallet,
    targetStep: 'escrow',
    activeSteps: ['escrow'],
  },
  {
    id: 'sign',
    labelKey: 'step.signing',
    icon: ClipboardList,
    targetStep: 'signing',
    activeSteps: ['signing'],
  },
];

const COMPANY_NAV: NavItem[] = [
  {
    id: 'rofr',
    labelKey: 'step.company_rofr',
    icon: Shield,
    targetStep: 'company_rofr',
    activeSteps: ['company_rofr'],
  },
  {
    id: 'sign',
    labelKey: 'step.signing',
    icon: ClipboardList,
    targetStep: 'signing',
    activeSteps: ['signing'],
  },
  {
    id: 'moci',
    labelKey: 'step.moci_filing',
    icon: Building2,
    targetStep: 'moci_filing',
    activeSteps: ['moci_filing'],
  },
];

const ADMIN_NAV: NavItem[] = [
  {
    id: 'home',
    labelKey: 'nav.dashboard',
    icon: LayoutDashboard,
    targetStep: 'platform_admin',
    activeSteps: ['platform_admin'],
  },
  {
    id: 'fo',
    labelKey: 'step.fairness_opinion',
    icon: FileCheck,
    targetStep: 'fairness_opinion',
    activeSteps: ['fairness_opinion'],
  },
];

const CERTIFICATE_NAV: NavItem = {
  id: 'certificate',
  labelKey: 'nav.certificate',
  icon: Award,
  targetStep: 'complete',
  activeSteps: ['complete'],
};

export function getNavForRole(
  role: Role,
  transferComplete = false,
  foEnabled = false
): NavItem[] {
  let nav: NavItem[];
  switch (role) {
    case 'seller':
      nav = SELLER_NAV;
      break;
    case 'buyer':
      nav = BUYER_NAV;
      break;
    case 'company_admin':
      nav = COMPANY_NAV;
      break;
    case 'platform_admin':
      nav = foEnabled ? ADMIN_NAV : ADMIN_NAV.filter((item) => item.id !== 'fo');
      break;
    default:
      nav = SELLER_NAV;
  }

  if (transferComplete && (role === 'buyer' || role === 'seller')) {
    return [...nav, CERTIFICATE_NAV];
  }

  return nav;
}
