import React from 'react';
import { Building, Facebook, Instagram, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1 border-b border-gray-800 pb-8 md:border-0 md:pb-0">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Building className="h-8 w-8 text-primary-500" />
              <span className="text-2xl font-bold tracking-tight">StayHub</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Your trusted partner for booking the best hotels and authentic homestays at unbeatable prices.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Twitter className="h-5 w-5" /></a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-gray-300">Properties</h3>
            <ul className="space-y-3">
              <li><Link to="/properties?type=Hotel" className="text-base text-gray-400 hover:text-white transition-colors">Find Hotels</Link></li>
              <li><Link to="/properties?type=Homestay" className="text-base text-gray-400 hover:text-white transition-colors">Find Homestays</Link></li>
              <li><Link to="/partner" className="text-base text-gray-400 hover:text-white transition-colors">List your property</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-gray-300">Support</h3>
            <ul className="space-y-3">
              <li><Link to="/contact" className="text-base text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/faq" className="text-base text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link to="/cancellation" className="text-base text-gray-400 hover:text-white transition-colors">Cancellation Policy</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-gray-300">Legal</h3>
            <ul className="space-y-3">
              <li><Link to="/privacy" className="text-base text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-base text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <p className="text-base text-gray-500">
            &copy; {new Date().getFullYear()} StayHub Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
