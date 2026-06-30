import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Home, CalendarDays, Users, Plus, X, Edit3,
  Loader2, IndianRupee, TrendingUp, CheckCircle, XCircle,
  Clock, ToggleLeft, ToggleRight, Search, ChevronDown, Building, LogOut, UserPlus, UploadCloud,
  ExternalLink, Eye
} from 'lucide-react';
import Modal from '../components/common/Modal';
import ImageUpload from '../components/common/ImageUpload';

const API_BASE = 'http://localhost:5001';

/* ────────────────────────────── helpers ──────────────────────────────── */
const fmt = (n) => Number(n ?? 0).toLocaleString('en-IN');
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const STATUS_STYLE = {
  Confirmed:  'bg-green-100 text-green-700',
  Cancelled:  'bg-red-100 text-red-600',
  CheckedOut: 'bg-gray-100 text-gray-600',
  Pending:    'bg-yellow-100 text-yellow-700',
};

/* ──────────────────────── Property Form ─────────────────────────────── */
const EMPTY_FORM = {
  name: '', type: 'Hotel', location: { city: '', address: '' },
  basePrice: '', platformPrice: '', description: '',
  amenities: '', images: '', rating: '', reviews: '', isActive: true,
  ownedBy: '', roomTypes: [],
};

const PropertyForm = ({ property, onSave, onClose, onOnboardSuccess, owners = [], headers }) => {
  const [form, setForm] = useState(property || EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [submitAction, setSubmitAction] = useState('save');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setLoc = (k, v) => setForm(f => ({ ...f, location: { ...f.location, [k]: v } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...form,
      basePrice: Number(form.basePrice),
      platformPrice: Number(form.platformPrice),
      rating: form.rating ? Number(form.rating) : null,
      reviews: form.reviews ? Number(form.reviews) : 0,
      amenities: typeof form.amenities === 'string' ? form.amenities.split(',').map(s => s.trim()).filter(Boolean) : form.amenities,
      images: typeof form.images === 'string' ? form.images.split(',').map(s => s.trim()).filter(Boolean) : form.images,
      roomTypes: (form.roomTypes || []).map(rt => ({
        ...rt,
        originalInventory: rt.originalInventory !== undefined ? Number(rt.originalInventory) : Number(rt.totalInventory),
        totalInventory: Number(rt.totalInventory),
        capacity: Number(rt.capacity),
        price: Number(rt.price),
        amenities: typeof rt.amenities === 'string' ? rt.amenities.split(',').map(s => s.trim()).filter(Boolean) : rt.amenities,
      }))
    };
    if (!payload.ownedBy) delete payload.ownedBy;
    try {
      let savedProp;
      if (property) {
        const res = await fetch(`${API_BASE}/api/properties/${property._id}`, {
          method: 'PUT', headers, body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to update property');
        savedProp = await res.json();
      } else {
        const res = await fetch(`${API_BASE}/api/properties`, {
          method: 'POST', headers, body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to create property');
        savedProp = await res.json();
      }

      if (submitAction === 'approve' && savedProp && !savedProp.isActive && savedProp.ownerContact?.email) {
        const obRes = await fetch(`${API_BASE}/api/properties/${savedProp._id}/onboard`, {
          method: 'POST', headers
        });
        if (!obRes.ok) throw new Error('Failed to approve and onboard');
        const obData = await obRes.json();
        savedProp = obData.property;
        if (onOnboardSuccess && obData.owner) {
          onOnboardSuccess(obData.owner);
        }
      }
      onSave(savedProp);
    } catch (err) { alert(err.message); } finally { setLoading(false); }
  };

  const fieldCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500";
  const labelCls = "block text-xs font-semibold text-gray-500 uppercase mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto px-6 pt-4 pb-2">
      {property && property.ownerContact && (
        <div className="mb-2 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <h3 className="font-bold text-amber-900 mb-3 text-sm">Enquiry Submitter Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-amber-800">
            <div><span className="font-semibold">Name:</span> {property.ownerContact.name}</div>
            <div><span className="font-semibold">Phone:</span> {property.ownerContact.phone}</div>
            <div className="col-span-1 sm:col-span-2"><span className="font-semibold">Email:</span> {property.ownerContact.email}</div>
            {property.ownerNote && (
              <div className="col-span-1 sm:col-span-2 mt-1">
                <span className="font-semibold">Note from Owner:</span>
                <p className="mt-1 bg-white/60 p-2.5 rounded-lg border border-amber-200 whitespace-pre-wrap">{property.ownerNote}</p>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Property Name *</label>
          <input required className={fieldCls} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Grand Horizon Hotel" />
        </div>
        <div>
          <label className={labelCls}>Type *</label>
          <select required className={fieldCls} value={form.type} onChange={e => set('type', e.target.value)}>
            <option value="Hotel">Hotel</option>
            <option value="Homestay">Homestay</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>City *</label>
          <input required className={fieldCls} value={form.location.city} onChange={e => setLoc('city', e.target.value)} placeholder="Goa" />
        </div>
        <div>
          <label className={labelCls}>Address *</label>
          <input required className={fieldCls} value={form.location.address} onChange={e => setLoc('address', e.target.value)} placeholder="123 Beach Road, North Goa" />
        </div>
        <div>
          <label className={labelCls}>Base (Net) Price ₹ *</label>
          <input required type="number" min="0" className={fieldCls} value={form.basePrice} onChange={e => set('basePrice', e.target.value)} placeholder="1400" />
        </div>
        <div>
          <label className={labelCls}>Platform (Sell) Price ₹ *</label>
          <input required type="number" min="0" className={fieldCls} value={form.platformPrice} onChange={e => set('platformPrice', e.target.value)} placeholder="1650" />
        </div>
        <div>
          <label className={labelCls}>Rating (optional)</label>
          <input type="number" step="0.1" min="0" max="5" className={fieldCls} value={form.rating ?? ''} onChange={e => set('rating', e.target.value)} placeholder="4.8" />
        </div>
        <div>
          <label className={labelCls}>Reviews count (optional)</label>
          <input type="number" min="0" className={fieldCls} value={form.reviews ?? ''} onChange={e => set('reviews', e.target.value)} placeholder="124" />
        </div>
      </div>
      <div>
        <label className={labelCls}>Description *</label>
        <textarea required rows={3} className={fieldCls} value={form.description} onChange={e => set('description', e.target.value)} placeholder="A premium beachfront hotel..." />
      </div>
      <div>
        <label className={labelCls}>Amenities (comma-separated)</label>
        <input className={fieldCls} value={typeof form.amenities === 'string' ? form.amenities : form.amenities?.join(', ')} onChange={e => set('amenities', e.target.value)} placeholder="Free Wifi, AC, Pool, Breakfast Included" />
      </div>
      <div>
        <label className={labelCls}>Property Photos</label>
        <ImageUpload 
          images={Array.isArray(form.images) ? form.images : (form.images ? form.images.split(',').map(s=>s.trim()).filter(Boolean) : [])} 
          onChange={urls => set('images', urls)} 
        />
      </div>

      <div className="pt-4 border-t border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <label className={labelCls}>Room Types</label>
          <button type="button" onClick={() => set('roomTypes', [...(form.roomTypes || []), { name: '', totalInventory: '', capacity: '', price: form.basePrice || '', amenities: '' }])} className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded">
            + Add Room Type
          </button>
        </div>
        <div className="space-y-3">
          {(form.roomTypes || []).map((rt, i) => (
            <div key={i} className="border border-gray-200 p-3 rounded-lg bg-gray-50 grid grid-cols-2 sm:grid-cols-4 gap-2 relative mt-2">
              <button type="button" onClick={() => set('roomTypes', form.roomTypes.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1"><X className="w-3 h-3" /></button>
              <div className="col-span-2">
                <input required className={fieldCls} value={rt.name} onChange={e => { const newRt = [...form.roomTypes]; newRt[i].name = e.target.value; set('roomTypes', newRt); }} placeholder="Room Name (e.g. Standard)" />
              </div>
              <div>
                <input required type="number" min="0" className={fieldCls} value={rt.totalInventory} onChange={e => { const newRt = [...form.roomTypes]; newRt[i].totalInventory = e.target.value; set('roomTypes', newRt); }} placeholder="Inventory" title="Total Inventory" />
              </div>
              <div>
                <input required type="number" min="1" className={fieldCls} value={rt.capacity} onChange={e => { const newRt = [...form.roomTypes]; newRt[i].capacity = e.target.value; set('roomTypes', newRt); }} placeholder="Max Guests" title="Capacity" />
              </div>
              <div className="col-span-2">
                <input required type="number" min="0" className={fieldCls} value={rt.price} onChange={e => { const newRt = [...form.roomTypes]; newRt[i].price = e.target.value; set('roomTypes', newRt); }} placeholder="Price per night" />
              </div>
              <div className="col-span-2">
                <input className={fieldCls} value={typeof rt.amenities === 'string' ? rt.amenities : rt.amenities?.join(', ')} onChange={e => { const newRt = [...form.roomTypes]; newRt[i].amenities = e.target.value; set('roomTypes', newRt); }} placeholder="Amenities (comma-sep)" />
              </div>
            </div>
          ))}
          {(form.roomTypes || []).length === 0 && <p className="text-xs text-gray-400 italic">No room types defined. Add room types so guests can book specific rooms.</p>}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <label className={labelCls}>Assign to Owner (optional)</label>
        <select className={fieldCls} value={form.ownedBy ?? ''} onChange={e => set('ownedBy', e.target.value)}>
          <option value="">— No owner assigned —</option>
          {owners.map(o => (
            <option key={o._id} value={o._id}>{o.name} ({o.email})</option>
          ))}
        </select>
      </div>
      <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition">Cancel</button>
          
          <button type="submit" onClick={() => setSubmitAction('save')} disabled={loading} className="px-6 py-2.5 border border-primary-600 text-primary-600 hover:bg-primary-50 text-sm font-bold rounded-xl transition flex items-center gap-2">
            {loading && submitAction === 'save' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit3 className="w-4 h-4" />}
            Save Changes
          </button>

          {property && !property.isActive && property.ownerContact?.email && (
            <button type="submit" onClick={() => setSubmitAction('approve')} disabled={loading} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-lg transition flex items-center gap-2">
              {loading && submitAction === 'approve' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Save & Approve
            </button>
          )}
        </div>
    </form>
  );
};

/* ═══════════════════════════ MAIN ADMIN ════════════════════════════════ */
export default function Admin() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  /* ── data ── */
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingProp, setLoadingProp] = useState(true);
  const [loadingBook, setLoadingBook] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

  /* ── modals ── */
  const [showAddModal, setShowAddModal] = useState(false);
  const [editProp, setEditProp] = useState(null);
  const [saveError, setSaveError] = useState('');
  const [onboardResult, setOnboardResult] = useState(null);

  /* ── filters ── */
  const [bookingFilter, setBookingFilter] = useState('All');
  const [propSearch, setPropSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleTab, setUserRoleTab] = useState('all');
  const [statsPropId, setStatsPropId] = useState(null);

  const headers = { 'Content-Type': 'application/json', 'x-auth-token': token };

  const fetchAll = useCallback(async () => {
    setLoadingProp(true); setLoadingBook(true); setLoadingUsers(true);
    try {
      const [pRes, bRes, uRes] = await Promise.all([
        fetch(`${API_BASE}/api/properties?all=1`, { headers }),
        fetch(`${API_BASE}/api/bookings/all`, { headers }),
        fetch(`${API_BASE}/api/users/all`, { headers }),
      ]);
      const pData = await pRes.json();
      setProperties(Array.isArray(pData) ? pData : []);
      const bData = await bRes.json();
      setBookings(Array.isArray(bData) ? bData : []);
      const uData = await uRes.json();
      setUsers(Array.isArray(uData) ? uData : []);
    } catch (e) { console.error(e); }
    finally { setLoadingProp(false); setLoadingBook(false); setLoadingUsers(false); }
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const toggleActive = async (prop) => {
    try {
      const res = await fetch(`${API_BASE}/api/properties/${prop._id}`, {
        method: 'PUT', headers, body: JSON.stringify({ isActive: !prop.isActive })
      });
      const d = await res.json();
      if (res.ok) setProperties(p => p.map(x => x._id === d._id ? d : x));
    } catch {}
  };

  const updateInventory = async (propertyId, roomTypeId, newInventory) => {
    try {
      const res = await fetch(`${API_BASE}/api/properties/${propertyId}/inventory`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ roomTypeId, totalInventory: newInventory })
      });
      if (res.ok) {
        const d = await res.json();
        setProperties(p => p.map(x => x._id === d._id ? d : x));
      }
    } catch (e) { console.error(e); }
  };

  /* ── stats ── */
  const confirmedBookings = bookings.filter(b => b.status === 'Confirmed');
  const cancelledBookings = bookings.filter(b => b.status === 'Cancelled');
  const now = new Date();
  const checkedOut = bookings.filter(b => b.status === 'Confirmed' && new Date(b.checkOutDate) < now);
  let adminOwesOwner = 0;
  let ownerOwesAdmin = 0;
  const revenue = confirmedBookings.reduce((s, b) => {
    const prop = b.property;
    if (prop) {
      const nights = Math.max(1, Math.round((new Date(b.checkOutDate) - new Date(b.checkInDate)) / 86400000));
      const rooms = b.numberOfRooms || 1;
      const adminShare = Math.max(0, ((prop.platformPrice || 0) - (prop.basePrice || 0)) * nights * rooms);
      const ownerShare = Math.max(0, (b.totalAmount || 0) - adminShare);

      if (b.paymentDetails?.method === 'PayAtHotel') {
        ownerOwesAdmin += adminShare;
      } else {
        adminOwesOwner += ownerShare;
      }
    }
    return s + (b.totalAmount || 0);
  }, 0);

  const stats = [
    { label: 'Active Properties',   value: properties.filter(p => p.isActive).length, icon: Home,          color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Bookings',      value: bookings.length,     icon: CalendarDays,   color: 'bg-purple-50 text-purple-600' },
    { label: 'Registered Users',    value: users.length,        icon: Users,          color: 'bg-orange-50 text-orange-600' },
    { label: 'Pending Enquiries',   value: properties.filter(p => !p.isActive).length, icon: Building,     color: 'bg-amber-50 text-amber-600' },
  ];

  const bookingLabel = (b) => {
    if (b.status === 'Cancelled') return { label: 'Cancelled', cls: STATUS_STYLE.Cancelled };
    if (new Date(b.checkOutDate) < now) return { label: 'Checked Out', cls: STATUS_STYLE.CheckedOut };
    return { label: 'Confirmed', cls: STATUS_STYLE.Confirmed };
  };

  const filteredBookings = bookings.filter(b => {
    if (bookingFilter === 'All') return true;
    const lbl = bookingLabel(b).label;
    return lbl === bookingFilter;
  });

  const filteredProps = properties.filter(p =>
    p.name?.toLowerCase().includes(propSearch.toLowerCase()) ||
    p.location?.city?.toLowerCase().includes(propSearch.toLowerCase())
  );

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const navItems = [
    { id: 'overview',    icon: LayoutDashboard, label: 'Overview' },
    { id: 'properties',  icon: Home,            label: 'Properties' },
    { id: 'bookings',    icon: CalendarDays,    label: 'Bookings' },
    { id: 'users',       icon: Users,           label: 'Users' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row font-sans">

      <aside className="w-full lg:w-60 bg-gray-900 text-white flex flex-col shrink-0 lg:min-h-screen">
        <div className="h-16 flex items-center px-6 border-b border-gray-800 gap-2">
          <Building className="w-6 h-6 text-primary-400" />
          <span className="text-lg font-bold tracking-tight">StayHub Admin</span>
        </div>
        <nav className="flex-1 px-3 py-5 space-y-1">
          {navItems.map(n => (
            <button key={n.id} onClick={() => setActiveTab(n.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition ${
                activeTab === n.id ? 'bg-primary-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}>
              <n.icon className="w-4 h-4" /> {n.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800 space-y-2">
          <Link to="/" className="flex items-center gap-2 text-xs text-gray-400 hover:text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition">
            <Home className="w-4 h-4" /> View Site
          </Link>
          <button onClick={() => { logout(); navigate('/'); }}
            className="w-full flex items-center gap-2 text-xs text-red-400 hover:text-white px-4 py-2 rounded-lg hover:bg-red-900/40 transition">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="py-8 px-4 sm:px-6 lg:px-8">

          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 capitalize">
                {navItems.find(n => n.id === activeTab)?.label}
              </h1>
              <p className="text-sm text-gray-500">Welcome back, {user?.name}</p>
            </div>
            {activeTab === 'properties' && (
              <button onClick={() => { setSaveError(''); setEditProp(null); setShowAddModal(true); }}
                className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm">
                <Plus className="w-4 h-4" /> Add Property
              </button>
            )}
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                  <p className="text-sm font-semibold text-gray-500 mb-2">Platform Revenue (Total)</p>
                  <p className="text-3xl font-extrabold text-gray-900">₹{fmt(revenue)}</p>
                  <p className="text-xs text-gray-400 mt-1">From all confirmed bookings</p>
                </div>
                <div className="bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                  <div className="relative z-10">
                    <p className="text-sm font-semibold text-rose-100 mb-2">You Owe Owners</p>
                    <p className="text-3xl font-extrabold">₹{fmt(adminOwesOwner)}</p>
                    <p className="text-xs text-rose-200 mt-1">From Online Payments (Razorpay etc)</p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                  <div className="relative z-10">
                    <p className="text-sm font-semibold text-emerald-100 mb-2">Owners Owe You</p>
                    <p className="text-3xl font-extrabold">₹{fmt(ownerOwesAdmin)}</p>
                    <p className="text-xs text-emerald-200 mt-1">Commission from Pay At Hotel</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {stats.map(s => (
                  <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${s.color}`}><s.icon className="w-5 h-5" /></div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{s.label}</p>
                      <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  { label: 'Upcoming',   count: confirmedBookings.filter(b => new Date(b.checkOutDate) >= now).length, icon: Clock,         cls: 'text-blue-600 bg-blue-50' },
                  { label: 'Checked Out', count: checkedOut.length, icon: CheckCircle, cls: 'text-green-600 bg-green-50' },
                  { label: 'Cancelled',  count: cancelledBookings.length, icon: XCircle,      cls: 'text-red-600 bg-red-50' },
                ].map(c => (
                  <div key={c.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 cursor-pointer hover:shadow-md transition"
                    onClick={() => { setBookingFilter(c.label); setActiveTab('bookings'); }}>
                    <div className={`p-3 rounded-xl ${c.cls}`}><c.icon className="w-6 h-6" /></div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase">{c.label} Bookings</p>
                      <p className="text-3xl font-extrabold text-gray-900">{c.count}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900">Recent Bookings</h3>
                  <button onClick={() => setActiveTab('bookings')} className="text-sm text-primary-600 font-medium hover:underline">View all →</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Guest', 'Property', 'Check-in', 'Amount', 'Status'].map(h => (
                          <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {loadingBook
                        ? <tr><td colSpan={5} className="px-5 py-6 text-center text-gray-400"><Loader2 className="w-5 h-5 animate-spin inline" /></td></tr>
                        : bookings.slice(0, 6).map(b => {
                            const { label, cls } = bookingLabel(b);
                            return (
                              <tr key={b._id} className="hover:bg-gray-50">
                                <td className="px-5 py-3 font-medium text-gray-900">{b.user?.name || 'Guest'}</td>
                                <td className="px-5 py-3 text-gray-600">{b.property?.name || '—'}</td>
                                <td className="px-5 py-3 text-gray-500">{fmtDate(b.checkInDate)}</td>
                                <td className="px-5 py-3 font-semibold text-gray-900">₹{fmt(b.totalAmount)}</td>
                                <td className="px-5 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${cls}`}>{label}</span></td>
                              </tr>
                            );
                          })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'properties' && (
            <div className="space-y-5">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Search by name or city…" value={propSearch} onChange={e => setPropSearch(e.target.value)} />
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Property', 'Type', 'City', 'Base ₹', 'Platform ₹', 'Margin', 'Rating', 'Inventory', 'Status', 'Actions'].map(h => (
                          <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {loadingProp
                        ? <tr><td colSpan={10} className="px-5 py-8 text-center"><Loader2 className="w-6 h-6 animate-spin text-primary-600 inline" /></td></tr>
                        : filteredProps.length === 0
                          ? <tr><td colSpan={10} className="px-5 py-8 text-center text-gray-400">No properties found</td></tr>
                          : filteredProps.map(p => {
                              const margin = p.platformPrice - p.basePrice;
                              return (
                                <React.Fragment key={p._id}>
                                <tr className={`hover:bg-gray-50 ${!p.isActive ? 'bg-amber-50/30' : ''}`}>
                                  <td className="px-5 py-3 max-w-[160px] truncate">
                                    <Link to={`/property/${p._id}`} target="_blank" className="font-semibold text-primary-600 hover:text-primary-800 hover:underline flex items-center gap-1.5" title="View Property Page">
                                      {p.name}
                                      <ExternalLink className="w-3 h-3" />
                                    </Link>
                                    {!p.isActive && p.ownerContact && (
                                      <div className="mt-1 text-xs text-amber-700">
                                        <span className="font-bold">Contact:</span> {p.ownerContact.name}
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-5 py-3"><span className={`px-2 py-0.5 rounded text-xs font-bold ${p.type === 'Hotel' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{p.type}</span></td>
                                  <td className="px-5 py-3 text-gray-600">{p.location?.city}</td>
                                  <td className="px-5 py-3 text-gray-600">₹{fmt(p.basePrice)}</td>
                                  <td className="px-5 py-3 font-semibold text-gray-900">₹{fmt(p.platformPrice)}</td>
                                  <td className="px-5 py-3 text-green-600 font-semibold">+₹{fmt(margin)}</td>
                                  <td className="px-5 py-3 text-gray-600">{p.rating ?? '—'}</td>
                                  <td className="px-5 py-3">
                                    <div className="space-y-1.5 min-w-[120px]">
                                      {p.roomTypes?.length > 0 ? p.roomTypes.map(rt => {
                                        const orig = rt.originalInventory ?? rt.totalInventory;
                                        return (
                                        <div key={rt._id} className="flex justify-between items-center text-xs">
                                          <span className="text-gray-500 truncate mr-2 max-w-[60px]" title={rt.name}>{rt.name}</span>
                                          <div className="flex items-center gap-1">
                                            <button onClick={() => updateInventory(p._id, rt._id, Math.max(0, rt.totalInventory - 1))} className="w-5 h-5 rounded border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition">-</button>
                                            <span className="font-bold w-4 text-center">{rt.totalInventory}</span>
                                            <button onClick={() => updateInventory(p._id, rt._id, Math.min(orig, rt.totalInventory + 1))} className="w-5 h-5 rounded border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-emerald-50 hover:text-emerald-500 hover:border-emerald-200 transition">+</button>
                                            <span className="text-gray-400 text-[10px] ml-1">/ {orig}</span>
                                          </div>
                                        </div>
                                      )}) : <span className="text-gray-400 italic text-xs">No rooms added</span>}
                                    </div>
                                  </td>
                                  <td className="px-5 py-3">
                                    {!p.isActive && p.ownerContact?.email ? (
                                      <button onClick={() => { setSaveError(''); setEditProp(p); }} className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1">
                                        <CheckCircle className="w-3.5 h-3.5" /> Review & Approve
                                      </button>
                                    ) : (
                                      <button onClick={() => toggleActive(p)} className="flex items-center gap-1 text-xs font-semibold">
                                        {p.isActive ? <><ToggleRight className="w-5 h-5 text-green-500" /><span className="text-green-600">Active</span></> : <><ToggleLeft className="w-5 h-5 text-gray-400" /><span className="text-gray-500">Inactive</span></>}
                                      </button>
                                    )}
                                  </td>
                                  <td className="px-5 py-3">
                                    <div className="flex items-center gap-3">
                                      <Link to={`/property/${p._id}`} target="_blank"
                                        className="flex items-center gap-1 text-emerald-600 hover:text-emerald-800 font-semibold text-xs" title="Review Property Page">
                                        <Eye className="w-3.5 h-3.5" /> View
                                      </Link>
                                      <button onClick={() => { setSaveError(''); setEditProp(p); }}
                                        className="flex items-center gap-1 text-primary-600 hover:text-primary-800 font-semibold text-xs">
                                        <Edit3 className="w-3.5 h-3.5" /> Edit
                                      </button>
                                      <button onClick={() => setStatsPropId(statsPropId === p._id ? null : p._id)}
                                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold text-xs">
                                        <TrendingUp className="w-3.5 h-3.5" /> Stats
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                                {statsPropId === p._id && (
                                  <tr className="bg-blue-50/40">
                                    <td colSpan={10} className="px-5 py-6 border-b border-blue-100">
                                      {(() => {
                                        const pBookings = bookings.filter(b => b.property?._id === p._id);
                                        const confirmed = pBookings.filter(b => b.status === 'Confirmed');
                                        const cancelled = pBookings.filter(b => b.status === 'Cancelled').length;
                                        const now = new Date();
                                        const upcoming = confirmed.filter(b => new Date(b.checkOutDate) >= now).length;
                                        const checkedOut = confirmed.filter(b => new Date(b.checkOutDate) < now).length;
                                        const rev = confirmed.reduce((s, b) => s + (b.totalAmount || 0), 0);
                                        
                                        return (
                                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                            <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100/50 flex flex-col items-center justify-center text-center">
                                              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Total Bookings</p>
                                              <p className="text-2xl font-extrabold text-gray-900">{pBookings.length}</p>
                                            </div>
                                            <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100/50 flex flex-col items-center justify-center text-center">
                                              <p className="text-xs text-blue-500 font-bold uppercase tracking-wider mb-1">Upcoming</p>
                                              <p className="text-2xl font-extrabold text-gray-900">{upcoming}</p>
                                            </div>
                                            <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100/50 flex flex-col items-center justify-center text-center">
                                              <p className="text-xs text-emerald-500 font-bold uppercase tracking-wider mb-1">Checked Out</p>
                                              <p className="text-2xl font-extrabold text-gray-900">{checkedOut}</p>
                                            </div>
                                            <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100/50 flex flex-col items-center justify-center text-center">
                                              <p className="text-xs text-red-500 font-bold uppercase tracking-wider mb-1">Cancelled</p>
                                              <p className="text-2xl font-extrabold text-gray-900">{cancelled}</p>
                                            </div>
                                            <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100/50 flex flex-col items-center justify-center text-center">
                                              <p className="text-xs text-purple-500 font-bold uppercase tracking-wider mb-1">Total Revenue</p>
                                              <p className="text-2xl font-extrabold text-gray-900">₹{fmt(rev)}</p>
                                            </div>
                                          </div>
                                        );
                                      })()}
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══ BOOKINGS ═══ */}
          {activeTab === 'bookings' && (
            <div className="space-y-5">
              {/* Status filter tabs */}
              <div className="flex flex-wrap gap-2">
                {['All', 'Confirmed', 'Checked Out', 'Cancelled'].map(f => (
                  <button key={f} onClick={() => setBookingFilter(f)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                      bookingFilter === f ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}>
                    {f}
                    <span className={`ml-1.5 text-xs rounded-full px-1.5 py-0.5 font-bold ${bookingFilter === f ? 'bg-white/20' : 'bg-gray-100'}`}>
                      {f === 'All' ? bookings.length
                        : bookings.filter(b => bookingLabel(b).label === f).length}
                    </span>
                  </button>
                ))}
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Booking ID', 'Guest', 'Property', 'Check-in', 'Check-out', 'Guests', 'Amount', 'Payment', 'GST Details', 'Status'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {loadingBook
                        ? <tr><td colSpan={9} className="py-8 text-center"><Loader2 className="w-6 h-6 animate-spin text-primary-600 inline" /></td></tr>
                        : filteredBookings.length === 0
                          ? <tr><td colSpan={9} className="py-8 text-center text-gray-400">No bookings for this filter</td></tr>
                          : filteredBookings.map(b => {
                              const { label, cls } = bookingLabel(b);
                              return (
                                <tr key={b._id} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 font-mono text-xs text-gray-500">#{b._id?.slice(-7).toUpperCase()}</td>
                                  <td className="px-4 py-3">
                                    <p className="font-medium text-gray-900">{b.user?.name || 'Guest'}</p>
                                    <p className="text-xs text-gray-400">{b.user?.email}</p>
                                  </td>
                                  <td className="px-4 py-3">
                                    <p className="text-gray-700 font-medium max-w-[140px] truncate">{b.property?.name || '—'}</p>
                                    {b.roomTypeId && b.property?.roomTypes && (
                                      <p className="text-xs text-gray-500 mt-0.5">
                                        {b.numberOfRooms || 1} × {b.property.roomTypes.find(rt => rt._id === b.roomTypeId)?.name || 'Room'}
                                      </p>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmtDate(b.checkInDate)}</td>
                                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmtDate(b.checkOutDate)}</td>
                                  <td className="px-4 py-3 text-center text-gray-700">{b.guests}</td>
                                  <td className="px-4 py-3 font-bold text-gray-900 whitespace-nowrap">₹{fmt(b.totalAmount)}</td>
                                  <td className="px-4 py-3 text-gray-500 text-xs">{b.paymentDetails?.method || '—'}</td>
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

              {/* Summary row */}
              {filteredBookings.length > 0 && (
                <div className="text-sm text-gray-500 text-right">
                  Total revenue shown: <span className="font-bold text-gray-900">₹{fmt(filteredBookings.filter(b => b.status === 'Confirmed').reduce((s, b) => s + b.totalAmount, 0))}</span>
                </div>
              )}
            </div>
          )}

          {/* ═══ USERS ═══ */}
          {activeTab === 'users' && (() => {
            const ROLE_TABS = [
              { id: 'all',      label: 'All',       color: 'bg-gray-100 text-gray-700' },
              { id: 'customer', label: 'Customers',  color: 'bg-green-100 text-green-700' },
              { id: 'owner',    label: 'Owners',     color: 'bg-emerald-100 text-emerald-700' },
              { id: 'admin',    label: 'Admins',     color: 'bg-yellow-100 text-yellow-700' },
            ];

            const roleFilter = userRoleTab;

            const roleFiltered = filteredUsers.filter(u =>
              roleFilter === 'all' || u.role === roleFilter
            );

            const ROLE_STYLE = {
              admin:    'bg-yellow-100 text-yellow-700',
              owner:    'bg-emerald-100 text-emerald-700',
              customer: 'bg-green-100 text-green-700',
            };

            return (
              <div className="space-y-5">
                {/* Search */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Search name or email…" value={userSearch} onChange={e => setUserSearch(e.target.value)} />
                  </div>
                </div>

                {/* Role tabs */}
                <div className="flex flex-wrap gap-2">
                  {ROLE_TABS.map(rt => {
                    const count = rt.id === 'all' ? users.length : users.filter(u => u.role === rt.id).length;
                    const active = roleFilter === rt.id;
                    return (
                      <button key={rt.id}
                        onClick={() => setUserRoleTab(rt.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                          active ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                        }`}>
                        {rt.label}
                        <span className={`ml-1.5 text-xs rounded-full px-1.5 py-0.5 font-bold ${active ? 'bg-white/20' : 'bg-gray-100'}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          {['User', 'Email', 'Role', 'Joined', roleFilter === 'owner' ? 'Properties' : 'Bookings'].map(h => (
                            <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {loadingUsers
                          ? <tr><td colSpan={5} className="py-8 text-center"><Loader2 className="w-6 h-6 animate-spin text-primary-600 inline" /></td></tr>
                          : roleFiltered.length === 0
                            ? <tr><td colSpan={5} className="py-8 text-center text-gray-400">No {roleFilter === 'all' ? 'users' : roleFilter + 's'} found</td></tr>
                            : roleFiltered.map(u => {
                                const userBookings = bookings.filter(b => b.user?._id === u._id || b.user?.id === u._id);
                                const ownedProps = properties.filter(p =>
                                  p.ownedBy === u._id || p.ownedBy?._id === u._id || p.ownedBy?.toString() === u._id
                                );
                                return (
                                  <tr key={u._id} className="hover:bg-gray-50">
                                    <td className="px-5 py-3">
                                      <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white ${
                                          u.role === 'admin' ? 'bg-yellow-500' : u.role === 'owner' ? 'bg-emerald-600' : 'bg-primary-600'
                                        }`}>
                                          {u.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                        </div>
                                        <span className="font-medium text-gray-900">{u.name}</span>
                                      </div>
                                    </td>
                                    <td className="px-5 py-3 text-gray-600">{u.email}</td>
                                    <td className="px-5 py-3">
                                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${ROLE_STYLE[u.role] ?? 'bg-gray-100 text-gray-600'}`}>
                                        {u.role}
                                      </span>
                                    </td>
                                    <td className="px-5 py-3 text-gray-500">{fmtDate(u.createdAt)}</td>
                                    <td className="px-5 py-3 text-gray-700 font-semibold">
                                      {roleFilter === 'owner'
                                        ? <span className="text-emerald-700">{ownedProps.length} propert{ownedProps.length === 1 ? 'y' : 'ies'}</span>
                                        : userBookings.length
                                      }
                                    </td>
                                  </tr>
                                );
                              })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}


        </div>
      </main>

      {/* ── Add Property Modal ── */}
      {showAddModal && (
        <Modal title="Add New Property" onClose={() => setShowAddModal(false)}>
          {saveError && <p className="text-red-600 text-sm mb-4 bg-red-50 px-3 py-2 rounded-lg">{saveError}</p>}
          <PropertyForm
            property={null}
            headers={headers}
            onSave={(savedProp) => { setProperties(p => [savedProp, ...p]); setShowAddModal(false); }}
            onClose={() => setShowAddModal(false)}
            onOnboardSuccess={setOnboardResult}
            owners={users.filter(u => u.role === 'owner')}
          />
        </Modal>
      )}

      {/* ── Edit Property Modal ── */}
      {editProp && (
        <Modal title={`Edit — ${editProp.name}`} onClose={() => setEditProp(null)}>
          {saveError && <p className="text-red-600 text-sm mb-4 bg-red-50 px-3 py-2 rounded-lg">{saveError}</p>}
          <PropertyForm
            property={{
              ...editProp,
              amenities: editProp.amenities?.join(', ') ?? '',
              images: editProp.images ?? [],
              ownedBy: editProp.ownedBy?._id ?? editProp.ownedBy ?? '',
              roomTypes: editProp.roomTypes?.map(rt => ({ ...rt, amenities: rt.amenities?.join(', ') ?? '' })) ?? []
            }}
            headers={headers}
            onSave={(savedProp) => {
              setProperties(p => p.map(x => x._id === savedProp._id ? savedProp : x));
              setEditProp(null);
            }}
            onClose={() => setEditProp(null)}
            onOnboardSuccess={setOnboardResult}
            owners={users.filter(u => u.role === 'owner')}
          />
        </Modal>
      )}

      {/* ── Onboard Success Modal ── */}
      {onboardResult && (
        <Modal title="Property Approved & Owner Onboarded" onClose={() => setOnboardResult(null)}>
          <div className="space-y-4">
            <div className="bg-green-50 text-green-800 p-4 rounded-xl border border-green-200">
              <p className="font-bold mb-2">Successfully created/linked Owner account!</p>
              <p className="text-sm">Please securely communicate these credentials to the property owner so they can log into the Owner Dashboard.</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 font-mono text-sm">
              <p><strong>Email:</strong> {onboardResult.email}</p>
              <p><strong>Password:</strong> {onboardResult.password}</p>
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => setOnboardResult(null)} className="px-5 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700">Done</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
