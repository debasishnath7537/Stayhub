import React, { useState, useRef, useEffect } from 'react';
import { auth } from '../../config/firebase';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from 'firebase/auth';
import { Phone, Loader2, ChevronLeft, ShieldCheck } from 'lucide-react';

const API_BASE = 'http://localhost:5001';

/**
 * PhoneOTPLogin
 * Props:
 *  - role: 'customer' | 'owner'
 *  - onSuccess(user, token)
 *  - onError(msg)
 *  - dark: bool — dark background styling
 */
const PhoneOTPLogin = ({ role = 'customer', onSuccess, onError, dark = false }) => {
  const [step, setStep]                   = useState('phone'); // 'phone' | 'otp'
  const [phone, setPhone]                 = useState('');
  const [countryCode, setCountryCode]     = useState('+91');
  const [otp, setOtp]                     = useState(['', '', '', '', '', '']);
  const [loadingSend, setLoadingSend]     = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [confirmResult, setConfirmResult] = useState(null);
  const [timer, setTimer]                 = useState(0);
  const recaptchaRef                      = useRef(null);
  const inputRefs                         = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const fieldCls = dark
    ? 'bg-white/5 border-white/10 text-white placeholder-gray-600'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400';

  const setupRecaptcha = () => {
    if (!recaptchaRef.current) {
      recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {},
      });
    }
    return recaptchaRef.current;
  };

  const sendOTP = async (e) => {
    e.preventDefault();
    const fullPhone = `${countryCode}${phone.replace(/\D/g, '')}`;
    if (fullPhone.length < 10) { onError?.('Enter a valid phone number'); return; }

    setLoadingSend(true);
    try {
      const verifier = setupRecaptcha();
      const result = await signInWithPhoneNumber(auth, fullPhone, verifier);
      setConfirmResult(result);
      setStep('otp');
      setTimer(60);
    } catch (err) {
      onError?.(err.message || 'Failed to send OTP');
      recaptchaRef.current = null; // reset for retry
    } finally {
      setLoadingSend(false);
    }
  };

  const handleOTPChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
    if (!val && idx > 0) inputRefs.current[idx - 1]?.focus();
  };

  const verifyOTP = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { onError?.('Enter the 6-digit OTP'); return; }

    setLoadingVerify(true);
    try {
      const result = await confirmResult.confirm(code);
      const idToken = await result.user.getIdToken();

      const res = await fetch(`${API_BASE}/api/auth/firebase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Login failed');

      onSuccess?.(data.user, data.token);
    } catch (err) {
      onError?.(err.message || 'OTP verification failed');
    } finally {
      setLoadingVerify(false);
    }
  };

  const labelCls = `block text-xs font-semibold uppercase tracking-wider mb-1.5 ${dark ? 'text-gray-400' : 'text-gray-500'}`;

  return (
    <div className="space-y-4">
      {/* Invisible reCAPTCHA anchor */}
      <div id="recaptcha-container" />

      {step === 'phone' && (
        <form onSubmit={sendOTP} className="space-y-4">
          <div>
            <label className={labelCls}>Mobile Number</label>
            <div className="flex gap-2">
              <select
                value={countryCode}
                onChange={e => setCountryCode(e.target.value)}
                className={`border rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-24 ${fieldCls}`}
              >
                <option value="+91">🇮🇳 +91</option>
                <option value="+1">🇺🇸 +1</option>
                <option value="+44">🇬🇧 +44</option>
                <option value="+971">🇦🇪 +971</option>
                <option value="+65">🇸🇬 +65</option>
                <option value="+61">🇦🇺 +61</option>
              </select>
              <div className="relative flex-1">
                <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${dark ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type="tel"
                  required
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="98765 43210"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                  className={`w-full border rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition ${fieldCls}`}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loadingSend || phone.length < 10}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
          >
            {loadingSend ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending OTP…</> : 'Send OTP'}
          </button>
        </form>
      )}

      {step === 'otp' && (
        <form onSubmit={verifyOTP} className="space-y-5">
          <button
            type="button"
            onClick={() => { setStep('phone'); setOtp(['','','','','','']); }}
            className={`flex items-center gap-1 text-xs font-semibold ${dark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'} transition`}
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Change number
          </button>

          <div>
            <label className={labelCls}>
              Enter OTP sent to {countryCode} {phone}
            </label>
            <div className="flex gap-2">
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={el => inputRefs.current[i] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={e => handleOTPChange(i, e.target.value)}
                  onKeyDown={e => { if (e.key === 'Backspace' && !otp[i] && i > 0) inputRefs.current[i-1]?.focus(); }}
                  className={`w-full aspect-square text-center text-xl font-bold border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition ${fieldCls}`}
                />
              ))}
            </div>
            {timer > 0 && (
              <p className={`text-xs mt-2 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                Resend OTP in <span className="font-semibold">{timer}s</span>
              </p>
            )}
            {timer === 0 && (
              <button
                type="button"
                onClick={() => { setStep('phone'); recaptchaRef.current = null; }}
                className="text-xs text-primary-500 hover:underline mt-2"
              >
                Resend OTP
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={loadingVerify || otp.join('').length < 6}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
          >
            {loadingVerify
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</>
              : <><ShieldCheck className="w-4 h-4" /> Verify OTP & Sign In</>
            }
          </button>
        </form>
      )}
    </div>
  );
};

export default PhoneOTPLogin;
