import { ArrowRight, Sparkles, X } from 'lucide-react';
import { useApp, useT } from '../context/AppContext';
import type { TranslationKey } from '../i18n/translations';

export function DemoGuideBanner() {
  const { state, followDemoGuide, dismissDemoGuide } = useApp();
  const t = useT();
  const guide = state.demoGuide;

  if (!guide) return null;

  const roleLabel = t(`role.${guide.switchToRole}` as TranslationKey);
  const stepLabel = guide.stepKey ? t(guide.stepKey) : null;

  let message = t(guide.messageKey);
  message = message.replace('{role}', roleLabel);
  if (stepLabel) {
    message = message.replace('{step}', stepLabel);
  }

  const showSwitch = state.currentRole !== guide.switchToRole;

  return (
    <div
      className="od-panel mb-6 flex flex-wrap items-center gap-4 border border-[var(--apple-blue)]/20 bg-[rgba(0,122,255,0.06)] p-4"
      role="status"
      aria-live="polite"
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--apple-blue)] text-white">
          <Sparkles className="h-4 w-4" strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold tracking-[-0.01em] text-[var(--apple-text)]">
            {t('demo.guide.title')}
          </p>
          <p className="apple-subhead mt-0.5">{message}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {showSwitch && (
          <button
            type="button"
            onClick={followDemoGuide}
            className="apple-btn-primary inline-flex items-center gap-2 px-4 py-2"
          >
            {t('demo.guide.switch').replace('{role}', roleLabel)}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" strokeWidth={2} />
          </button>
        )}
        <button
          type="button"
          onClick={dismissDemoGuide}
          className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--apple-text-secondary)] hover:bg-[var(--apple-fill-secondary)]"
          aria-label={t('demo.guide.dismiss')}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
