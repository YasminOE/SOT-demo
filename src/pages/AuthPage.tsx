import { useState } from 'react';
import { CheckCircle2, Smartphone } from 'lucide-react';
import { useApp, useT } from '../context/AppContext';
import { NafathModal } from '../components/NafathModal';
import { Button, IdentityBadge, Input } from '../components/ui';
import { mockSendOTP, mockVerifyOTP } from '../services/mockApi';
import { getPostAuthDashboard } from '../flows/roleFlows';

export function AuthPage() {
  const { state, setStep, logAudit } = useApp();
  const t = useT();
  const person = state.persons[state.currentUserId];
  const [mobile, setMobile] = useState(person.mobile);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNafath, setShowNafath] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const stepDone = person.identityVerified ? 3 : otpVerified ? 2 : otpSent ? 1 : 0;

  const handleSendOtp = async () => {
    setLoading(true);
    await mockSendOTP(mobile);
    setLoading(false);
    setOtpSent(true);
    logAudit('auth.otp_sent', 'OTP sent to mobile', mobile);
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    const result = await mockVerifyOTP(otp);
    setLoading(false);
    if (result.success) {
      setOtpVerified(true);
      logAudit('auth.otp_verified', 'OTP verified');
      setShowNafath(true);
    }
  };

  const goToDashboard = () => {
    setStep(getPostAuthDashboard(state));
  };

  const steps = [
    t('auth.onboarding.step.mobile'),
    t('auth.onboarding.step.nafath'),
    t('auth.onboarding.step.done'),
  ];

  return (
    <>
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-100 lg:p-8">
        <div className="mb-6 flex justify-center gap-2">
          {steps.map((label, idx) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  idx < stepDone
                    ? 'bg-emerald-500 text-white'
                    : idx === stepDone
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 text-slate-400'
                }`}
              >
                {idx < stepDone ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
              </div>
              <span className="max-w-[4.5rem] text-center text-[10px] text-slate-500">{label}</span>
            </div>
          ))}
        </div>

        <div className="mb-6 rounded-xl bg-brand-50/80 p-4">
          <div className="flex items-center gap-3">
            <Smartphone className="h-5 w-5 text-brand-600" />
            <div>
              <p className="text-sm font-semibold text-brand-900">{t('badge.nafath')}</p>
              <p className="text-xs text-brand-700/80">{t('badge.nafath.desc')}</p>
            </div>
          </div>
        </div>

        <div className="mb-4 rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm">
          <p className="font-medium text-slate-800">
            {state.language === 'ar' ? person.nameAr : person.nameEn}
          </p>
          <p className="mt-1 text-xs text-slate-500" dir="ltr">
            NID {person.nationalId} · {person.mobile}
          </p>
        </div>

        <div className="space-y-4">
          <Input label={t('auth.mobile')} value={mobile} onChange={setMobile} dir="ltr" />
          {!otpSent ? (
            <Button onClick={handleSendOtp} disabled={loading} className="w-full">
              {loading ? t('common.loading') : t('auth.send_otp')}
            </Button>
          ) : (
            <>
              <Input
                label={t('auth.otp')}
                value={otp}
                onChange={setOtp}
                dir="ltr"
                placeholder="1234"
              />
              <Button
                onClick={handleVerifyOtp}
                disabled={loading || otp.length < 4}
                className="w-full"
              >
                {loading ? t('common.loading') : t('auth.verify')}
              </Button>
            </>
          )}
          {person.identityVerified && (
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-center gap-2">
                <IdentityBadge verified />
                <span className="text-sm font-medium text-emerald-700">{t('nafath.success')}</span>
              </div>
              <Button onClick={goToDashboard} className="w-full">
                {t('auth.onboarding.enter_dashboard')}
              </Button>
            </div>
          )}
        </div>
      </div>

      <NafathModal
        open={showNafath}
        onClose={() => setShowNafath(false)}
        onSuccess={goToDashboard}
        personId={person.id}
      />
    </>
  );
}
