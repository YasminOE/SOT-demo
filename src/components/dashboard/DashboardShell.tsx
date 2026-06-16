import {
  Bell,
  ChevronRight,
  HelpCircle,
  Home,
  Languages,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useApp, useT } from '../../context/AppContext';
import { PLATFORM_NAME_AR, PLATFORM_NAME_EN } from '../../data/seed';
import { ProgressTracker } from '../ProgressTracker';
import { getNavForRole } from './navConfig';
import { getStepMeta } from './stepMeta';
import type { TranslationKey } from '../../i18n/translations';

const FLOW_STEPS = new Set([
  'company_kyb',
  'discrepancy',
  'transfer_init',
  'fairness_opinion',
  'buyer_confirm',
  'company_rofr',
  'signing',
  'escrow',
  'moci_filing',
  'complete',
]);

export function DashboardShell({ children }: { children: ReactNode }) {
  const { state, setLanguage, setStep, dismissDemoAlert, getActiveTransfer } = useApp();
  const t = useT();
  const person = state.persons[state.currentUserId];
  const transfer = getActiveTransfer();
  const transferComplete = transfer?.status === 'complete' && !!transfer.completionCertificateId;
  const nav = getNavForRole(state.currentRole, transferComplete);
  const meta = getStepMeta(state.currentStep, state.currentRole);
  const platformName = state.language === 'ar' ? PLATFORM_NAME_AR : PLATFORM_NAME_EN;
  const personName = person
    ? state.language === 'ar'
      ? person.nameAr
      : person.nameEn
    : '—';
  const initials = personName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const hasAlert = state.demoAlert?.role === state.currentRole;
  const showJourney = FLOW_STEPS.has(state.currentStep);

  return (
    <div className="od-app grid min-h-screen grid-cols-[220px_1fr]">
      <aside className="flex flex-col border-e border-[var(--od-border)] bg-[var(--od-surface)]">
        <div className="border-b border-[var(--od-border)] px-4 py-4">
          <div className="flex items-center gap-2.5 px-2 py-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--od-accent)] text-xs font-bold text-white">
              SOT
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--od-heading)]">{platformName}</p>
              <p className="truncate text-[10px] uppercase tracking-wide text-[var(--od-muted)]">
                {t(`role.${state.currentRole}` as TranslationKey)}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {nav.map((item) => {
            const active = item.activeSteps.includes(state.currentStep);
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setStep(item.targetStep)}
                className={`od-nav-item ${active ? 'od-nav-item-active' : ''}`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-[var(--od-accent)]' : 'text-[var(--od-muted)]'}`} />
                {t(item.labelKey)}
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-20 border-b border-[var(--od-border)] bg-[var(--od-surface)]/95 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4 px-7 py-4">
            <div className="min-w-0">
              <nav className="mb-1 flex items-center gap-1.5 text-xs text-[var(--od-muted)]">
                <Home className="h-3.5 w-3.5 shrink-0" />
                <ChevronRight className="h-3.5 w-3.5 shrink-0 rtl:rotate-180" />
                <span className="truncate">{t(meta.breadcrumbKey)}</span>
              </nav>
              <h1 className="truncate text-xl font-semibold tracking-[-0.01em] text-[var(--od-heading)]">
                {t(meta.titleKey)}
              </h1>
              {meta.subtitleKey && (
                <p className="mt-0.5 truncate text-sm text-[var(--od-muted)]">{t(meta.subtitleKey)}</p>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                className="rounded-md p-2 text-[var(--od-muted)] hover:bg-[var(--od-bg)]"
                aria-label="Help"
              >
                <HelpCircle className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setLanguage(state.language === 'ar' ? 'en' : 'ar')}
                className="rounded-md p-2 text-[var(--od-muted)] hover:bg-[var(--od-bg)]"
                aria-label="Language"
              >
                <Languages className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => hasAlert && dismissDemoAlert()}
                className="relative rounded-md p-2 text-[var(--od-muted)] hover:bg-[var(--od-bg)]"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {hasAlert && (
                  <span className="absolute end-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
                )}
              </button>
              <div className="ms-2 flex items-center gap-2 border-s border-[var(--od-border)] ps-3">
                <div className="hidden text-end sm:block">
                  <p className="max-w-[140px] truncate text-xs font-semibold text-[var(--od-heading)]">
                    {personName}
                  </p>
                  <p className="max-w-[140px] truncate text-[10px] text-[var(--od-muted)]" dir="ltr">
                    {person?.mobile ?? '—'}
                  </p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--od-accent-soft)] text-[10px] font-bold text-[var(--od-accent)]">
                  {initials}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-7 pb-14 pt-6">
          {showJourney && (
            <div className="od-panel mb-6 px-4 py-3">
              <ProgressTracker variant="compact" />
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
