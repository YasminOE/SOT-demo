import { useApp } from '../context/AppContext';
import { DashboardShell } from './dashboard/DashboardShell';
import { OnboardingShell } from './onboarding/OnboardingShell';

export function Layout({ children }: { children: React.ReactNode }) {
  const { state } = useApp();
  const isOnboarding = state.currentStep === 'auth' && state.currentRole !== 'platform_admin';

  if (isOnboarding) {
    return <OnboardingShell>{children}</OnboardingShell>;
  }

  return <DashboardShell>{children}</DashboardShell>;
}
