import { Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useApp, useT } from '../context/AppContext';
import { getRoleSteps } from '../flows/roleFlows';
import type { MarketCondition, Role, TransferStep } from '../types';
import { Button } from './ui';

const ROLES: Role[] = ['seller', 'buyer', 'company_admin', 'platform_admin'];

const STEP_KEYS: Partial<Record<TransferStep, import('../i18n/translations').TranslationKey>> = {
  auth: 'step.auth',
  company_kyb: 'step.company_kyb',
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

export function DemoDirector() {
  const {
    state,
    setRole,
    fastForwardRoFR,
    triggerBranch,
    setDemoMarket,
    setFoEnabled,
    jumpToStep,
    simulateBuyerAcceptance,
  } = useApp();
  const t = useT();
  const [open, setOpen] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  const roleSteps = useMemo(
    () => getRoleSteps(state.currentRole, state.foEnabled),
    [state.currentRole, state.foEnabled]
  );

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 start-4 z-50 rounded-full bg-brand-900 px-4 py-2 text-xs font-medium text-white shadow-lg"
      >
        {t('demo.title')}
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 start-4 z-50 w-72 rounded-xl border border-brand-700 bg-brand-900 text-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-brand-700 px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wide">{t('demo.title')}</span>
        <div className="flex gap-1">
          <button onClick={() => setCollapsed(!collapsed)} className="rounded p-1 hover:bg-brand-700">
            {collapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <button onClick={() => setOpen(false)} className="rounded px-2 text-xs hover:bg-brand-700">
            ×
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="space-y-3 p-3 text-xs">
          <div>
            <label className="mb-1 block opacity-70">{t('demo.role')}</label>
            <div className="flex flex-wrap gap-1">
              {ROLES.map((role) => (
                <button
                  key={role}
                  onClick={() => setRole(role)}
                  className={`rounded px-2 py-1 ${state.currentRole === role ? 'bg-white text-brand-900' : 'bg-brand-700 hover:bg-brand-600'}`}
                >
                  {t(`role.${role}` as import('../i18n/translations').TranslationKey)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block opacity-70">{t('demo.fo_toggle')}</label>
            <div className="flex gap-1">
              <button
                onClick={() => setFoEnabled(true)}
                className={`rounded px-2 py-1 ${state.foEnabled ? 'bg-amber-400 text-brand-900' : 'bg-brand-700 hover:bg-brand-600'}`}
              >
                {t('demo.fo_on')}
              </button>
              <button
                onClick={() => setFoEnabled(false)}
                className={`rounded px-2 py-1 ${!state.foEnabled ? 'bg-amber-400 text-brand-900' : 'bg-brand-700 hover:bg-brand-600'}`}
              >
                {t('demo.fo_off')}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block opacity-70">{t('demo.simulate_buyer')}</label>
            <Button
              variant="secondary"
              className="w-full !px-2 !py-1.5 !text-xs"
              onClick={simulateBuyerAcceptance}
              disabled={
                !state.activeTransferId ||
                !['buyer_pending', 'fo_flagged'].includes(
                  state.transfers[state.activeTransferId]?.status ?? ''
                )
              }
            >
              {t('demo.simulate_buyer')}
            </Button>
          </div>

          <div>
            <label className="mb-1 block opacity-70">{t('demo.fast_forward')}</label>
            <div className="flex gap-1">
              <Button
                variant="secondary"
                className="!px-2 !py-1 !text-xs"
                onClick={() => fastForwardRoFR(14)}
              >
                <Clock className="me-1 h-3 w-3" /> Day 15
              </Button>
              <Button
                variant="secondary"
                className="!px-2 !py-1 !text-xs"
                onClick={() => fastForwardRoFR(29)}
              >
                Day 30
              </Button>
            </div>
          </div>

          <div>
            <label className="mb-1 block opacity-70">{t('demo.market_context')}</label>
            <div className="flex flex-wrap gap-1">
              {(['normal', 'stress', 'hot'] as MarketCondition[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setDemoMarket(m)}
                  className={`rounded px-2 py-1 ${state.demoMarketCondition === m ? 'bg-amber-400 text-brand-900' : 'bg-brand-700 hover:bg-brand-600'}`}
                >
                  {t(`market.${m}` as import('../i18n/translations').TranslationKey)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block opacity-70">{t('demo.branch')}</label>
            <div className="flex flex-col gap-1">
              {(
                [
                  ['happy', 'branch.happy'],
                  ['discrepancy', 'branch.discrepancy'],
                  ['price_out_of_range', 'branch.price_out'],
                  ['rofr_exercised', 'branch.rofr'],
                  ['declined_sign', 'branch.decline'],
                ] as const
              ).map(([branch, key]) => (
                <button
                  key={branch}
                  onClick={() => triggerBranch(branch)}
                  className={`rounded px-2 py-1 text-start ${state.demoBranch === branch ? 'bg-amber-400 text-brand-900' : 'bg-brand-700 hover:bg-brand-600'}`}
                >
                  {t(key)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block opacity-70">{t('demo.jump')}</label>
            <select
              value={roleSteps.includes(state.currentStep) ? state.currentStep : roleSteps[0]}
              onChange={(e) => jumpToStep(e.target.value as TransferStep)}
              className="w-full rounded bg-brand-800 px-2 py-1.5 text-white"
            >
              {roleSteps.map((s) => (
                <option key={s} value={s}>
                  {STEP_KEYS[s] ? t(STEP_KEYS[s]!) : s}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
