import React, { useState } from 'react';
import { X, Phone, Lock, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { VasatiLogo } from './VasatiLogo';

interface AuthModalProps {
  initialRole?: 'customer' | 'owner';
  onClose: () => void;
  onSuccess: (user: { name: string; phone: string; role: 'customer' | 'owner' }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  initialRole = 'customer',
  onClose,
  onSuccess,
}) => {
  const [role, setRole] = useState<'customer' | 'owner'>('customer');
  const [phone, setPhone] = useState('98450 12345');
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [termsError, setTermsError] = useState(false);
  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone');
  const [otp, setOtp] = useState(['5', '6', '2', '1']);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      setTermsError(true);
      return;
    }
    setTermsError(false);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
    }, 600);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('success');
      setTimeout(() => {
        onSuccess({
          name: 'Lakshminarayana G',
          phone: `+91 ${phone}`,
          role: 'customer',
        });
      }, 1200);
    }, 700);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 sm:p-7 shadow-2xl relative text-vasati-dark font-sans animate-fade-in text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="my-2 flex justify-center">
          <VasatiLogo size="sm" showTagline={false} />
        </div>

        {step === 'phone' && (
          <form onSubmit={handleSendOtp} className="mt-4 text-left">
            <h3 className="text-base font-extrabold text-vasati-dark text-center">Welcome to VASATI</h3>
            <p className="text-xs text-gray-500 text-center mt-0.5">Enter your phone number to login or sign up</p>

            <div className="mt-4">
              <label className="text-xs font-bold text-vasati-dark block mb-1">Mobile Number</label>
              <div className="flex items-center border border-vasati-purple-border rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-vasati-purple/30 bg-white">
                <span className="px-3 text-xs font-bold text-vasati-secondary bg-vasati-purple-soft/40 border-r border-vasati-purple-border py-3">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="98765 43210"
                  className="flex-1 px-3 py-3 text-xs font-bold focus:outline-none text-vasati-dark"
                />
              </div>
            </div>

            {/* Terms & Conditions Acceptance */}
            <div className="mt-3.5 flex items-start gap-2 bg-vasati-purple-soft/40 p-2.5 rounded-2xl border border-vasati-purple-border/50">
              <input
                type="checkbox"
                id="terms_agree"
                checked={agreedToTerms}
                onChange={e => {
                  setAgreedToTerms(e.target.checked);
                  if (e.target.checked) setTermsError(false);
                }}
                className="mt-0.5 rounded text-vasati-purple focus:ring-vasati-purple accent-vasati-purple cursor-pointer"
              />
              <label htmlFor="terms_agree" className="text-[11px] text-vasati-secondary leading-snug cursor-pointer">
                I agree to the <span className="font-bold text-vasati-purple">Terms of Service</span> and <span className="font-bold text-vasati-purple">Privacy Policy</span> of VASATI.
              </label>
            </div>
            {termsError && (
              <p className="text-[11px] font-bold text-red-500 mt-1 text-center">
                Please accept the Terms & Conditions to proceed.
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3.5 rounded-full bg-gradient-to-r from-vasati-purple to-vasati-purple-vibrant hover:from-vasati-royal hover:to-vasati-purple text-white font-extrabold text-xs shadow-card-hover flex items-center justify-center gap-1.5 transition-all active:scale-98"
            >
              {loading ? (
                <span>Sending OTP...</span>
              ) : (
                <>
                  <span>Get OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-[10px] text-vasati-secondary text-center mt-3">
              🛡️ OTP will be simulated for testing (Code: 5621)
            </p>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="mt-4 text-center">
            <h3 className="text-base font-extrabold text-vasati-dark">Verify OTP</h3>
            <p className="text-xs text-vasati-secondary mt-0.5">Enter 4-digit code sent to +91 {phone}</p>

            <div className="flex justify-center gap-2.5 my-5">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={e => {
                    const newOtp = [...otp];
                    newOtp[idx] = e.target.value;
                    setOtp(newOtp);
                  }}
                  className="w-11 h-12 text-center text-lg font-black border-2 border-vasati-purple-border rounded-xl focus:border-vasati-purple focus:outline-none bg-vasati-purple-soft/30 text-vasati-dark"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-vasati-purple to-vasati-purple-vibrant hover:from-vasati-royal hover:to-vasati-purple text-white font-extrabold text-xs shadow-card-hover transition-all"
            >
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>

            <button
              type="button"
              onClick={() => setStep('phone')}
              className="mt-3 text-xs text-vasati-purple font-bold hover:underline block mx-auto"
            >
              Change Phone Number
            </button>
          </form>
        )}

        {step === 'success' && (
          <div className="py-6 text-center animate-fade-in">
            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-2 animate-bounce" />
            <h3 className="text-base font-extrabold text-vasati-dark">Login Verified!</h3>
            <p className="text-xs text-gray-500 mt-1">
              Welcome back, {role === 'customer' ? 'Lakshminarayana G' : 'Ramesh Sharma'}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

