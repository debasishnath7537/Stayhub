import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Home, CalendarDays, LogOut, Star,
  IndianRupee, TrendingUp, Clock, CheckCircle, XCircle,
  Loader2, MapPin, ArrowRight, Building, Calendar, Users,
  Wallet, Search
} from 'lucide-react';

const API_BASE = 'http://localhost:5001';

const fmt  = (n)  => Number(n ?? 0).toLocaleString('en-IN');
const fmtD = (d)  => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const BOOKING_STATUS = (b, now) => {
  if (b.status === 'Cancelled')  return { label: 'Cancelled',   cls: 'bg-red-100 text-red-600' };
  if (new Date(b.checkOutDate) < now) return { label: 'Checked Out', cls: 'bg-gray-100 text-gray-600' };
  return { label: 'Upcoming',    cls: 'bg-emerald-100 text-emerald-700' };
};

export default function OwnerDashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');

  const [stats, setStats] = useState(null);
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loadingSt, setLoadingSt] = useState(true);
  const [loadingPr, setLoadingPr] = useState(true);
  const [loadingBk, setLoadingBk] = useState(true);

  const [bFilter, setBFilter] = useState('All');
  const [bSearch, setBSearch] = useState('');

  const headers = { 'Content-Type': 'application/json', 'x-auth-token': token };
  const now = new Date();

  const fetchData = useCallback(async () => {
    setLoadingSt(true); setLoadingPr(true); setLoadingBk(true);
    try {
      const [sRes, pRes, bRes] = await Promise.all([
        fetch(`${API_BASE}/api/owner/stats`, { headers }),
        fetch(`${API_BASE}/api/owner/my-properties`, { headers }),
        fetch(`${API_BASE}/api/owner/my-bookings`, { headers }),
      ]);
      const [sData, pData, bData] = await Promise.all([sRes.json(), pRes.json(), bRes.json()]);
      if (sRes.ok) setStats(sData);
      if (pRes.ok) setProperties(Array.isArray(pData) ? pData : []);
      if (bRes.ok) setBookings(Array.isArray(bData) ? bData : []);
    } catch (e) { console.error(e); }
    finally { setLoadingSt(false); setLoadingPr(false); setLoadingBk(false); }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredBookings = bookings.filter(b => {
    const { label } = BOOKING_STATUS(b, now);
    const matchFilter = bFilter === 'All' || label === bFilter;
    const matchSearch = !bSearch ||
      b.user?.name?.toLowerCase().includes(bSearch.toLowerCase()) ||
      b.property?.name?.toLowerCase().includes(bSearch.toLowerCase());
    return matchFilter && matchSearch;
  });

  const navItems = [
    { id: 'overview',    label: 'Overview',     icon: LayoutDashboard },
    { id: 'properties',  label: 'My Properties',icon: Home },
    { id: 'bookings',    label: 'Bookings',      icon: CalendarDays },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row font-sans">

      {/* ── Sidebar ── */}
      <aside className="w-full lg:w-60 bg-emerald-950 text-white flex flex-col shrink-0 lg:min-h-screen">
        <div className="h-16 flex items-center px-6 border-b border-emerald-900 gap-2">
          <Building className="w-5 h-5 text-emerald-400" />
          <span className="font-bold tracking-tight text-lg">Owner Panel</span>
        </div>

        {/* Owner info */}
        <div className="px-5 py-4 border-b border-emerald-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-sm font-bold shrink-0">
              {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-white truncate">{user?.name}</p>
              <p className="text-xs text-emerald-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(n => (
            <button key={n.id} onClick={() => setTab(n.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition ${tab === n.id ? 'bg-emerald-600 text-white' : 'text-emerald-300 hover:bg-emerald-900 hover:text-white'}`}>
              <n.icon className="w-4 h-4" /> {n.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-emerald-900 space-y-2">
          <Link to="/" className="flex items-center gap-2 text-xs text-emerald-500 hover:text-white px-4 py-2 rounded-lg hover:bg-emerald-900/60 transition">
            <Home className="w-4 h-4" /> View Site
          </Link>
          <button onClick={() => { logout(); navigate('/owner/login'); }}
            className="w-full flex items-center gap-2 text-xs text-red-400 hover:text-white px-4 py-2 rounded-lg hover:bg-red-900/30 transition">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 overflow-y-auto">
        <div className="py-8 px-4 sm:px-6 lg:px-8">

          {/* Page title */}
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-gray-900">
              {navItems.find(n => n.id === tab)?.label}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {tab === 'overview' && 'Your property portfolio at a glance'}
              {tab === 'properties' && 'All your listed properties'}
              {tab === 'bookings' && 'Reservations across all your properties'}
            </p>
          </div>

          {/* ═══ OVERVIEW ═══ */}
          {tab === 'overview' && (
            <div className="space-y-8">

              {/* Stat cards */}
              {loadingSt ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
              ) : (
                <>
                  {/* Revenue highlight */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white/20 rounded-xl"><IndianRupee className="w-5 h-5" /></div>
                        <p className="text-sm font-semibold text-emerald-100">Platform Revenue (your properties)</p>
                      </div>
                      <p className="text-4xl font-extrabold">₹{fmt(stats?.totalRevenue)}</p>
                      <p className="text-xs text-emerald-200 mt-1">from confirmed bookings</p>
                    </div>
                    <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-6 text-white shadow-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white/20 rounded-xl"><Wallet className="w-5 h-5" /></div>
                        <p className="text-sm font-semibold text-teal-100">Estimated Your Payout</p>
                      </div>
                      <p className="text-4xl font-extrabold">₹{fmt(stats?.estimatedPayout)}</p>
                      <p className="text-xs text-teal-200 mt-1">net rate × nights (approx)</p>
                    </div>
                  </div>

                  {/* Sub stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Total Properties', value: stats?.totalProperties ?? 0, icon: Home,          color: 'bg-blue-50 text-blue-600' },
                      { label: 'Total Bookings',   value: stats?.totalBookings ?? 0,   icon: CalendarDays,   color: 'bg-purple-50 text-purple-600' },
                      { label: 'Upcoming',         value: stats?.upcomingBookings ?? 0, icon: Clock,          color: 'bg-amber-50 text-amber-600',
                        onClick: () => { setBFilter('Upcoming'); setTab('bookings'); } },
                      { label: 'Cancelled',        value: stats?.cancelledBookings ?? 0, icon: XCircle,        color: 'bg-red-50 text-red-500',
                        onClick: () => { setBFilter('Cancelled'); setTab('bookings'); } },
                    ].map(s => (
                      <div key={s.label}
                        onClick={s.onClick}
                        className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 ${s.onClick ? 'cursor-pointer hover:shadow-md transition' : ''}`}>
                        <div className={`p-3 rounded-xl ${s.color}`}><s.icon className="w-5 h-5" /></div>
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{s.label}</p>
                          <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Recent bookings */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900">Recent Reservations</h3>
                  <button onClick={() => setTab('bookings')} className="text-sm text-emerald-600 font-medium hover:underline">View all →</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Guest', 'Property', 'Check-in', 'Check-out', 'Amount', 'Status'].map(h => (
                          <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {loadingBk
                        ? <tr><td colSpan={6} className="py-8 text-center"><Loader2 className="w-5 h-5 animate-spin text-emerald-600 inline" /></td></tr>
                        : bookings.slice(0, 5).map(b => {
                            const { label, cls } = BOOKING_STATUS(b, now);
                            return (
                              <tr key={b._id} className="hover:bg-gray-50">
                                <td className="px-5 py-3">
                                  <p className="font-medium text-gray-900">{b.user?.name || 'Guest'}</p>
                                  <p className="text-xs text-gray-400">{b.user?.email}</p>
                                </td>
                                <td className="px-5 py-3 text-gray-700 max-w-[140px] truncate">{b.property?.name}</td>
                                <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{fmtD(b.checkInDate)}</td>
                                <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{fmtD(b.checkOutDate)}</td>
                                <td className="px-5 py-3 font-bold text-gray-900">₹{fmt(b.totalAmount)}</td>
                                <td className="px-5 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${cls}`}>{label}</span></td>
                              </tr>
                            );
                          })}
                    </tbody>
                  </table>
                  {!loadingBk && bookings.length === 0 && (
                    <p className="text-center text-gray-400 py-10 text-sm">No bookings yet for your properties.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══ PROPERTIES ═══ */}
          {tab === 'properties' && (
            <div>
              {loadingPr ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
              ) : properties.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                  <Home className="w-14 h-14 text-gray-200 mx-auto mb-4" />
                  <h3 className="font-bold text-gray-900 text-lg mb-1">No properties assigned yet</h3>
                  <p className="text-gray-500 text-sm">Ask the StayHub admin to assign properties to your account.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {properties.map(p => {
                    const propBookings = bookings.filter(b => b.property?._id === p._id || b.property?.id === p._id);
                    const upcoming = propBookings.filter(b => b.status === 'Confirmed' && new Date(b.checkOutDate) >= now).length;
                    const revenue  = propBookings.filter(b => b.status === 'Confirmed').reduce((s, b) => s + (b.totalAmount || 0), 0);
                    return (
                      <div key={p._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                        <div className="relative h-44 overflow-hidden">
                          <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80'}
                            alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute top-3 left-3 flex gap-2">
                            <span className={`px-2 py-0.5 text-xs font-bold rounded ${p.type === 'Hotel' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{p.type}</span>
                            <span className={`px-2 py-0.5 text-xs font-bold rounded ${p.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                              {p.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        <div className="p-5">
                          <h3 className="font-bold text-gray-900 text-base leading-snug">{p.name}</h3>
                          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                            <MapPin className="w-3.5 h-3.5" /> {p.location?.city}
                          </div>
                          {p.rating && (
                            <div className="flex items-center gap-1 text-sm text-amber-600 font-semibold mt-1">
                              <Star className="w-3.5 h-3.5 fill-current" /> {p.rating}
                              <span className="text-gray-400 font-normal text-xs">({p.reviews} reviews)</span>
                            </div>
                          )}

                          {/* Price breakdown */}
                          <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <p className="text-gray-400">Your Net Rate</p>
                              <p className="font-bold text-gray-900 text-sm">₹{fmt(p.basePrice)}<span className="font-normal text-gray-400">/night</span></p>
                            </div>
                            <div>
                              <p className="text-gray-400">Platform Sell Rate</p>
                              <p className="font-bold text-emerald-600 text-sm">₹{fmt(p.platformPrice)}<span className="font-normal text-gray-400">/night</span></p>
                            </div>
                          </div>

                          {/* Booking stats */}
                          <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <p className="text-gray-400">Upcoming bookings</p>
                              <p className="font-bold text-gray-900">{upcoming}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Total revenue</p>
                              <p className="font-bold text-gray-900">₹{fmt(revenue)}</p>
                            </div>
                          </div>

                          <button onClick={() => { setBFilter('All'); setTab('bookings'); }}
                            className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-emerald-600 hover:text-emerald-800 font-semibold border border-emerald-200 rounded-xl py-2 hover:bg-emerald-50 transition">
                            View Bookings <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ═══ BOOKINGS ═══ */}
          {tab === 'bookings' && (
            <div className="space-y-5">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="Search guest or property…" value={bSearch} onChange={e => setBSearch(e.target.value)} />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {['All', 'Upcoming', 'Checked Out', 'Cancelled'].map(f => (
                    <button key={f} onClick={() => setBFilter(f)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${bFilter === f ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
                      {f}
                      <span className={`ml-1.5 text-xs rounded-full px-1.5 py-0.5 font-bold ${bFilter === f ? 'bg-white/20' : 'bg-gray-100'}`}>
                        {f === 'All' ? bookings.length : bookings.filter(b => BOOKING_STATUS(b, now).label === f).length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {['ID', 'Guest', 'Property', 'Check-in', 'Check-out', 'Nights', 'Guests', 'Amount', 'Payment', 'GST Details', 'Status'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {loadingBk
                        ? <tr><td colSpan={10} className="py-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-emerald-600 inline" /></td></tr>
                        : filteredBookings.length === 0
                          ? <tr><td colSpan={10} className="py-10 text-center text-gray-400">No bookings match this filter.</td></tr>
                          : filteredBookings.map(b => {
                              const { label, cls } = BOOKING_STATUS(b, now);
                              const nights = Math.round((new Date(b.checkOutDate) - new Date(b.checkInDate)) / 86400000);
                              return (
                                <tr key={b._id} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 font-mono text-xs text-gray-400">#{b._id?.slice(-6).toUpperCase()}</td>
                                  <td className="px-4 py-3">
                                    <p className="font-medium text-gray-900">{b.user?.name || 'Guest'}</p>
                                    <p className="text-xs text-gray-400">{b.user?.email}</p>
                                  </td>
                                  <td className="px-4 py-3 text-gray-700 max-w-[130px] truncate">{b.property?.name}</td>
                                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtD(b.checkInDate)}</td>
                                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtD(b.checkOutDate)}</td>
                                  <td className="px-4 py-3 text-center text-gray-600">{nights}</td>
                                  <td className="px-4 py-3 text-center text-gray-600">{b.guests}</td>
                                  <td className="px-4 py-3 font-bold text-gray-900 whitespace-nowrap">₹{fmt(b.totalAmount)}</td>
                                  <td className="px-4 py-3 text-xs text-gray-500">{b.paymentDetails?.method || '—'}</td>
                                  <td className="px-4 py-3">
                                    {b.guestGstNumber ? (
                                      <div className="text-xs">
                                        <p className="font-semibold text-gray-700">{b.guestGstNumber}</p>
                                        {b.guestCompanyName && <p className="text-gray-500">{b.guestCompanyName}</p>}
                                      </div>
                                    ) : (
                                      <span className="text-xs text-gray-400">—</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${cls}`}>{label}</span></td>
                                </tr>
                              );
                            })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Revenue total for filter */}
              {filteredBookings.length > 0 && (
                <div className="text-right text-sm text-gray-500">
                  Confirmed revenue shown:{' '}
                  <span className="font-bold text-gray-900">
                    ₹{fmt(filteredBookings.filter(b => b.status === 'Confirmed').reduce((s, b) => s + b.totalAmount, 0))}
                  </span>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
