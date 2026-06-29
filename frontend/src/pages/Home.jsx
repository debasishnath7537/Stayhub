import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { Search, MapPin, Star, Navigation, X } from 'lucide-react';

const API_BASE = 'http://localhost:5001';

const Home = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [cities, setCities] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [locating, setLocating] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/properties`);
        const data = await res.json();
        setProperties(data);
      } catch (err) {
        console.error('Failed to fetch properties:', err);
      } finally {
        setLoading(false);
      }
    };
    const fetchCities = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/properties/cities`);
        const data = await res.json();
        setCities(data);
      } catch {}
    };
    fetchProperties();
    fetchCities();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
          inputRef.current && !inputRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInput = (val) => {
    setQuery(val);
    if (val.trim().length < 1) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    const re = new RegExp(val, 'i');
    const matched = cities.filter(c => re.test(c));
    setSuggestions(matched);
    setShowDropdown(true);
  };

  const handleSearch = (searchQuery = query) => {
    const q = searchQuery.trim();
    if (!q) { navigate('/properties'); return; }
    setShowDropdown(false);
    navigate(`/properties?search=${encodeURIComponent(q)}`);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported by your browser.');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        navigate(`/properties?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}&nearme=1`);
      },
      () => { setLocating(false); alert('Could not get your location. Please allow location access.'); }
    );
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="relative bg-primary-700 overflow-hidden">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover opacity-30"
            src="https://images.unsplash.com/photo-1542314831-c6a4d14d8349?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            alt="Luxury Hotel"
          />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Book Your Perfect Stay
          </h1>
          <p className="mt-6 text-xl text-primary-100 max-w-3xl mx-auto">
            Discover premium hotels and authentic homestays at unbeatable prices. Experience the difference with StayHub.
          </p>

          {/* Smart Search Bar */}
          <div className="mt-10 max-w-2xl mx-auto relative">
            <div className="bg-white rounded-2xl shadow-2xl p-2 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-500 shrink-0 ml-2" />
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => handleInput(e.target.value)}
                  onFocus={() => query.length > 0 && suggestions.length > 0 && setShowDropdown(true)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by city, area or property name..."
                  className="w-full border-0 focus:ring-0 text-gray-900 placeholder-gray-400 h-12 outline-none bg-transparent text-base"
                />
                {query && (
                  <button onClick={() => { setQuery(''); setSuggestions([]); setShowDropdown(false); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                onClick={handleUseMyLocation}
                disabled={locating}
                title="Use my current location"
                className="flex items-center gap-1.5 text-primary-600 hover:text-primary-800 font-semibold text-sm px-3 py-2 rounded-lg hover:bg-primary-50 transition shrink-0 disabled:opacity-50"
              >
                <Navigation className="w-4 h-4" />
                <span className="hidden sm:inline">{locating ? 'Locating...' : 'Near Me'}</span>
              </button>
              <button
                onClick={() => handleSearch()}
                className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-3 rounded-xl transition font-bold flex items-center gap-2 shrink-0"
              >
                <Search className="h-5 w-5" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>

            {/* Autocomplete Dropdown */}
            {showDropdown && suggestions.length > 0 && (
              <div ref={dropdownRef} className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-2xl mt-2 z-50 overflow-hidden">
                <p className="text-xs text-gray-400 px-4 pt-3 pb-1 uppercase tracking-wider font-semibold">Matching Locations</p>
                {suggestions.map(city => (
                  <button
                    key={city}
                    onClick={() => { setQuery(city); handleSearch(city); }}
                    className="flex items-center gap-3 w-full px-4 py-3 hover:bg-primary-50 text-left transition"
                  >
                    <MapPin className="w-4 h-4 text-primary-500 shrink-0" />
                    <span className="text-gray-900 font-medium">{city}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <p className="mt-4 text-primary-200 text-sm">
            Popular:&nbsp;
            {['Goa', 'Mumbai', 'Delhi', 'Manali'].map(city => (
              <button
                key={city}
                onClick={() => handleSearch(city)}
                className="underline hover:text-white transition mr-2"
              >
                {city}
              </button>
            ))}
          </p>
        </div>
      </div>

      {/* Featured Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Featured Properties</h2>
          <p className="mt-4 text-gray-500">Curated specifically for you</p>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm animate-pulse">
                  <div className="h-56 bg-gray-200"></div>
                  <div className="p-5">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                    <div className="flex justify-between">
                      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : properties.length > 0 ? (
              properties.map(property => (
                <div
                  key={property._id}
                  className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
                  onClick={() => navigate(`/property/${property._id}`)}
                >
                  <div className="h-56 overflow-hidden relative">
                    <img
                      src={property.images && property.images.length > 0 ? property.images[0] : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'}
                      alt={property.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-gray-900 text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                      {property.type}
                    </div>
                    {property.rating && (
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-gray-900 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" /> {property.rating}
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-extrabold text-gray-900 line-clamp-1">{property.name}</h3>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1 mb-4">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{property.location?.city || property.location?.address}</span>
                    </p>
                    <div className="mt-auto flex justify-between items-end pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-400 font-medium mb-0.5">Starts from</p>
                        <p className="text-xl font-extrabold text-primary-600">
                          ₹{(property.platformPrice || property.basePrice).toLocaleString('en-IN')}
                          <span className="text-xs text-gray-500 font-normal ml-1">/ night</span>
                        </p>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); navigate(`/property/${property._id}`); }}
                        className="px-4 py-2 bg-primary-50 text-primary-700 font-bold rounded-lg group-hover:bg-primary-600 group-hover:text-white transition-colors text-sm"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-gray-500 py-10">No properties available right now.</div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Home;
