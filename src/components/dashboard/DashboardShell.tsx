import { Languages } from 'lucide-react';
import type { ReactNode } from 'react';
import { useApp, useT } from '../../context/AppContext';
import { PLATFORM_NAME_AR, PLATFORM_NAME_EN } from '../../data/seed';
import { DemoGuideBanner } from '../DemoGuideBanner';
import { ProgressTracker } from '../ProgressTracker';
import { getNavForRole } from './navConfig';
import { getStepMeta } from './stepMeta';
import type { TranslationKey } from '../../i18n/translations';

const FLOW_STEPS = new Set([
  'company_kyb',
  'kyb_fallback',
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
  const { state, setLanguage, setStep, getActiveTransfer } = useApp();
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
  const showJourney = FLOW_STEPS.has(state.currentStep);

  return (
    <div className="od-app flex min-h-screen">
      <aside className="flex w-[252px] shrink-0 flex-col px-4 py-6">
        <div className="mb-6 px-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--apple-text)] text-[11px] font-semibold tracking-tight text-white">
              SOT
            </div>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold tracking-[-0.02em] text-[var(--apple-text)]">
                {platformName}
              </p>
              <p className="truncate apple-caption">{t(`role.${state.currentRole}` as TranslationKey)}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto">
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
                <Icon
                  className={`h-[18px] w-[18px] shrink-0 ${active ? 'text-[var(--apple-blue)]' : 'text-[var(--apple-text-secondary)]'}`}
                  strokeWidth={active ? 2.25 : 1.75}
                />
                {t(item.labelKey)}
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col pe-4 pb-8 pt-4">
        <header className="apple-glass sticky top-4 z-20 mb-6 rounded-[var(--apple-radius)] px-6 py-4 shadow-[var(--apple-shadow)]">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="apple-caption mb-0.5">{t(meta.breadcrumbKey)}</p>
              <h1 className="apple-large-title truncate">{t(meta.titleKey)}</h1>
              {meta.subtitleKey && (
                <p className="apple-subhead mt-1 truncate">{t(meta.subtitleKey)}</p>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => setLanguage(state.language === 'ar' ? 'en' : 'ar')}
                className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--apple-text-secondary)] transition-colors hover:bg-[var(--apple-fill-secondary)]"
                aria-label="Language"
              >
                <Languages className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </button>
              <div className="ms-2 flex items-center gap-2.5 rounded-full bg-[var(--apple-fill-secondary)] py-1 pe-1 ps-3">
                <div className="hidden text-end sm:block">
                  <p className="max-w-[120px] truncate text-[12px] font-medium tracking-[-0.01em] text-[var(--apple-text)]">
                    {personName}
                  </p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#86868b] to-[#1d1d1f] text-[10px] font-semibold text-white">
                  {initials}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-2">
          <DemoGuideBanner />
          {showJourney && (
            <div className="od-panel mb-6 px-5 py-4">
              <ProgressTracker variant="compact" />
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
