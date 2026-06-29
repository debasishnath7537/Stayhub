import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Building, CheckCircle, ArrowRight, IndianRupee, Star, Shield,
  Wifi, Coffee, Car, Dumbbell, Waves, ChefHat, MapPin, Phone,
  Mail, User, Home, Hotel, Loader2, AlertCircle, X
} from 'lucide-react';
import ImageUpload from '../components/common/ImageUpload';

const API_BASE = 'http://localhost:5001';

/* ──────────────── Benefits data ──────────────── */
const BENEFITS = [
  { icon: IndianRupee, title: 'Earn More Revenue',   desc: 'Reach thousands of travelers across India and grow your bookings consistently.' },
  { icon: Shield,      title: 'Secure Payments',      desc: 'Get paid directly to your bank. Every transaction is encrypted and verified.' },
  { icon: Star,        title: 'Build Your Reputation',desc: 'Collect reviews, build trust, and rise in search rankings over time.' },
  { icon: CheckCircle, title: 'Zero Upfront Cost',    desc: 'List your property for free. We only earn when you earn — simple commission model.' },
];

const STATS = [
  { value: '500+', label: 'Properties listed' },
  { value: '₹2Cr+', label: 'Revenue generated' },
  { value: '12K+', label: 'Happy guests' },
  { value: '4.8★', label: 'Average rating' },
];

const STEPS = [
  { num: '01', title: 'Submit your details',   desc: 'Fill in your property info, pricing, and photos.' },
  { num: '02', title: 'We verify & onboard',   desc: 'Our team reviews and activates your listing within 24–48 hrs.' },
  { num: '03', title: 'Start receiving bookings', desc: 'Guests discover and book your property instantly.' },
  { num: '04', title: 'Get paid',              desc: 'Payments settle directly to your account after check-out.' },
];

const AMENITY_OPTIONS = [
  'Free Wifi', 'AC', 'Parking', 'Swimming Pool', 'Gym',
  'Breakfast Included', 'Restaurant', 'Room Service',
  'Hot Water', 'TV', 'Housekeeping', 'Airport Shuttle',
  'Kids Play Area', 'Pet Friendly', 'Garden', 'Terrace',
];

/* ──────────────── Enquiry Form ──────────────── */
const EnquiryForm = ({ onClose, initialType }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    ownerName:     user?.name || '',
    email:         user?.email || '',
    phone:         '',
    propertyName:  '',
    propertyType:  initialType || 'Hotel',
    city:          '',
    address:       '',
    basePrice:     '',
    platformPrice: '',
    description:   '',
    amenities:     [],
    images:        [],
    message:       '',
  });
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState('');

  const toggle = (a) => setForm(f => ({
    ...f,
    amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a]
  }));

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      // Submit as a property listing request — stored with isActive: false pending admin review
      const token = localStorage.getItem('token');
      const payload = {
        name: form.propertyName,
        type: form.propertyType,
        location: { city: form.city, address: form.address },
        basePrice: Number(form.basePrice),
        platformPrice: Number(form.platformPrice || form.basePrice),
        description: form.description || `Property listed by ${form.ownerName}`,
        amenities: form.amenities,
        images: form.images,
        isActive: false,   // pending admin approval
        ownerContact: { name: form.ownerName, email: form.email, phone: form.phone },
        ownerNote: form.message,
      };

      const res = await fetch(`${API_BASE}/api/properties/enquiry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const d = await res.json();
      if (!res.ok) {
        throw new Error(d.msg || 'Submission failed');
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fieldCls = 'w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 transition';
  const labelCls = 'block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5';

  if (success) return (
    <div className="text-center py-8 px-4">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-9 h-9 text-green-600" />
      </div>
      <h3 className="text-xl font-extrabold text-gray-900 mb-2">Application Received! 🎉</h3>
      <p className="text-gray-500 text-sm mb-6">
        Thank you for listing your property with StayHub. Our team will review your submission and activate it within <strong>24–48 hours</strong>.
        You'll receive a confirmation on <strong>{form.email || 'your email'}</strong>.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/" className="px-5 py-2.5 bg-primary-600 text-white rounded-xl font-semibold text-sm hover:bg-primary-700 transition">
          Back to Home
        </Link>
        <Link to="/owner/login" className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition">
          Owner Login →
        </Link>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Owner details */}
        <div>
          <label className={labelCls}>Your Full Name *</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input required className={`${fieldCls} pl-9`} value={form.ownerName} onChange={e => set('ownerName', e.target.value)} placeholder="Ravi Sharma" />
          </div>
        </div>
        <div>
          <label className={labelCls}>Your Email *</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input required type="email" className={`${fieldCls} pl-9`} value={form.email} onChange={e => set('email', e.target.value)} placeholder="ravi@example.com" />
          </div>
        </div>
        <div>
          <label className={labelCls}>Phone Number *</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input required className={`${fieldCls} pl-9`} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
          </div>
        </div>
        <div>
          <label className={labelCls}>Property Type *</label>
          <select required className={fieldCls} value={form.propertyType} onChange={e => set('propertyType', e.target.value)}>
            <option value="Hotel">Hotel</option>
            <option value="Homestay">Homestay</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Property Name *</label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input required className={`${fieldCls} pl-9`} value={form.propertyName} onChange={e => set('propertyName', e.target.value)} placeholder="Grand Horizon Hotel" />
          </div>
        </div>
        <div>
          <label className={labelCls}>City *</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input required className={`${fieldCls} pl-9`} value={form.city} onChange={e => set('city', e.target.value)} placeholder="Goa" />
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Full Address *</label>
          <input required className={fieldCls} value={form.address} onChange={e => set('address', e.target.value)} placeholder="123 Beach Road, North Goa, 403514" />
        </div>
        <div>
          <label className={labelCls}>Your Net Rate ₹/night *</label>
          <input required type="number" min="1" className={fieldCls} value={form.basePrice} onChange={e => set('basePrice', e.target.value)} placeholder="1400" />
          <p className="text-xs text-gray-400 mt-1">The price you want to receive per night</p>
        </div>
        <div>
          <label className={labelCls}>Suggested Sell Price ₹/night</label>
          <input type="number" min="1" className={fieldCls} value={form.platformPrice} onChange={e => set('platformPrice', e.target.value)} placeholder="1650" />
          <p className="text-xs text-gray-400 mt-1">Leave blank to let our team decide</p>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className={labelCls}>Property Description *</label>
        <textarea required rows={3} className={fieldCls} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe your property — location highlights, room types, what makes it special…" />
      </div>

      {/* Amenities */}
      <div>
        <label className={labelCls}>Amenities (select all that apply)</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {AMENITY_OPTIONS.map(a => (
            <button type="button" key={a} onClick={() => toggle(a)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${form.amenities.includes(a) ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}`}>
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Images */}
      <div>
        <label className={labelCls}>Property Photos (Optional)</label>
        <ImageUpload images={form.images} onChange={urls => set('images', urls)} maxFiles={5} />
      </div>

      {/* Additional message */}
      <div>
        <label className={labelCls}>Anything else you'd like to tell us?</label>
        <textarea rows={2} className={fieldCls} value={form.message} onChange={e => set('message', e.target.value)} placeholder="Special notes, preferred activation date, questions…" />
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-600 rounded-xl p-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
        </div>
      )}

      <button type="submit" disabled={loading}
        className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 text-base shadow-lg">
        {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting…</> : <>Submit Listing Application <ArrowRight className="w-5 h-5" /></>}
      </button>

      <p className="text-center text-xs text-gray-400">
        By submitting, you agree to our{' '}
        <a href="#" className="text-primary-500 hover:underline">Partner Terms &amp; Conditions</a>. Our team will contact you within 24 hours.
      </p>
    </form>
  );
};

/* ─────────────────── Main Page ─────────────────── */
export default function ListProperty() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const typeParam = searchParams.get('type');

  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (typeParam === 'Hotel' || typeParam === 'Homestay') {
      setShowForm(true);
    }
  }, [typeParam]);

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <Building className="w-7 h-7 text-primary-600" />
          <span className="text-xl font-extrabold text-gray-900">StayHub</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/owner/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition">Owner Login</Link>
          <button onClick={() => setShowForm(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition shadow-sm">
            List Your Property
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-primary-700 via-primary-600 to-indigo-700 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1920&q=60')] bg-cover bg-center opacity-15" />
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
            🏨 Join 500+ properties on StayHub
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-5">
            Earn More by Listing Your <br className="hidden sm:block" />
            <span className="text-yellow-300">Hotel or Homestay</span>
          </h1>
          <p className="text-lg text-primary-100 max-w-xl mx-auto mb-10">
            Reach thousands of guests across India. Free to list. Transparent pricing. Guaranteed payouts.
          </p>
          <button onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-4 rounded-2xl text-base shadow-xl transition">
            Get Started — It's Free <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-xs text-primary-200 mt-4">No credit card required · Activation within 24–48 hrs</p>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-gray-900 py-10">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map(s => (
            <div key={s.label}>
              <p className="text-3xl font-extrabold text-white">{s.value}</p>
              <p className="text-sm text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="py-20 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900">Why partner with StayHub?</h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">We're built for Indian hospitality — hotels and homestays of all sizes.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BENEFITS.map(b => (
            <div key={b.title} className="bg-gray-50 rounded-2xl p-6 text-center hover:shadow-md transition">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <b.icon className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{b.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">How it works</h2>
            <p className="text-gray-500 mt-3">From application to first booking — in 4 simple steps.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <div key={s.num} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-7 left-[60%] w-full h-0.5 bg-primary-200 z-0" />
                )}
                <div className="relative z-10 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-primary-600 text-white rounded-xl flex items-center justify-center font-extrabold text-lg mb-4">{s.num}</div>
                  <h3 className="font-bold text-gray-900 mb-1">{s.title}</h3>
                  <p className="text-sm text-gray-500">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Property types ── */}
      <section className="py-20 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900">We list all property types</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { icon: Hotel, title: 'Hotels', desc: 'Budget to luxury hotels, business hotels, boutique stays — all welcome.', color: 'bg-blue-50 text-blue-600' },
            { icon: Home,  title: 'Homestays', desc: 'Private rooms, entire homes, farmhouses, villas and heritage properties.', color: 'bg-purple-50 text-purple-600' },
          ].map(pt => (
            <div key={pt.title} className="flex gap-5 items-start p-6 rounded-2xl border border-gray-200 hover:shadow-md transition">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${pt.color}`}>
                <pt.icon className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">{pt.title}</h3>
                <p className="text-sm text-gray-500">{pt.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="bg-gradient-to-r from-primary-600 to-indigo-600 py-16 px-4 text-center text-white">
        <h2 className="text-3xl font-extrabold mb-4">Ready to start earning?</h2>
        <p className="text-primary-100 mb-8 max-w-xl mx-auto">Join hundreds of property owners earning consistently through StayHub. It's free to get started.</p>
        <button onClick={() => setShowForm(true)}
          className="bg-white text-primary-700 font-bold px-8 py-4 rounded-2xl text-base hover:shadow-xl transition inline-flex items-center gap-2">
          List My Property <ArrowRight className="w-5 h-5" />
        </button>
      </section>

      {/* ── Footer mini ── */}
      <div className="bg-gray-900 py-6 text-center text-sm text-gray-500">
        <Link to="/" className="hover:text-white transition">← Back to StayHub</Link>
        <span className="mx-3">·</span>
        <Link to="/owner/login" className="hover:text-white transition">Owner Login</Link>
        <span className="mx-3">·</span>
        <a href="mailto:partner@stayhub.com" className="hover:text-white transition">partner@stayhub.com</a>
      </div>

      {/* ── Listing Form Modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 px-0 sm:px-4"
          onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="bg-white w-full sm:rounded-2xl sm:max-w-2xl max-h-[95vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center z-10">
              <div>
                <h2 className="text-lg font-extrabold text-gray-900">List Your Property</h2>
                <p className="text-xs text-gray-400">Free to submit · Activated within 24–48 hrs</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-xl transition">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="px-6 py-6">
              <EnquiryForm onClose={() => setShowForm(false)} initialType={typeParam} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
