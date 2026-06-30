import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { useAuth } from '../context/AuthContext';
import {
  MapPin, Star, Check, Wifi, Coffee, Wind, Users,
  Dumbbell, Waves, Utensils, Car, Tv, ShieldCheck,
  ChevronLeft, ChevronRight, AlertCircle, Loader2, MessageSquare, PhoneCall, X
} from 'lucide-react';

const API_BASE = 'http://localhost:5001';

const AMENITY_ICONS = {
  'Free Wifi': Wifi, 'Wifi': Wifi,
  'AC': Wind, 'Air Conditioning': Wind,
  'Breakfast Included': Utensils, 'Breakfast': Utensils, 'Restaurant': Utensils,
  'Pool': Waves, 'Swimming Pool': Waves,
  'Gym': Dumbbell,
  'Spa': Coffee,
  'Parking': Car,
  'TV': Tv,
};

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [reviewsList, setReviewsList] = useState([]);

  const today = new Date().toISOString().split('T')[0];
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [dateError, setDateError] = useState('');

  const [availableRooms, setAvailableRooms] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [numberOfRooms, setNumberOfRooms] = useState(1);
  const [showCallModal, setShowCallModal] = useState(false);

  // ── Fetch real property from backend ──────────────────────────────────────
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/properties/${id}`);
        if (res.status === 404) { setNotFound(true); return; }
        const data = await res.json();
        setProperty(data);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/reviews/property/${id}`);
        if (res.ok) {
          const data = await res.json();
          setReviewsList(data);
        }
      } catch (err) {}
    };
    fetchProperty();
    fetchReviews();
  }, [id]);

  // ── Fetch availability ─────────────────────────────────────────────────────
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!checkIn || !checkOut || checkIn >= checkOut) {
        setAvailableRooms(null);
        setSelectedRoomId('');
        return;
      }
      setCheckingAvailability(true);
      try {
        const res = await fetch(`${API_BASE}/api/properties/${id}/availability?checkInDate=${checkIn}&checkOutDate=${checkOut}`);
        if (res.ok) {
          const data = await res.json();
          setAvailableRooms(data);
          if (data.length > 0 && !selectedRoomId) {
            const firstAvailable = data.find(r => r.availableInventory > 0) || data[0];
            setSelectedRoomId(firstAvailable._id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch availability', err);
      } finally {
        setCheckingAvailability(false);
      }
    };
    fetchAvailability();
  }, [id, checkIn, checkOut]);

  // ── Dynamic pricing ────────────────────────────────────────────────────────
  const nights = checkIn && checkOut
    ? Math.max(0, Math.round((new Date(checkOut) - new Date(checkIn)) / 86_400_000))
    : 0;

  const selectedRoom = availableRooms?.find(r => r._id === selectedRoomId);
  const pricePerNight = selectedRoom ? selectedRoom.price : (property?.platformPrice ?? property?.basePrice ?? 0);
  const taxes = Math.round(pricePerNight * numberOfRooms * nights * 0.12);
  const total = (pricePerNight * numberOfRooms * nights) + taxes;

  // ── Date validation ────────────────────────────────────────────────────────
  const handleCheckIn = (val) => {
    setCheckIn(val);
    if (checkOut && val >= checkOut) {
      setCheckOut('');
      setDateError('Check-out must be after check-in.');
    } else setDateError('');
  };

  const handleCheckOut = (val) => {
    if (checkIn && val <= checkIn) {
      setDateError('Check-out must be after check-in.');
      return;
    }
    setCheckOut(val);
    setDateError('');
  };

  // ── Reserve handler ────────────────────────────────────────────────────────
  const handleBook = () => {
    if (!user) { navigate('/login'); return; }
    if (!checkIn || !checkOut) { setDateError('Please select your check-in and check-out dates.'); return; }
    if (nights < 1) { setDateError('Minimum stay is 1 night.'); return; }
    if (!selectedRoomId) { setDateError('Please select a room type.'); return; }
    if (selectedRoom?.availableInventory === 0) { setDateError('Selected room is sold out for these dates.'); return; }
    
    navigate('/checkout', {
      state: {
        property: {
          _id: property._id,
          name: property.name,
          type: property.type,
          images: property.images,
          platformPrice: pricePerNight,
          location: property.location,
          rating: property.rating,
          reviews: property.reviews,
        },
        checkIn,
        checkOut,
        nights,
        guests: Number(guests),
        roomTypeId: selectedRoomId,
        roomTypeName: selectedRoom?.name,
        numberOfRooms: Number(numberOfRooms),
        pricePerNight,
        taxes,
        total,
      }
    });
  };

  // ── Loading / Not found states ─────────────────────────────────────────────
  if (loading) return (
    <MainLayout>
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
      </div>
    </MainLayout>
  );

  if (notFound || !property) return (
    <MainLayout>
      <div className="text-center py-24 max-w-md mx-auto px-4">
        <AlertCircle className="w-14 h-14 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Property not found</h2>
        <p className="text-gray-500 mb-6">This property may have been removed or the link is invalid.</p>
        <button onClick={() => navigate('/properties')} className="bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition">
          Browse Properties
        </button>
      </div>
    </MainLayout>
  );

  const images = property.images?.length ? property.images : ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-5">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="bg-primary-100 text-primary-800 text-xs font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">{property.type}</span>
            {property.rating && (
              <div className="flex items-center text-sm font-semibold text-gray-800">
                <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                {property.rating}
                <span className="text-gray-400 font-normal ml-1">({property.reviews ?? 0} reviews)</span>
              </div>
            )}
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">{property.name}</h1>
          <p className="text-gray-500 mt-1 flex items-center gap-1">
            <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
            {property.location?.address}, {property.location?.city}
          </p>
        </div>

        {/* Image Gallery */}
        <div className="relative rounded-xl overflow-hidden mb-8 bg-gray-100 h-[380px] sm:h-[480px]">
          <img src={images[activeImg]} alt={property.name} className="w-full h-full object-cover" />
          {images.length > 1 && (
            <>
              <button onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow transition">
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <button onClick={() => setActiveImg(i => (i + 1) % images.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow transition">
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`w-2 h-2 rounded-full transition ${i === activeImg ? 'bg-white' : 'bg-white/50'}`} />
                ))}
              </div>
            </>
          )}
        </div>
        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button key={i} onClick={() => setActiveImg(i)}
                className={`shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition ${i === activeImg ? 'border-primary-600' : 'border-transparent'}`}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Main Content + Booking Widget */}
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Left */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">About this property</h2>
            <p className="text-gray-600 leading-relaxed mb-8">{property.description}</p>

            {property.amenities?.length > 0 && (
              <>
                <h3 className="text-xl font-bold text-gray-900 mb-4">What's included</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                  {property.amenities.map((item, idx) => {
                    const Icon = AMENITY_ICONS[item] ?? Check;
                    return (
                      <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-gray-700 text-sm">
                        <Icon className="w-4 h-4 text-primary-600 shrink-0" />
                        {item}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Policies */}
            <h3 className="text-xl font-bold text-gray-900 mb-4">Property Policies</h3>
            <div className="bg-gray-50 rounded-xl p-5 space-y-2 text-sm text-gray-600 border border-gray-100">
              <p><span className="font-semibold text-gray-800">Check-in:</span> 2:00 PM onwards</p>
              <p><span className="font-semibold text-gray-800">Check-out:</span> Before 11:00 AM</p>
              <p><span className="font-semibold text-gray-800">Cancellation:</span> Free cancellation within 48 hours of booking</p>
              <p><span className="font-semibold text-gray-800">Pets:</span> Not allowed</p>
              <p><span className="font-semibold text-gray-800">Smoking:</span> Not allowed indoors</p>
            </div>

            {/* Guest Reviews Section */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                Guest Reviews
                <span className="text-gray-400 font-normal text-base ml-2">({reviewsList.length} reviews)</span>
              </h2>

              {reviewsList.length > 0 ? (
                <div className="space-y-6">
                  {reviewsList.map(review => (
                    <div key={review._id} className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold uppercase">
                            {review.user?.name ? review.user.name.charAt(0) : '?'}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{review.user?.name || 'Anonymous Guest'}</p>
                            <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</p>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star key={star} className={`w-3.5 h-3.5 ${review.rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-gray-600 text-sm leading-relaxed mt-2">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-10 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-900 font-bold">No reviews yet</p>
                  <p className="text-gray-500 text-sm mt-1">Be the first to review this property after your stay.</p>
                </div>
              )}
            </div>

          </div>

          {/* Booking Widget */}
          <aside className="w-full lg:w-[380px] shrink-0">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xl sticky top-24">

              {/* Price */}
              <div className="flex justify-between items-end mb-5">
                <div>
                  <span className="text-3xl font-extrabold text-gray-900">₹{pricePerNight.toLocaleString('en-IN')}</span>
                  <span className="text-gray-500 text-sm"> / night</span>
                </div>
                <span className="text-xs border border-green-200 bg-green-50 text-green-700 px-2 py-1 rounded font-semibold">Best Price</span>
              </div>

              {/* Date Picker */}
              <div className="border border-gray-300 rounded-xl overflow-hidden mb-3">
                <div className="grid grid-cols-2 divide-x divide-gray-300">
                  <div className="p-3">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Check-in</label>
                    <input type="date" min={today} value={checkIn}
                      onChange={e => handleCheckIn(e.target.value)}
                      className="w-full text-sm font-semibold text-gray-900 outline-none bg-transparent cursor-pointer" />
                  </div>
                  <div className="p-3">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Check-out</label>
                    <input type="date" min={checkIn || today} value={checkOut}
                      onChange={e => handleCheckOut(e.target.value)}
                      className="w-full text-sm font-semibold text-gray-900 outline-none bg-transparent cursor-pointer" />
                  </div>
                </div>
                <div className="border-t border-gray-300 p-3">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Guests</label>
                  <select value={guests} onChange={e => setGuests(e.target.value)}
                    className="w-full text-sm font-semibold text-gray-900 outline-none bg-transparent cursor-pointer">
                    {[1,2,3,4,5,6].map(g => <option key={g} value={g}>{g} Guest{g > 1 ? 's' : ''}</option>)}
                  </select>
                </div>
              </div>

              {dateError && (
                <div className="flex items-center gap-2 text-red-600 text-xs mb-3 bg-red-50 p-2.5 rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {dateError}
                </div>
              )}

              {/* Room Selection */}
              {checkingAvailability ? (
                <div className="py-4 flex justify-center items-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
                  <span className="ml-2 text-sm text-gray-500">Checking rooms...</span>
                </div>
              ) : availableRooms && availableRooms.length > 0 ? (
                <div className="mb-5 space-y-3">
                  <label className="block text-sm font-bold text-gray-900 mb-2">Select Room Type</label>
                  {availableRooms.map(room => {
                    const isSelected = selectedRoomId === room._id;
                    const isSoldOut = room.availableInventory === 0;
                    return (
                      <div key={room._id} 
                        onClick={() => { if (!isSoldOut) { setSelectedRoomId(room._id); setNumberOfRooms(1); } }}
                        className={`p-3 border rounded-xl transition ${isSoldOut ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200' : isSelected ? 'border-primary-600 bg-primary-50 cursor-pointer' : 'border-gray-200 bg-white hover:border-gray-300 cursor-pointer'}`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-gray-900 text-sm">{room.name}</span>
                          <span className="font-bold text-primary-700 text-sm">₹{room.price} <span className="text-xs font-normal text-gray-500">/ night</span></span>
                        </div>
                        <div className="flex justify-between items-end">
                          <div className="text-xs text-gray-500 space-y-0.5">
                            <p>Up to {room.capacity} guests</p>
                            <p className={isSoldOut ? "text-red-600 font-bold" : room.availableInventory < 3 ? "text-red-600 font-semibold" : "text-green-600"}>
                              {isSoldOut ? "0 left (Sold out)" : `${room.availableInventory} left`}
                            </p>
                          </div>
                          {isSelected && !isSoldOut && (
                            <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                              <label className="text-xs font-semibold text-gray-500 uppercase">Rooms</label>
                              <select value={numberOfRooms} onChange={e => setNumberOfRooms(Number(e.target.value))}
                                className="text-sm font-semibold text-gray-900 border border-gray-300 rounded p-1 outline-none bg-white">
                                {Array.from({ length: room.availableInventory }, (_, i) => i + 1).map(n => (
                                  <option key={n} value={n}>{n}</option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (checkIn && checkOut && !checkingAvailability) ? (
                <div className="text-center text-sm text-red-600 font-semibold mb-5 py-3 bg-red-50 rounded-lg">
                  No rooms available for selected dates.
                </div>
              ) : null}

              {/* Price Breakdown */}
              {nights > 0 && selectedRoomId ? (
                <div className="space-y-2 mb-5 text-sm">
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
                    <span>Total</span>
                    <span>₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center text-sm text-gray-400 mb-5 py-3 bg-gray-50 rounded-lg">
                  Select dates and room to see total price
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={handleBook}
                  className="flex-1 bg-primary-600 text-white py-3.5 rounded-xl font-bold text-base hover:bg-primary-700 active:scale-[0.98] transition shadow-md">
                  {user ? 'Reserve Now' : 'Log in to Book'}
                </button>
                <button onClick={() => setShowCallModal(true)}
                  title="Call to Enquire"
                  className="w-[52px] h-[52px] flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl hover:bg-emerald-100 hover:text-emerald-700 transition">
                  <PhoneCall className="w-5 h-5" />
                </button>
              </div>
              <p className="text-center text-xs text-gray-400 mt-3">
                {user ? "You won't be charged yet" : 'Create a free account to make a reservation'}
              </p>

              {/* Trust badge */}
              <div className="mt-5 bg-gray-50 rounded-xl p-4 flex items-start gap-3 border border-gray-100">
                <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600">Protected by <span className="font-bold text-gray-900">StayHub Guarantee</span>. Secure booking, no hidden charges.</p>
              </div>
            </div>
          </aside>

        </div>
      </div>

      {/* Call to Enquire Modal */}
      {showCallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={(e) => e.target === e.currentTarget && setShowCallModal(false)}>
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setShowCallModal(false)} className="absolute top-4 right-4 p-1.5 text-gray-400 hover:bg-gray-100 rounded-xl transition">
              <X className="w-5 h-5" />
            </button>
            
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-emerald-50">
              <PhoneCall className="w-7 h-7 text-emerald-600" />
            </div>
            
            <h3 className="text-xl font-extrabold text-gray-900 text-center mb-2">Call to Enquire</h3>
            <p className="text-gray-500 text-sm text-center mb-6">Call our StayHub support team and quote the Property ID below to book this property directly over the phone.</p>
            
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center mb-6">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">StayHub Support</p>
              <a href="tel:+9118001234567" className="block text-2xl font-black text-emerald-600 hover:text-emerald-700 transition mb-3">+91 1800-123-4567</a>
              
              <div className="h-px w-full bg-gray-200 my-3"></div>
              
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Property ID</p>
              <p className="font-mono text-xl font-bold text-gray-900 tracking-wider">#{property._id.slice(-6).toUpperCase()}</p>
            </div>
            
            <button onClick={() => setShowCallModal(false)} className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition">
              Close
            </button>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default PropertyDetails;
