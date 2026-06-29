import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { Filter, Star, MapPin, Loader2, Building, Navigation, ExternalLink, X, Search } from 'lucide-react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:5001';

// Haversine formula
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Reusable Property Card component
const PropertyCard = ({ property, userCoords, googleMapsLink, dimmed = false }) => (
  <div className={`bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row group ${dimmed ? 'opacity-90 hover:opacity-100' : ''}`}>
    {/* Image */}
    <div className="sm:w-72 h-52 sm:h-auto shrink-0 relative overflow-hidden">
      <img
        src={property.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'}
        alt={property.name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute top-3 left-3 bg-white px-2 py-1 text-xs font-bold rounded shadow text-gray-900 uppercase tracking-widest">
        {property.type}
      </div>
      {/* Distance badge on image */}
      {property._distKm != null && (
        <div className="absolute bottom-3 left-3 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow">
          <Navigation className="w-3 h-3" />
          {property._distKm < 1
            ? `${Math.round(property._distKm * 1000)} m away`
            : `${property._distKm.toFixed(1)} km away`}
        </div>
      )}
    </div>

    {/* Details */}
    <div className="p-5 flex-1 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start gap-2">
          <h2 className="text-xl font-bold text-gray-900 leading-snug">{property.name}</h2>
          {property.rating && (
            <div className="flex items-center bg-green-50 px-2 py-1 rounded text-green-700 text-sm font-semibold shrink-0">
              <Star className="w-4 h-4 mr-1 fill-current" />
              {property.rating} <span className="font-normal text-green-600 ml-1">({property.reviews ?? 0})</span>
            </div>
          )}
        </div>

        <div className="mt-2 space-y-1">
          <div className="flex items-center text-gray-500 text-sm gap-1">
            <MapPin className="w-4 h-4 shrink-0 text-gray-400" />
            <span>{property.location?.address ? `${property.location.address}, ` : ''}{property.location?.city}</span>
          </div>
          {property.location?.coordinates?.lat && (
            <p className="text-xs text-gray-400 pl-5">
              {property.location.coordinates.lat.toFixed(4)}°N, {property.location.coordinates.lng.toFixed(4)}°E
            </p>
          )}
        </div>

        {property.amenities?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {property.amenities.slice(0, 4).map((a, i) => (
              <span key={i} className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md">{a}</span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap justify-between items-end border-t border-gray-100 pt-4 gap-3">
        <div>
          <p className="text-sm text-gray-400 line-through">₹{(property.platformPrice + 500).toLocaleString('en-IN')}</p>
          <p className="text-2xl font-bold text-gray-900">
            ₹{property.platformPrice?.toLocaleString('en-IN')}
            <span className="text-sm font-normal text-gray-500"> / night</span>
          </p>
          <p className="text-xs text-green-600 font-medium">Includes taxes & fees</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={googleMapsLink(property)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 border border-blue-300 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-xs font-semibold transition"
          >
            <Navigation className="w-3.5 h-3.5" /> Directions
          </a>
          <Link to={`/property/${property._id}`} className="bg-primary-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-primary-700 transition text-sm">
            View Details
          </Link>
        </div>
      </div>
    </div>
  </div>
);

const Properties = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const filterType = searchParams.get('type') || 'All';
  const searchQuery = searchParams.get('search') || '';
  const nearMe = searchParams.get('nearme') === '1';
  const urlLat = parseFloat(searchParams.get('lat'));
  const urlLng = parseFloat(searchParams.get('lng'));

  const setFilterType = (type) => {
    const next = new URLSearchParams(searchParams);
    if (type === 'All') next.delete('type'); else next.set('type', type);
    setSearchParams(next);
  };

  const [sortBy, setSortBy] = useState(nearMe ? 'Distance: Near to Far' : 'Recommended');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userCoords, setUserCoords] = useState(
    !isNaN(urlLat) && !isNaN(urlLng) ? { lat: urlLat, lng: urlLng } : null
  );
  const [gpsLoading, setGpsLoading] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    if (nearMe && !userCoords && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, [nearMe]);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filterType !== 'All') params.set('type', filterType);
        if (searchQuery) params.set('search', searchQuery);
        const res = await fetch(`${API_BASE}/api/properties?${params}`);
        const data = await res.json();
        if (res.ok) setProperties(data);
      } catch (err) {
        console.error('Failed to fetch properties:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [filterType, searchQuery]);

  const propertiesWithDist = properties.map(p => {
    const lat = p.location?.coordinates?.lat;
    const lng = p.location?.coordinates?.lng;
    if (userCoords && lat != null && lng != null) {
      return { ...p, _distKm: haversineKm(userCoords.lat, userCoords.lng, lat, lng) };
    }
    return { ...p, _distKm: null };
  });

  const sorted = [...propertiesWithDist].sort((a, b) => {
    if (sortBy === 'Price: Low to High') return (a.platformPrice ?? 0) - (b.platformPrice ?? 0);
    if (sortBy === 'Price: High to Low') return (b.platformPrice ?? 0) - (a.platformPrice ?? 0);
    if (sortBy === 'Rating: High to Low') return (b.rating ?? 0) - (a.rating ?? 0);
    if (sortBy === 'Distance: Near to Far') {
      if (a._distKm == null && b._distKm == null) return 0;
      if (a._distKm == null) return 1;
      if (b._distKm == null) return -1;
      return a._distKm - b._distKm;
    }
    return 0;
  });

  const exactMatches = searchQuery
    ? sorted.filter(p => new RegExp(searchQuery, 'i').test(p.location?.city))
    : sorted;
  const suggestions = searchQuery
    ? sorted.filter(p => !new RegExp(searchQuery, 'i').test(p.location?.city))
    : [];

  const requestGPS = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported.');
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => { setGpsLoading(false); setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setSortBy('Distance: Near to Far'); },
      () => { setGpsLoading(false); alert('Could not get location. Please allow location access.'); }
    );
  };

  const handleLocalSearch = () => {
    const next = new URLSearchParams(searchParams);
    if (localSearch.trim()) next.set('search', localSearch.trim()); else next.delete('search');
    setSearchParams(next);
  };

  const googleMapsLink = (property) => {
    const lat = property.location?.coordinates?.lat;
    const lng = property.location?.coordinates?.lng;
    if (lat != null && lng != null) {
      if (userCoords) {
        return `https://www.google.com/maps/dir/${userCoords.lat},${userCoords.lng}/${lat},${lng}`;
      }
      return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    }
    const addr = encodeURIComponent(`${property.name} ${property.location?.city}`);
    return `https://www.google.com/maps/search/?api=1&query=${addr}`;
  };

  return (
    <MainLayout>
      <div className="bg-primary-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white">
            {searchQuery
              ? `Results for "${searchQuery}"`
              : nearMe ? 'Properties Near You'
              : `Find Your Perfect ${filterType === 'All' ? 'Stay' : filterType}`}
          </h1>
          <p className="mt-2 text-primary-100">Handpicked properties at the best prices.</p>

          <div className="mt-5 max-w-xl flex gap-2">
            <input
              type="text"
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLocalSearch()}
              placeholder="Search city, area or name..."
              className="flex-1 bg-white/10 text-white placeholder-primary-200 border border-white/30 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white/20"
            />
            <button onClick={handleLocalSearch} className="bg-white text-primary-700 font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-primary-50 transition text-sm">
              <Search className="w-4 h-4" /> Search
            </button>
            {searchQuery && (
              <button onClick={() => { setLocalSearch(''); const next = new URLSearchParams(searchParams); next.delete('search'); setSearchParams(next); }} className="bg-white/10 text-white px-3 py-2.5 rounded-xl hover:bg-white/20 transition" title="Clear search">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24 space-y-6">
            <div className="flex items-center gap-2 font-semibold text-gray-900 pb-4 border-b">
              <Filter className="w-5 h-5 text-primary-600" />
              <span>Filters</span>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Property Type</h3>
              <div className="space-y-2">
                {['All', 'Hotel', 'Homestay'].map(type => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="propertyType" value={type} checked={filterType === type}
                      onChange={e => setFilterType(e.target.value)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300" />
                    <span className="text-sm text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">My Location</h3>
              {userCoords ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2 font-semibold">
                    <Navigation className="w-3.5 h-3.5" />
                    Location detected
                  </div>
                  <button onClick={() => { setUserCoords(null); setSortBy('Recommended'); }} className="text-xs text-red-500 hover:underline">
                    Remove location
                  </button>
                </div>
              ) : (
                <button onClick={requestGPS} disabled={gpsLoading}
                  className="w-full flex items-center justify-center gap-2 bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-200 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50">
                  <Navigation className="w-4 h-4" />
                  {gpsLoading ? 'Locating...' : 'Use My Location'}
                </button>
              )}
              {userCoords && <p className="text-xs text-gray-400 mt-2">Distances shown on each property card.</p>}
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
            <p className="text-gray-600">
              Showing <span className="font-semibold text-gray-900">{exactMatches.length}</span> result{exactMatches.length !== 1 ? 's' : ''}
              {searchQuery && <span> in <span className="font-semibold text-primary-600">"{searchQuery}"</span></span>}
              {suggestions.length > 0 && <span className="text-gray-400"> & {suggestions.length} nearby</span>}
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Sort by:</span>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm py-1.5">
                <option>Recommended</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Rating: High to Low</option>
                {userCoords && <option>Distance: Near to Far</option>}
              </select>
            </div>
          </div>

          {userCoords && (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-6 text-sm text-blue-700 font-medium">
              <Navigation className="w-4 h-4 shrink-0" />
              Distances calculated from your current location. Click "Directions" for turn-by-turn navigation.
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
            </div>
          ) : exactMatches.length === 0 && suggestions.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
              <Building className="w-14 h-14 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties found</h3>
              <p className="text-gray-500">Try a different search term or remove filters.</p>
              <button onClick={() => { setLocalSearch(''); const next = new URLSearchParams(); setSearchParams(next); }} className="mt-4 text-primary-600 font-semibold text-sm underline">
                Clear all filters
              </button>
            </div>
          ) : (
            <div>
              <div className="space-y-6">
                {exactMatches.map((property) => (
                  <PropertyCard key={property._id} property={property} userCoords={userCoords} googleMapsLink={googleMapsLink} />
                ))}
              </div>

              {suggestions.length > 0 && (
                <div className="mt-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-sm font-semibold text-gray-500 flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-full border border-gray-200 whitespace-nowrap">
                      <MapPin className="w-3.5 h-3.5" /> You might also like
                    </span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                  <p className="text-sm text-center text-gray-400 mb-6">Other properties near your search area</p>
                  <div className="space-y-6 opacity-90">
                    {suggestions.map((property) => (
                      <PropertyCard key={property._id} property={property} userCoords={userCoords} googleMapsLink={googleMapsLink} dimmed />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Properties;
