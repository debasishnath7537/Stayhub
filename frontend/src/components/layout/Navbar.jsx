import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building, LogIn, Menu, X, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Building className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900 tracking-tight">StayHub</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/properties?type=Hotel" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Hotels</Link>
            <Link to="/properties?type=Homestay" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Homestays</Link>
            
            <div className="flex space-x-4 border-l border-gray-200 pl-8">
              <Link to="/partner?type=Hotel" className="text-primary-600 hover:text-primary-800 font-semibold transition-colors">Register your Hotel</Link>
              <Link to="/partner?type=Homestay" className="text-primary-600 hover:text-primary-800 font-semibold transition-colors">Register your Homestay</Link>
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 border border-gray-200 rounded-full px-3 py-1.5 hover:shadow-md transition-shadow bg-white"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                      {initials}
                    </div>
                    <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">{user.name}</span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100 mb-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-gray-400" />
                        My Profile & Bookings
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Building className="w-4 h-4 text-gray-400" />
                          Admin Panel
                        </Link>
                      )}
                      {user.role === 'owner' && (
                        <Link
                          to="/owner"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Building className="w-4 h-4 text-gray-400" />
                          Owner Panel
                        </Link>
                      )}
                      <hr className="my-1 border-gray-100" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Log out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link to="/login" className="text-gray-600 hover:text-primary-600 font-medium transition-colors flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Log in
                  </Link>
                  <Link to="/register" className="bg-primary-600 text-white px-5 py-2 rounded-full font-medium hover:bg-primary-700 transition-colors shadow-sm">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 hover:text-gray-900 focus:outline-none">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pt-2 pb-6 space-y-2 shadow-lg absolute w-full left-0">
          <Link to="/properties?type=Hotel" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">Hotels</Link>
          <Link to="/properties?type=Homestay" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">Homestays</Link>
          <Link to="/partner?type=Hotel" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-semibold text-primary-600 hover:bg-primary-50 rounded-md">Register your Hotel</Link>
          <Link to="/partner?type=Homestay" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-semibold text-primary-600 hover:bg-primary-50 rounded-md">Register your Homestay</Link>
          <hr className="my-2 border-gray-100" />
          {user ? (
            <>
              <div className="px-3 py-2 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm">{initials}</div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-2"><LayoutDashboard className="w-4 h-4" /> My Profile & Bookings</Link>
              {user.role === 'admin' && (
                <Link to="/admin" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-2"><Building className="w-4 h-4" /> Admin Panel</Link>
              )}
              {user.role === 'owner' && (
                <Link to="/owner" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-2"><Building className="w-4 h-4" /> Owner Panel</Link>
              )}
              <button onClick={handleLogout} className="w-full text-left block px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-md flex items-center gap-2"><LogOut className="w-4 h-4" /> Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">Log in</Link>
              <Link to="/register" onClick={() => setIsOpen(false)} className="block px-3 py-2 mt-2 text-center text-base font-medium bg-primary-600 text-white rounded-md shadow-sm">Sign up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
