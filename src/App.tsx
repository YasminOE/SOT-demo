import { useEffect } from 'react';
import { Plus } from 'lucide-react';
import { AppProvider, useApp, useT } from './context/AppContext';
import { Layout } from './components/Layout';
import { DemoDirector } from './components/DemoDirector';
import { PageHeader } from './components/dashboard/PageHeader';
import { getStepMeta } from './components/dashboard/stepMeta';
import { canRoleAccessStep, resolveRoleStep } from './flows/roleFlows';
import { AuthPage } from './pages/AuthPage';
import { CompanyKYBPage } from './pages/CompanyKYBPage';
import { KybFallbackPage } from './pages/KybFallbackPage';
import { DiscrepancyPage } from './pages/DiscrepancyPage';
import { TransferInitPage } from './pages/TransferInitPage';
import { FairnessOpinionPage } from './pages/FairnessOpinionPage';
import { BuyerConfirmPage } from './pages/BuyerConfirmPage';
import { CompanyROFRPage } from './pages/CompanyROFRPage';
import { SigningPage } from './pages/SigningPage';
import { EscrowPage } from './pages/EscrowPage';
import { MoCIFilingPage } from './pages/MoCIFilingPage';
import { CompletionPage } from './pages/CompletionPage';
import { SellerDashboard, SellerTransfersPage, BuyerDashboard, BuyerOffersPage, PlatformAdminPage } from './pages/Dashboards';
import { Button } from './components/ui';
import type { TransferStep } from './types';

const PAGES: Record<TransferStep, React.ReactNode> = {
  auth: <AuthPage />,
  company_kyb: <CompanyKYBPage />,
  kyb_fallback: <KybFallbackPage />,
  discrepancy: <DiscrepancyPage />,
  transfer_init: <TransferInitPage />,
  fairness_opinion: <FairnessOpinionPage />,
  buyer_confirm: <BuyerConfirmPage />,
  company_rofr: <CompanyROFRPage />,
  signing: <SigningPage />,
  escrow: <EscrowPage />,
  moci_filing: <MoCIFilingPage />,
  complete: <CompletionPage />,
  seller_dashboard: <SellerDashboard />,
  seller_transfers: <SellerTransfersPage />,
  buyer_dashboard: <BuyerDashboard />,
  buyer_offers: <BuyerOffersPage />,
  platform_admin: <PlatformAdminPage />,
};

const DASHBOARD_STEPS = new Set<TransferStep>([
  'seller_dashboard',
  'seller_transfers',
  'buyer_dashboard',
  'buyer_offers',
  'platform_admin',
]);

function RoleFlow() {
  const { state, setStep } = useApp();
  const t = useT();
  const { currentStep, currentRole, foEnabled } = state;
  const meta = getStepMeta(currentStep, currentRole);

  useEffect(() => {
    if (!canRoleAccessStep(currentRole, currentStep, foEnabled)) {
      setStep(resolveRoleStep(state));
    }
  }, [currentRole, foEnabled, currentStep, state.activeTransferId, state.transfers, state.persons, state.foEnabled, setStep]);

  if (
    currentStep === 'fairness_opinion' &&
    (!foEnabled || currentRole !== 'platform_admin')
  ) {
    return PAGES[resolveRoleStep(state)] ?? PAGES.auth;
  }

  const page = PAGES[currentStep] ?? PAGES.auth;
  const isOnboarding = currentStep === 'auth';
  const isDashboard = DASHBOARD_STEPS.has(currentStep);
  const showHeader = !isOnboarding;

  const headerAction =
    currentRole === 'seller' && currentStep === 'seller_transfers' ? (
      <Button onClick={() => setStep('transfer_init')} className="gap-2">
        <Plus className="h-4 w-4" />
        {t('nav.new_transfer')}
      </Button>
    ) : undefined;

  return (
    <>
      {showHeader && !DASHBOARD_STEPS.has(currentStep) && (
        <PageHeader
          title={t(meta.titleKey)}
          subtitle={meta.subtitleKey ? t(meta.subtitleKey) : undefined}
          action={headerAction}
        />
      )}
      <div className={isOnboarding || isDashboard ? '' : ''}>{page}</div>
    </>
  );
}

function AppContent() {
  return (
    <Layout>
      <RoleFlow />
      <DemoDirector />
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
