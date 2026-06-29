import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building, Mail, Lock, AlertCircle, Loader2, Eye, EyeOff, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GoogleLoginBtn from '../components/auth/GoogleLoginBtn';
import PhoneOTPLogin from '../components/auth/PhoneOTPLogin';

const API_BASE = 'http://localhost:5001';
const TABS = ['Email', 'Phone OTP', 'Google'];

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [tab, setTab]         = useState('Email');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Login failed');
      login(data.user, data.token);
      navigate('/');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleFirebaseSuccess = (user, token) => {
    login(user, token);
    navigate('/');
  };

  const fieldCls = 'w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 transition';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center items-center gap-2 mb-6">
          <Building className="h-9 w-9 text-primary-600" />
          <span className="text-2xl font-extrabold text-gray-900">StayHub</span>
        </Link>
        <h2 className="text-center text-2xl font-extrabold text-gray-900 mb-1">Welcome back</h2>
        <p className="text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-500">Sign up</Link>
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 px-8 py-8">
          {/* Auth method tabs */}
          <div className="flex rounded-xl border border-gray-200 overflow-hidden mb-6 text-sm font-semibold">
            {TABS.map(t => (
              <button key={t} onClick={() => { setTab(t); setError(''); }}
                className={`flex-1 py-2.5 transition ${tab === t ? 'bg-primary-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                {t === 'Phone OTP' ? <><Smartphone className="w-3.5 h-3.5 inline mr-1 mb-0.5" />Phone</> : t}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-600 rounded-xl px-3 py-3 mb-5 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
            </div>
          )}

          {/* ── Email/Password ── */}
          {tab === 'Email' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" required autoComplete="email" placeholder="you@example.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition" />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Password</label>
                  <Link to="/forgot-password" className="text-xs font-semibold text-primary-600 hover:text-primary-800 transition">Forgot Password?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type={showPass ? 'text' : 'password'} required autoComplete="current-password" placeholder="••••••••"
                    value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl pl-10 pr-11 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition" />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : 'Sign In'}
              </button>
            </form>
          )}

          {/* ── Phone OTP ── */}
          {tab === 'Phone OTP' && (
            <PhoneOTPLogin
              role="customer"
              onSuccess={handleFirebaseSuccess}
              onError={setError}
            />
          )}

          {/* ── Google ── */}
          {tab === 'Google' && (
            <div className="space-y-3">
              <p className="text-center text-sm text-gray-500 mb-4">
                Sign in instantly with your Google account
              </p>
              <GoogleLoginBtn
                role="customer"
                onSuccess={handleFirebaseSuccess}
                onError={setError}
              />
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-gray-100 flex flex-wrap gap-3 justify-center text-xs text-gray-400">
            <Link to="/owner/login" className="hover:text-emerald-600 font-medium transition">Property Owner? →</Link>
            <span>·</span>
            <Link to="/admin/login" className="hover:text-yellow-600 font-medium transition">Admin →</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
