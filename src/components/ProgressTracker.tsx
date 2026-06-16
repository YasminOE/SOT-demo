import { Check } from 'lucide-react';
import { useApp, useT } from '../context/AppContext';
import { getRoleSteps } from '../flows/roleFlows';
import type { TransferStep } from '../types';

const STEP_KEYS: Record<TransferStep, import('../i18n/translations').TranslationKey> = {
  auth: 'step.auth',
  company_kyb: 'step.company_kyb',
  kyb_fallback: 'step.kyb_fallback',
  discrepancy: 'step.discrepancy',
  transfer_init: 'step.transfer_init',
  fairness_opinion: 'step.fairness_opinion',
  buyer_confirm: 'step.buyer_confirm',
  company_rofr: 'step.company_rofr',
  signing: 'step.signing',
  escrow: 'step.buyer_payment',
  moci_filing: 'step.moci_filing',
  complete: 'step.complete',
  seller_dashboard: 'nav.dashboard',
  seller_transfers: 'nav.stock_transfers',
  buyer_dashboard: 'nav.dashboard',
  buyer_offers: 'nav.offers',
  platform_admin: 'nav.dashboard',
};

export function ProgressTracker({ variant = 'default' }: { variant?: 'default' | 'compact' }) {
  const { state } = useApp();
  const t = useT();
  const steps = getRoleSteps(state.currentRole, state.foEnabled);
  const displayStep =
    state.currentStep === 'discrepancy' || state.currentStep === 'kyb_fallback'
      ? 'company_kyb'
      : state.currentStep === 'seller_dashboard' ||
          state.currentStep === 'seller_transfers' ||
          state.currentStep === 'buyer_dashboard' ||
          state.currentStep === 'buyer_offers' ||
          state.currentStep === 'platform_admin'
        ? steps[steps.length - 2] ?? steps[0]
        : steps.includes(state.currentStep)
          ? state.currentStep
          : steps[0];
  const currentIdx = steps.indexOf(displayStep);

  if (variant === 'compact') {
    return (
      <div className="overflow-x-auto">
        <div className="flex min-w-max items-center gap-0.5">
          {steps.map((step, idx) => {
            const done = idx < currentIdx;
            const active = idx === currentIdx;
            return (
              <div key={step} className="flex items-center">
                <div
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium whitespace-nowrap ${
                    done
                      ? 'text-emerald-700'
                      : active
                        ? 'bg-brand-600 text-white'
                        : 'text-slate-400'
                  }`}
                >
                  {done ? <Check className="h-3 w-3" /> : <span>{idx + 1}</span>}
                  {t(STEP_KEYS[step])}
                </div>
                {idx < steps.length - 1 && (
                  <div className={`mx-0.5 h-px w-3 ${done ? 'bg-emerald-300' : 'bg-slate-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-2 text-xs font-medium text-slate-500">
        {t(`role.${state.currentRole}` as import('../i18n/translations').TranslationKey)} —{' '}
        {t('progress.role_journey')}
      </p>
      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-max items-center gap-1">
          {steps.map((step, idx) => {
            const done = idx < currentIdx;
            const active = idx === currentIdx;
            return (
              <div key={step} className="flex items-center">
                <div
                  className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap ${
                    done
                      ? 'bg-emerald-100 text-emerald-800'
                      : active
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {done ? <Check className="h-3 w-3" /> : <span>{idx + 1}</span>}
                  {t(STEP_KEYS[step])}
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`mx-1 h-0.5 w-4 ${done ? 'bg-emerald-300' : 'bg-slate-200'}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
