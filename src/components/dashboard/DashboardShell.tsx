import {
  Bell,
  ChevronRight,
  HelpCircle,
  Home,
  Languages,
  ShieldCheck,
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
  const { state, setLanguage, setStep, dismissDemoAlert } = useApp();
  const t = useT();
  const person = state.persons[state.currentUserId];
  const nav = getNavForRole(state.currentRole);
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
    <div className="flex min-h-screen bg-[#eef1f5]">
      <aside className="fixed inset-y-0 start-0 z-30 flex w-60 flex-col border-e border-slate-200/80 bg-white">
        <div className="border-b border-slate-100 px-5 py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
              SOT
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">{platformName}</p>
              <p className="truncate text-[10px] uppercase tracking-wide text-slate-400">
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
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'border-s-[3px] border-brand-600 bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-brand-600' : 'text-slate-400'}`} />
                {t(item.labelKey)}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <div className="rounded-xl bg-gradient-to-br from-brand-900 to-brand-700 p-4 text-white">
            <ShieldCheck className="mb-2 h-5 w-5 text-brand-200" />
            <p className="text-xs font-medium leading-relaxed text-brand-50">
              {t('dash.sidebar.promo')}
            </p>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col ps-60">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
          <div className="flex items-center justify-between gap-4 px-6 py-3 lg:px-8">
            <nav className="flex min-w-0 items-center gap-1.5 text-sm text-slate-500">
              <Home className="h-3.5 w-3.5 shrink-0" />
              <ChevronRight className="h-3.5 w-3.5 shrink-0 rtl:rotate-180" />
              <span className="truncate font-medium text-slate-700">{t(meta.breadcrumbKey)}</span>
            </nav>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Help"
              >
                <HelpCircle className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setLanguage(state.language === 'ar' ? 'en' : 'ar')}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Language"
              >
                <Languages className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => hasAlert && dismissDemoAlert()}
                className="relative rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {hasAlert && (
                  <span className="absolute end-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
                )}
              </button>
              <div className="ms-2 flex items-center gap-2 border-s border-slate-200 ps-3">
                <div className="hidden text-end sm:block">
                  <p className="max-w-[140px] truncate text-xs font-semibold text-slate-800">
                    {personName}
                  </p>
                  <p className="max-w-[140px] truncate text-[10px] text-slate-400" dir="ltr">
                    {person?.mobile ?? '—'}
                  </p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                  {initials}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 py-6 lg:px-8 lg:py-8">
          {showJourney && (
            <div className="mb-6 rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
              <ProgressTracker variant="compact" />
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
