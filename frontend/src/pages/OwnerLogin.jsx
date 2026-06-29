import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Lock, Mail, AlertCircle, Loader2, Eye, EyeOff, KeyRound, Smartphone } from 'lucide-react';
import GoogleLoginBtn from '../components/auth/GoogleLoginBtn';
import PhoneOTPLogin from '../components/auth/PhoneOTPLogin';

const API_BASE = 'http://localhost:5001';
const TABS = ['Email', 'Phone OTP', 'Google'];

const OwnerLogin = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [tab, setTab]           = useState('Email');
  const [form, setForm]         = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    if (user?.role === 'owner') navigate('/owner', { replace: true });
  }, [user, navigate]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.msg || 'Login failed.'); return; }
      if (data.user?.role !== 'owner') {
        setError('Access denied. This portal is for property owners only.');
        return;
      }
      login(data.user, data.token);
      navigate('/owner', { replace: true });
    } catch { setError('Network error. Please check your connection.'); }
    finally { setLoading(false); }
  };

  const handleFirebaseSuccess = (user, token) => {
    // role check already done by backend
    login(user, token);
    navigate('/owner', { replace: true });
  };

  const inputCls = 'w-full bg-white/5 border border-white/10 text-white placeholder-emerald-800 rounded-xl py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition';

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 flex flex-col items-center justify-center px-4">

      <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 text-emerald-400 hover:text-white text-sm transition">
        <Home className="w-4 h-4" /> StayHub
      </Link>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500 shadow-lg mb-4">
            <KeyRound className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white">Owner Portal</h1>
          <p className="text-emerald-300 mt-1 text-sm">Sign in to manage your properties</p>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl">

          {/* Tabs */}
          <div className="flex rounded-xl border border-white/10 overflow-hidden mb-6 text-sm font-semibold">
            {TABS.map(t => (
              <button key={t} onClick={() => { setTab(t); setError(''); }}
                className={`flex-1 py-2.5 transition ${tab === t ? 'bg-emerald-600 text-white' : 'text-emerald-400 hover:bg-white/5'}`}>
                {t === 'Phone OTP' ? <><Smartphone className="w-3.5 h-3.5 inline mr-1 mb-0.5" />Phone</> : t}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-3.5 mb-5 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
            </div>
          )}

          {/* ── Email/Password ── */}
          {tab === 'Email' && (
            <form onSubmit={handleEmailLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                  <input type="email" required autoComplete="email" placeholder="owner@myproperty.com"
                    value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className={`${inputCls} pl-10 pr-4`} />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider">Password</label>
                  <Link to="/forgot-password" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition">Forgot Password?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                  <input type={showPass ? 'text' : 'password'} required autoComplete="current-password" placeholder="••••••••"
                    value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className={`${inputCls} pl-10 pr-11`} />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-600 hover:text-emerald-300">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : 'Sign in to Owner Panel'}
              </button>
            </form>
          )}

          {/* ── Phone OTP ── */}
          {tab === 'Phone OTP' && (
            <PhoneOTPLogin
              role="owner"
              dark={true}
              onSuccess={handleFirebaseSuccess}
              onError={setError}
            />
          )}

          {/* ── Google ── */}
          {tab === 'Google' && (
            <div className="space-y-3">
              <p className="text-center text-sm text-emerald-400 mb-4">
                Sign in with your Google account linked to an owner profile
              </p>
              <GoogleLoginBtn
                role="owner"
                dark={true}
                onSuccess={handleFirebaseSuccess}
                onError={setError}
              />
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-white/10 text-center space-y-1.5">
            <p className="text-xs text-emerald-600">
              Admin?{' '}
              <Link to="/admin/login" className="text-emerald-400 hover:text-emerald-200 font-semibold transition">Admin login →</Link>
            </p>
            <p className="text-xs text-emerald-600">
              Guest?{' '}
              <Link to="/login" className="text-emerald-400 hover:text-emerald-200 font-semibold transition">Customer login →</Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-emerald-800 mt-5">
          Access restricted to registered property owners only.
        </p>
      </div>
    </div>
  );
};

export default OwnerLogin;
