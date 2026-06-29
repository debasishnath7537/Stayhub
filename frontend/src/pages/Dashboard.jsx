import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, CheckCircle, Clock, User, Mail, Shield, Building, Search, XCircle, ArrowRight, Trash2, Loader2, Star, MessageSquare } from 'lucide-react';

const API_BASE = 'http://localhost:5001';

const Dashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const bookingSuccess = location.state?.bookingSuccess;
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookingSubTab, setBookingSubTab] = useState('upcoming');
  const [cancellingId, setCancellingId] = useState(null);
  const [reviewingBooking, setReviewingBooking] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewedBookingIds, setReviewedBookingIds] = useState(new Set());

  // UI-only hidden bookings — stored in localStorage, never touches DB
  const storageKey = user?.id ? `hiddenBookings_${user.id}` : 'hiddenBookings';
  const [hiddenIds, setHiddenIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem(storageKey) || '[]')); }
    catch { return new Set(); }
  });

  const hideBooking = (id) => {
    if (!window.confirm('Remove this booking from your history? It will no longer appear here.')) return;
    setHiddenIds(prev => {
      const next = new Set(prev);
      next.add(id);
      try { localStorage.setItem(storageKey, JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  const cancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancellingId(id);
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${id}/cancel`, {
        method: 'PUT',
        headers: { 'x-auth-token': token }
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'Cancelled' } : b));
        setBookingSubTab('cancelled');
      }
    } catch (err) {
      console.error('Cancel failed:', err);
    } finally {
      setCancellingId(null);
    }
  };

  useEffect(() => {
    const fetchBookings = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE}/api/bookings/my-bookings`, {
          headers: { 'x-auth-token': token }
        });
        const data = await res.json();
        if (res.ok) {
          setBookings(data);
        }
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
      } finally {
        setLoadingBookings(false);
      }
    };
    const fetchMyReviews = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE}/api/reviews/my-reviews`, {
          headers: { 'x-auth-token': token }
        });
        if (res.ok) {
          const data = await res.json();
          setReviewedBookingIds(new Set(data.map(r => r.booking)));
        }
      } catch (err) {}
    };
    fetchBookings();
    fetchMyReviews();
  }, [token]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (reviewForm.rating === 0) return alert('Please select a star rating.');
    setSubmittingReview(true);
    try {
      const res = await fetch(`${API_BASE}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({
          bookingId: reviewingBooking._id,
          propertyId: reviewingBooking.property._id,
          rating: reviewForm.rating,
          comment: reviewForm.comment
        })
      });
      if (res.ok) {
        setReviewedBookingIds(prev => new Set([...prev, reviewingBooking._id]));
        setReviewingBooking(null);
        setReviewForm({ rating: 0, comment: '' });
        alert('Thank you! Your review has been submitted.');
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to submit review');
      }
    } catch (err) {
      alert('Network error submitting review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const tabs = [
    { id: 'bookings', label: 'My Bookings', icon: Calendar },
    { id: 'profile', label: 'Profile Details', icon: User },
  ];

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen">
        {/* Success toast */}
        {bookingSuccess && (
          <div className="bg-green-600 text-white text-center py-3 px-4 text-sm font-semibold flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" /> Booking confirmed! Your stay is reserved.
          </div>
        )}
        {/* Profile Hero Banner */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-primary-600 text-white flex items-center justify-center text-4xl font-extrabold shrink-0">
                {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?'}
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-3xl font-extrabold text-gray-900">{user?.name}</h1>
                <p className="text-gray-500 mt-1 flex items-center justify-center sm:justify-start gap-2"><Mail className="w-4 h-4" /> {user?.email}</p>
                <div className="mt-3 flex items-center gap-2 justify-center sm:justify-start">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${user?.role === 'admin' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-700'}`}>
                    <Shield className="w-3 h-3" />
                    {user?.role || 'Customer'}
                  </span>
                </div>
              </div>
              <div className="sm:ml-auto flex gap-3 mt-4 sm:mt-0 shrink-0">
                <button onClick={() => navigate('/properties')} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg font-medium transition shadow-sm">
                  <Search className="w-4 h-4" /> Find Stays
                </button>
              </div>
            </div>

            {/* Tab Bar */}
            <div className="mt-8 flex gap-1 border-b border-gray-200">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition -mb-px ${activeTab === tab.id ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">My Bookings</h2>
                <span className="text-sm text-gray-500">{bookings.length} booking{bookings.length !== 1 ? 's' : ''} total</span>
              </div>

              {loadingBookings ? (
                <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
                </div>
              ) : (
                (() => {
                  const now = new Date();
                  const upcoming = bookings.filter(b => b.status === 'Confirmed' && new Date(b.checkOutDate) >= now);
                  const checkedOut = bookings.filter(b => b.status === 'Confirmed' && new Date(b.checkOutDate) < now && !hiddenIds.has(b._id));
                  const cancelled = bookings.filter(b => b.status === 'Cancelled' && !hiddenIds.has(b._id));

                  const subTabs = [
                    { id: 'upcoming',   label: 'Upcoming',    count: upcoming.length,   icon: Clock,        activeColor: 'border-primary-600 text-primary-600',   inactiveColor: 'border-transparent text-gray-500 hover:text-gray-700' },
                    { id: 'checkedout', label: 'Checked Out', count: checkedOut.length,  icon: CheckCircle,  activeColor: 'border-green-600 text-green-600',         inactiveColor: 'border-transparent text-gray-500 hover:text-gray-700' },
                    { id: 'cancelled',  label: 'Cancelled',   count: cancelled.length,   icon: XCircle,      activeColor: 'border-red-500 text-red-500',             inactiveColor: 'border-transparent text-gray-500 hover:text-gray-700' },
                  ];

                  const activeList = bookingSubTab === 'upcoming' ? upcoming : bookingSubTab === 'checkedout' ? checkedOut : cancelled;

                  const BookingCard = ({ booking, colorScheme, showDelete, showCancel, showReview }) => {
                    const checkIn = new Date(booking.checkInDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                    const checkOut = new Date(booking.checkOutDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                    return (
                      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-all duration-300">
                        <div className={`h-1 w-full ${colorScheme.bar}`} />
                        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex gap-4 items-center flex-1">
                            <div className={`p-3 rounded-full shrink-0 ${colorScheme.iconBg}`}>
                              <colorScheme.Icon className={`w-6 h-6 ${colorScheme.iconColor}`} />
                            </div>
                            <div>
                              <h3 className="text-base font-bold text-gray-900">{booking.property?.name || 'Property'}</h3>
                              <p className="text-sm text-gray-500 mt-1 flex flex-wrap items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{checkIn}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                                <span>{checkOut}</span>
                                <span className="text-gray-300">·</span>
                                <span>{booking.guests} Guest{booking.guests > 1 ? 's' : ''}</span>
                              </p>
                              {booking.guestGstNumber && (
                                <p className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-1">
                                  <span className="font-semibold">GST:</span> {booking.guestGstNumber}
                                  {booking.guestCompanyName && <span className="ml-2"><span className="font-semibold">Company:</span> {booking.guestCompanyName}</span>}
                                </p>
                              )}
                              <p className="text-xs text-gray-400 mt-1 font-mono">Booking ID: #{booking._id?.slice(-8).toUpperCase()}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0 border-t sm:border-0 border-gray-100 pt-3 sm:pt-0">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${colorScheme.badge}`}>
                              {bookingSubTab === 'upcoming' ? 'Confirmed' : bookingSubTab === 'checkedout' ? 'Checked Out' : 'Cancelled'}
                            </span>
                            <span className="text-xl font-extrabold text-gray-900">₹{booking.totalAmount}</span>
                            {showCancel && (
                              <button
                                onClick={() => cancelBooking(booking._id)}
                                disabled={cancellingId === booking._id}
                                className="flex items-center gap-1.5 text-xs text-orange-500 hover:text-red-600 hover:bg-red-50 disabled:opacity-50 px-2 py-1 rounded-md border border-orange-200 hover:border-red-200 transition-colors mt-1"
                              >
                                {cancellingId === booking._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                                {cancellingId === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                              </button>
                            )}
                            {showReview && !reviewedBookingIds.has(booking._id) && (
                              <button
                                onClick={() => { setReviewingBooking(booking); setReviewForm({ rating: 0, comment: '' }); }}
                                className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-white hover:bg-primary-600 px-3 py-1.5 rounded-md border border-primary-200 hover:border-primary-600 transition-colors mt-1 font-semibold"
                              >
                                <Star className="w-3.5 h-3.5" />
                                Leave Review
                              </button>
                            )}
                            {showReview && reviewedBookingIds.has(booking._id) && (
                              <div className="flex items-center gap-1.5 text-xs text-green-600 px-2 py-1 mt-1 font-semibold bg-green-50 rounded-md">
                                <CheckCircle className="w-3.5 h-3.5" /> Reviewed
                              </div>
                            )}
                            {showDelete && (
                              <button
                                onClick={() => hideBooking(booking._id)}
                                title="Remove from history"
                                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 px-2 py-1 rounded-md transition-colors mt-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  };


                  const colorSchemes = {
                    upcoming:   { bar: 'bg-primary-600', iconBg: 'bg-blue-50',  iconColor: 'text-primary-600', badge: 'bg-blue-50 text-primary-700',  Icon: Clock },
                    checkedout: { bar: 'bg-green-500',   iconBg: 'bg-green-50', iconColor: 'text-green-600',   badge: 'bg-green-50 text-green-700',   Icon: CheckCircle },
                    cancelled:  { bar: 'bg-red-400',     iconBg: 'bg-red-50',   iconColor: 'text-red-500',     badge: 'bg-red-50 text-red-600',       Icon: XCircle },
                  };

                  return (
                    <>
                      {/* Sub-tab bar */}
                      <div className="flex gap-0 bg-white border border-gray-200 rounded-xl overflow-hidden mb-6 shadow-sm">
                        {subTabs.map(tab => (
                          <button
                            key={tab.id}
                            onClick={() => setBookingSubTab(tab.id)}
                            className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-4 text-sm font-semibold border-b-2 transition ${
                              bookingSubTab === tab.id ? tab.activeColor : tab.inactiveColor
                            } ${bookingSubTab === tab.id ? 'bg-gray-50' : 'bg-white'}`}
                          >
                            <tab.icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                            <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
                              bookingSubTab === tab.id
                                ? (tab.id === 'upcoming' ? 'bg-primary-600 text-white' : tab.id === 'checkedout' ? 'bg-green-600 text-white' : 'bg-red-500 text-white')
                                : 'bg-gray-100 text-gray-500'
                            }`}>{tab.count}</span>
                          </button>
                        ))}
                      </div>

                      {/* Booking list */}
                      {activeList.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                          {bookingSubTab === 'upcoming' && <Clock className="w-14 h-14 text-gray-200 mx-auto mb-4" />}
                          {bookingSubTab === 'checkedout' && <CheckCircle className="w-14 h-14 text-gray-200 mx-auto mb-4" />}
                          {bookingSubTab === 'cancelled' && <XCircle className="w-14 h-14 text-gray-200 mx-auto mb-4" />}
                          <h3 className="text-base font-semibold text-gray-900 mb-1">
                            {bookingSubTab === 'upcoming' && 'No upcoming trips'}
                            {bookingSubTab === 'checkedout' && 'No past stays yet'}
                            {bookingSubTab === 'cancelled' && 'No cancelled bookings'}
                          </h3>
                          <p className="text-sm text-gray-500 mb-5">
                            {bookingSubTab === 'upcoming' && 'Book a hotel or homestay to see your trips here.'}
                            {bookingSubTab === 'checkedout' && 'Your completed stays will appear here.'}
                            {bookingSubTab === 'cancelled' && "You haven't cancelled any bookings."}
                          </p>
                          {bookingSubTab === 'upcoming' && (
                            <button onClick={() => navigate('/properties')} className="bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition">
                              Explore Properties
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {activeList.map(booking => (
                            <BookingCard
                              key={booking._id}
                              booking={booking}
                              colorScheme={colorSchemes[bookingSubTab]}
                              showDelete={bookingSubTab !== 'upcoming'}
                              showCancel={bookingSubTab === 'upcoming'}
                              showReview={bookingSubTab === 'checkedout'}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-5">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 font-medium">{user?.name}</div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 font-medium">{user?.email}</div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Account Role</label>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 font-medium capitalize">{user?.role}</div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">User ID</label>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-400 font-mono text-sm">{user?.id}</div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-3">Security</h3>
                <button className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition">
                  Change Password
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Review Modal */}
      {reviewingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
            <button onClick={() => setReviewingBooking(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <XCircle className="w-6 h-6" />
            </button>
            <div className="p-6">
              <h2 className="text-xl font-extrabold text-gray-900 mb-1">Rate Your Stay</h2>
              <p className="text-sm text-gray-500 mb-6">How was your stay at {reviewingBooking.property?.name}?</p>
              
              <form onSubmit={submitReview}>
                <div className="flex justify-center gap-2 mb-6">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className="focus:outline-none"
                    >
                      <Star className={`w-10 h-10 transition-colors ${reviewForm.rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                    </button>
                  ))}
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Share your experience
                  </label>
                  <textarea
                    rows="4"
                    value={reviewForm.comment}
                    onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none"
                    placeholder="Tell us what you loved (or didn't) about this place..."
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition flex justify-center items-center"
                >
                  {submittingReview ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Review'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Dashboard;
