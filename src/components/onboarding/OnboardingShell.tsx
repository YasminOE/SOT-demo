import { Languages, Shield } from 'lucide-react';
import type { ReactNode } from 'react';
import { useApp, useT } from '../../context/AppContext';
import { PLATFORM_NAME_AR, PLATFORM_NAME_EN } from '../../data/seed';
import type { TranslationKey } from '../../i18n/translations';

export function OnboardingShell({ children }: { children: ReactNode }) {
  const { state, setLanguage } = useApp();
  const t = useT();
  const platformName = state.language === 'ar' ? PLATFORM_NAME_AR : PLATFORM_NAME_EN;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f0f4f8]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(26,111,212,0.12) 0%, transparent 45%), radial-gradient(circle at 80% 0%, rgba(15,70,140,0.08) 0%, transparent 40%)',
        }}
      />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 lg:px-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white shadow-md shadow-brand-600/20">
            SOT
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">{platformName}</p>
            <p className="text-[11px] text-slate-500">{t('auth.onboarding.badge')}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setLanguage(state.language === 'ar' ? 'en' : 'ar')}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50"
        >
          <Languages className="h-3.5 w-3.5" />
          {t('lang.toggle')}
        </button>
      </header>

      <main className="relative z-10 mx-auto flex max-w-lg flex-col px-6 pb-16 pt-4 lg:max-w-xl lg:pt-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80">
            <Shield className="h-7 w-7 text-brand-600" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {t('auth.onboarding.title')}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            {t(`auth.onboarding.subtitle.${state.currentRole}` as TranslationKey)}
          </p>
        </div>
        {children}
      </main>
    </div>
  );
}
