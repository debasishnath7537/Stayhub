import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building, Phone, Mail, MapPin, Clock, MessageSquare,
  Send, CheckCircle, Loader2, AlertCircle,
  Headphones, Building2, ShieldCheck
} from 'lucide-react';

const API_BASE = 'http://localhost:5001';

const CONTACT_CARDS = [
  {
    icon: Phone,
    color: 'bg-blue-50 text-blue-600',
    title: '24×7 Support Helpline',
    lines: ['+91-XXXXXXXXXX', '+91-XXXXXXXXXX'],
    sub: 'Available round the clock',
    href: 'tel:+91XXXXXXXXXX',
  },
  {
    icon: Mail,
    color: 'bg-primary-50 text-primary-600',
    title: 'Email Support',
    lines: ['support@stayhub.com'],
    sub: 'We reply within 24 hours',
    href: 'mailto:support@stayhub.com',
  },
  {
    icon: Mail,
    color: 'bg-purple-50 text-purple-600',
    title: 'Grievances',
    lines: ['grievances@stayhub.com'],
    sub: 'Escalation & complaints',
    href: 'mailto:grievances@stayhub.com',
  },
  {
    icon: Mail,
    color: 'bg-emerald-50 text-emerald-600',
    title: 'Partner / List Property',
    lines: ['partner@stayhub.com'],
    sub: 'For property owners',
    href: 'mailto:partner@stayhub.com',
  },
  {
    icon: Mail,
    color: 'bg-amber-50 text-amber-600',
    title: 'Legal & Privacy',
    lines: ['legal@stayhub.com'],
    sub: 'Legal queries & privacy',
    href: 'mailto:legal@stayhub.com',
  },
  {
    icon: MapPin,
    color: 'bg-red-50 text-red-600',
    title: 'Head Office',
    lines: ['StayHub Platform Pvt. Ltd.', 'New Delhi, India – 110001'],
    sub: 'Mon–Sat, 9 AM – 6 PM',
    href: 'https://maps.google.com',
  },
];

const SUPPORT_CATEGORIES = [
  { icon: Building2, label: 'Booking Support',    desc: 'New bookings, modifications & extensions' },
  { icon: CheckCircle, label: 'Cancellations & Refunds', desc: 'Cancel a stay, track your refund' },
  { icon: Headphones,  label: 'Check-In Issues',  desc: 'Help at the property, denied check-in' },
  { icon: ShieldCheck, label: 'Report Fraud',     desc: 'Suspicious payment or activity' },
];

const inputCls = 'w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 transition';

export default function ContactUs() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: 'Booking Support', message: '' });
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    // Simulate submission (no backend endpoint needed — just show success)
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setSuccess(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-2">
          <Building className="w-7 h-7 text-primary-600" />
          <span className="text-xl font-extrabold text-gray-900">StayHub</span>
        </Link>
        <Link to="/" className="text-sm text-primary-600 font-semibold hover:underline">← Back to Home</Link>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-700 via-primary-600 to-indigo-700 text-white text-center py-16 px-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 mb-4">
          <MessageSquare className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">Get in Touch</h1>
        <p className="text-primary-100 max-w-xl mx-auto text-base">
          We're here 24×7 to help with bookings, cancellations, property listings, or any other queries.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">

        {/* Support categories */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {SUPPORT_CATEGORIES.map(c => (
            <div key={c.label} className="bg-white border border-gray-200 rounded-2xl p-4 text-center hover:shadow-md transition">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <c.icon className="w-5 h-5 text-primary-600" />
              </div>
              <p className="font-bold text-gray-900 text-sm">{c.label}</p>
              <p className="text-xs text-gray-500 mt-1">{c.desc}</p>
            </div>
          ))}
        </div>

        {/* Contact cards */}
        <h2 className="text-xl font-extrabold text-gray-900 mb-4">Contact Channels</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {CONTACT_CARDS.map(card => (
            <a key={card.title} href={card.href} target="_blank" rel="noreferrer"
              className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md hover:border-primary-300 transition flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm mb-1">{card.title}</p>
                {card.lines.map(l => (
                  <p key={l} className="text-sm text-gray-700 font-medium">{l}</p>
                ))}
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {card.sub}
                </p>
              </div>
            </a>
          ))}
        </div>

        {/* Contact form */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <h2 className="text-xl font-extrabold text-gray-900 mb-2">Send Us a Message</h2>
            <p className="text-sm text-gray-500 mb-6">Fill in the form and our team will get back to you within 24 hours.</p>

            {success ? (
              <div className="bg-green-50 border border-green-100 rounded-2xl p-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="font-extrabold text-gray-900 text-lg mb-2">Message Received!</h3>
                <p className="text-sm text-gray-500">
                  Thank you, <strong>{form.name}</strong>. We'll reply to <strong>{form.email}</strong> within 24 hours.
                </p>
                <button onClick={() => { setSuccess(false); setForm({ name:'', email:'', phone:'', subject:'Booking Support', message:'' }); }}
                  className="mt-5 text-sm text-primary-600 hover:underline font-semibold">Send another message →</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Full Name *</label>
                    <input required className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ravi Sharma" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email *</label>
                    <input required type="email" className={inputCls} value={form.email} onChange={e => set('email', e.target.value)} placeholder="ravi@example.com" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Phone</label>
                    <input className={inputCls} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Subject *</label>
                    <select required className={inputCls} value={form.subject} onChange={e => set('subject', e.target.value)}>
                      <option>Booking Support</option>
                      <option>Cancellations & Refunds</option>
                      <option>Check-In Issues</option>
                      <option>List My Property</option>
                      <option>Payment Issue</option>
                      <option>Account & Login</option>
                      <option>Report Fraud</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Message *</label>
                  <textarea required rows={5} className={inputCls} value={form.message} onChange={e => set('message', e.target.value)}
                    placeholder="Tell us how we can help you…" />
                </div>
                {error && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-600 rounded-xl p-3 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
                  </div>
                )}
                <button type="submit" disabled={loading}
                  className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : <><Send className="w-4 h-4" /> Send Message</>}
                </button>
              </form>
            )}
          </div>

          {/* Right info panel */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-primary-600 text-white rounded-2xl p-6">
              <h3 className="font-extrabold text-lg mb-4">Quick Help</h3>
              <div className="space-y-3 text-sm">
                {[
                  ['New booking', 'Visit /', 'Find Properties'],
                  ['Cancel a booking', 'Login → My Bookings', ''],
                  ['List your property', '/partner', 'Partner Portal'],
                  ['Owner login', '/owner/login', 'Owner Dashboard'],
                ].map(([action, hint, link]) => (
                  <div key={action} className="flex justify-between items-start border-b border-white/10 pb-2">
                    <span className="text-primary-100">{action}</span>
                    {link
                      ? <Link to={link === 'Find Properties' ? '/' : link.startsWith('/') ? link : link}
                          className="text-white font-semibold hover:underline">{hint}</Link>
                      : <span className="text-white font-semibold">{hint}</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3 text-sm">
              <h3 className="font-extrabold text-gray-900">Office Hours</h3>
              {[
                ['Phone/Chat Support', '24 × 7'],
                ['Email Response', 'Within 24 hours'],
                ['Office (Mon–Sat)', '9:00 AM – 6:00 PM IST'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-gray-600">
                  <span>{k}</span><span className="font-semibold text-gray-900">{v}</span>
                </div>
              ))}
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 text-sm">
              <p className="font-bold text-amber-800 mb-1">⚠️ Grievance Officer</p>
              <p className="text-amber-700">For unresolved complaints or legal matters:</p>
              <a href="mailto:grievances@stayhub.com" className="text-amber-800 font-semibold hover:underline mt-1 block">
                grievances@stayhub.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer strip */}
      <div className="bg-gray-900 py-5 text-center text-xs text-gray-500 mt-6">
        <Link to="/" className="hover:text-white transition">← StayHub Home</Link>
        <span className="mx-3">·</span>
        <Link to="/faq" className="hover:text-white transition">FAQ</Link>
        <span className="mx-3">·</span>
        <Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link>
        <span className="mx-3">·</span>
        <Link to="/terms" className="hover:text-white transition">Terms of Service</Link>
      </div>
    </div>
  );
}
