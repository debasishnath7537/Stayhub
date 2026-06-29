import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Building, CreditCard, ShieldCheck, Star, Calendar,
  Users, Loader2, AlertCircle, Smartphone, IndianRupee
} from 'lucide-react';

const API_BASE = 'http://localhost:5001';

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) { resolve(true); return; }
    const s = document.createElement('script');
    s.id = 'razorpay-script';
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const state = location.state;

  if (!state?.property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No booking details</h2>
          <p className="text-gray-500 mb-4">Please select a property first.</p>
          <Link to="/properties" className="bg-primary-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition">
            Browse Properties
          </Link>
        </div>
      </div>
    );
  }

  const { property, checkIn, checkOut, nights, guests, roomTypeId, roomTypeName, numberOfRooms = 1, pricePerNight, taxes, total } = state;

  const [paymentMethod, setPaymentMethod] = useState('payNow');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [gstDetails, setGstDetails] = useState({
    gstNumber: '',
    companyName: ''
  });

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  /* ── Save booking to backend after payment ──────────────────────────────── */
  const saveBooking = async (paymentDetails) => {
    const res = await fetch(`${API_BASE}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
      body: JSON.stringify({
        property: property._id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guests,
        roomTypeId,
        numberOfRooms,
        totalAmount: total,
        paymentDetails,
        guestGstNumber: gstDetails.gstNumber || undefined,
        guestCompanyName: gstDetails.companyName || undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || 'Booking failed');
    return data;
  };

  /* ── Pay at Hotel flow ───────────────────────────────────────────────────── */
  const handlePayAtHotel = async () => {
    setLoading(true);
    setError('');
    try {
      await saveBooking({ method: 'PayAtHotel', transactionId: null });
      navigate('/dashboard', { state: { bookingSuccess: true } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── Razorpay Pay Now flow ───────────────────────────────────────────────── */
  const handleRazorpay = async () => {
    setLoading(true);
    setError('');

    // 1. Load Razorpay checkout.js
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setError('Failed to load Razorpay. Please check your internet connection.');
      setLoading(false);
      return;
    }

    // 2. Create order on backend
    let orderData;
    try {
      const res = await fetch(`${API_BASE}/api/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ amount: total }),
      });
      orderData = await res.json();
      if (!res.ok) throw new Error(orderData.msg || 'Could not create payment order');
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    // 3. Open Razorpay modal
    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'StayHub',
      description: `Booking: ${property.name}`,
      image: 'https://i.ibb.co/VVHhKk/stayhub-logo.png', // optional logo
      order_id: orderData.orderId,
      prefill: {
        name: user?.name || '',
        email: user?.email || '',
      },
      theme: { color: '#4f46e5' },
      handler: async (response) => {
        // 4. Verify signature on backend
        try {
          const verifyRes = await fetch(`${API_BASE}/api/payments/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (!verifyRes.ok || !verifyData.verified) throw new Error('Payment verification failed');

          // 5. Save booking
          await saveBooking({
            method: 'Razorpay',
            transactionId: response.razorpay_payment_id,
          });

          navigate('/dashboard', { state: { bookingSuccess: true } });
        } catch (err) {
          setError(err.message || 'Payment verified but booking could not be saved. Please contact support.');
          setLoading(false);
        }
      },
      modal: {
        ondismiss: () => {
          setLoading(false);
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (response) => {
      setError(`Payment failed: ${response.error.description}`);
      setLoading(false);
    });
    rzp.open();
    // Note: we don't setLoading(false) here — modal keeps open until handler/dismiss
  };

  /* ── Confirm dispatcher ──────────────────────────────────────────────────── */
  const handleConfirm = () => {
    if (!token) { navigate('/login'); return; }
    if (paymentMethod === 'payNow') {
      handleRazorpay();
    } else {
      handlePayAtHotel();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 py-4 px-4 sm:px-6 lg:px-8 shrink-0 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Building className="h-6 w-6 text-primary-600" />
            <span className="text-xl font-bold text-gray-900 tracking-tight">StayHub</span>
          </Link>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            Secure Checkout
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8">
          <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1">
            ← Back to property
          </button>
          <h1 className="text-3xl font-extrabold text-gray-900">Confirm and Pay</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">

          {/* Left column */}
          <div className="flex-1 space-y-8">

            {/* Trip summary */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Your trip</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Dates</p>
                    <p className="text-gray-500">{formatDate(checkIn)} → {formatDate(checkOut)}</p>
                    <p className="text-gray-400 text-xs">{nights} night{nights > 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Room</p>
                    <p className="text-gray-500">{roomTypeName || 'Standard Room'}</p>
                    <p className="text-gray-400 text-xs">{numberOfRooms} room{numberOfRooms > 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Guests</p>
                    <p className="text-gray-500">{guests} Guest{guests > 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Payment options */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Pay with</h2>
              <div className="space-y-3">

                {/* Razorpay — Pay Now */}
                <label
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${paymentMethod === 'payNow' ? 'border-primary-600 bg-primary-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                  <input type="radio" name="payment" value="payNow" checked={paymentMethod === 'payNow'}
                    onChange={() => setPaymentMethod('payNow')} className="mt-1 accent-primary-600" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CreditCard className={`w-5 h-5 ${paymentMethod === 'payNow' ? 'text-primary-600' : 'text-gray-500'}`} />
                      <span className="font-semibold text-gray-900 text-sm">Pay Now (Credit / Debit / UPI)</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">Secure payment via Razorpay — instant booking confirmation</p>
                    {/* Razorpay payment icons */}
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {['Visa', 'Mastercard', 'UPI', 'NetBanking', 'Wallets'].map(m => (
                        <span key={m} className="text-[10px] font-semibold bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded">
                          {m}
                        </span>
                      ))}
                      <div className="flex items-center gap-1 text-[10px] text-green-600 font-semibold">
                        <ShieldCheck className="w-3 h-3" /> 256-bit SSL
                      </div>
                    </div>
                  </div>
                </label>

                {/* Pay at Hotel */}
                <label
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${paymentMethod === 'payAtHotel' ? 'border-primary-600 bg-primary-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                  <input type="radio" name="payment" value="payAtHotel" checked={paymentMethod === 'payAtHotel'}
                    onChange={() => setPaymentMethod('payAtHotel')} className="mt-1 accent-primary-600" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Building className={`w-5 h-5 ${paymentMethod === 'payAtHotel' ? 'text-primary-600' : 'text-gray-500'}`} />
                      <span className="font-semibold text-gray-900 text-sm">Pay at Property</span>
                    </div>
                    <p className="text-xs text-gray-500">Pay when you arrive. Booking subject to final confirmation.</p>
                  </div>
                </label>
              </div>
            </section>

            {/* Cancellation policy */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Cancellation policy</h2>
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">Free cancellation for 48 hours.</span>{' '}
                Cancel before check-in for a partial refund. Cancellations can be done from your dashboard.
              </p>
            </section>

            {/* GST Details */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">GST Details (Optional)</h2>
              <p className="text-sm text-gray-500 mb-4">Enter your GST details to claim input tax credit for business travel.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="gstNumber" className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                  <input
                    type="text"
                    id="gstNumber"
                    value={gstDetails.gstNumber}
                    onChange={(e) => setGstDetails({ ...gstDetails, gstNumber: e.target.value })}
                    placeholder="e.g. 29ABCDE1234F1Z5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                  />
                </div>
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    id="companyName"
                    value={gstDetails.companyName}
                    onChange={(e) => setGstDetails({ ...gstDetails, companyName: e.target.value })}
                    placeholder="e.g. Acme Corp"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                  />
                </div>
              </div>
            </section>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /> <span>{error}</span>
              </div>
            )}

            {/* Confirm button */}
            <button onClick={handleConfirm} disabled={loading}
              className="w-full bg-primary-600 text-white font-bold text-lg px-8 py-4 rounded-xl hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 shadow-md">
              {loading
                ? <><Loader2 className="w-5 h-5 animate-spin" /> {paymentMethod === 'payNow' ? 'Opening Payment...' : 'Processing...'}</>
                : paymentMethod === 'payNow'
                  ? <>Pay ₹{total.toLocaleString('en-IN')} via Razorpay</>
                  : <>Confirm Booking • ₹{total.toLocaleString('en-IN')}</>
              }
            </button>
            <p className="text-xs text-center text-gray-400">
              By confirming, you agree to StayHub's Terms of Service and Cancellation Policy.
            </p>
          </div>

          {/* Right — property summary card */}
          <aside className="w-full lg:w-[360px] shrink-0">
            <div className="border border-gray-200 rounded-2xl p-6 bg-white sticky top-8 shadow-sm space-y-5">

              <div className="flex gap-4 pb-5 border-b border-gray-100">
                <img
                  src={property.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=200&q=80'}
                  alt={property.name} className="w-24 h-20 object-cover rounded-xl shrink-0" />
                <div>
                  <span className="text-xs text-gray-400 uppercase font-semibold">{property.type}</span>
                  <h3 className="font-bold text-gray-900 text-sm leading-snug mt-0.5">{property.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{property.location?.city}</p>
                  {property.rating && (
                    <div className="flex items-center text-xs text-gray-700 mt-1 font-semibold">
                      <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                      {property.rating}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-gray-900 mb-3">Price details</h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>₹{pricePerNight.toLocaleString('en-IN')} × {numberOfRooms} room{numberOfRooms > 1 ? 's' : ''} × {nights} night{nights > 1 ? 's' : ''}</span>
                    <span>₹{(pricePerNight * numberOfRooms * nights).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Taxes & fees (12%)</span>
                    <span>₹{taxes.toLocaleString('en-IN')}</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between font-bold text-gray-900 text-base">
                    <span>Total (INR)</span>
                    <span>₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl flex items-start gap-3 border border-gray-100">
                <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600">
                  <span className="font-bold text-gray-900">StayHub Guarantee</span> — Secure booking, verified properties & 24/7 support.
                </p>
              </div>
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
};

export default Checkout;
