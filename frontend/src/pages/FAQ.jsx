import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building, HelpCircle, ChevronDown, ChevronUp, Search, Phone, Mail } from 'lucide-react';

const FAQS = [
  {
    category: 'Booking',
    color: 'bg-blue-100 text-blue-700',
    items: [
      {
        q: 'How do I make a booking on StayHub?',
        a: 'Search for your destination, select your dates and preferred property, then click "Book Now". You can pay via Razorpay using Credit/Debit Card, UPI, Net Banking or Wallets. You will receive an instant booking confirmation on your registered email and phone number.',
      },
      {
        q: 'Can I modify my booking after it is confirmed?',
        a: 'Yes. Please contact our 24×7 support team via phone or email with your booking ID. Modifications are subject to availability and the property\'s policy. Date changes may involve a fare difference.',
      },
      {
        q: 'Is it mandatory to create an account to book?',
        a: 'You can browse properties without an account, but a StayHub account is required to complete a booking, manage reservations and track refunds. Signing up is free and takes less than a minute.',
      },
      {
        q: 'How do I get my booking confirmation?',
        a: 'A booking confirmation with your voucher is sent to your registered email address immediately after payment is processed. You can also view all bookings under "My Bookings" in your account.',
      },
      {
        q: 'Can I book for someone else under my account?',
        a: 'Yes, you can book on behalf of someone else. Ensure the primary guest name matches the photo ID they will present at check-in, and that you provide their contact number in the booking details.',
      },
    ],
  },
  {
    category: 'Check-In & Check-Out',
    color: 'bg-emerald-100 text-emerald-700',
    items: [
      {
        q: 'What is the standard check-in and check-out time?',
        a: 'Standard check-in is 12:00 noon and check-out is 11:00 AM. Early check-in and late check-out are subject to availability and may have additional charges. See our Cancellation Policy page for the detailed charge table.',
      },
      {
        q: 'What ID is required at check-in?',
        a: 'A valid government-issued photo ID is mandatory for all guests above 18. Accepted IDs: Aadhaar Card, Driving Licence, Voter ID, Passport. PAN card is NOT accepted. You will not be allowed to check in without an original valid ID.',
      },
      {
        q: 'What should I do if I face a problem checking in?',
        a: 'Contact StayHub support immediately on our 24×7 helpline. We will verify the issue with the property and arrange alternate accommodation of comparable standards, or issue a full refund if alternate accommodation is unavailable.',
      },
      {
        q: 'Can I extend my stay at the hotel?',
        a: 'Yes, subject to availability. Extension of stay will be charged at the current prevailing room rate, not the rate at which your original booking was made. Contact the property reception or StayHub support to arrange this.',
      },
    ],
  },
  {
    category: 'Cancellations & Refunds',
    color: 'bg-red-100 text-red-700',
    items: [
      {
        q: 'How do I cancel my booking?',
        a: 'Log in to your StayHub account, go to "My Bookings", select the booking and click "Cancel". You can also contact our support team by phone or email. Corporate bookings follow the cancellation policy in your contract.',
      },
      {
        q: 'How long does a refund take?',
        a: 'Refunds are processed within 7–14 working days to your original payment method (credit card, UPI, bank account). Refund eligibility depends on the property\'s cancellation policy and how early you cancel before check-in.',
      },
      {
        q: 'Will I get a refund for a no-show?',
        a: 'No-show refund eligibility is determined by the specific cancellation policy displayed on your booking voucher. Many properties are non-refundable for no-shows. Please refer to your booking voucher for the exact policy.',
      },
      {
        q: 'Can I get a refund if the property denies me check-in?',
        a: 'If check-in is denied for valid reasons attributable to the property (not due to missing ID or policy violations by you), StayHub will arrange alternate accommodation or issue a full refund. If denial is due to guest non-compliance (no valid ID, policy violations, etc.), no refund will be issued.',
      },
      {
        q: 'What is the refund claim period?',
        a: 'You must raise a refund request within 7 days of your checkout date. Requests submitted after this period will not be considered.',
      },
    ],
  },
  {
    category: 'Payments',
    color: 'bg-amber-100 text-amber-700',
    items: [
      {
        q: 'What payment methods does StayHub accept?',
        a: 'We accept Credit Cards, Debit Cards, UPI (GPay, PhonePe, Paytm), Net Banking, and major Wallets — all processed securely via Razorpay. International cards are accepted for most properties.',
      },
      {
        q: 'Is it safe to pay on StayHub?',
        a: 'Yes. All payments are secured through Razorpay, a PCI-DSS compliant payment gateway. StayHub never stores your card details. Only pay through the official StayHub website or app — never via unknown links or third parties.',
      },
      {
        q: 'I was charged but did not receive a confirmation. What should I do?',
        a: 'Payment processing can occasionally take a few minutes. Wait 15–20 minutes and check your email (including spam/junk). If the issue persists, contact our support team with your transaction ID. Your amount will either be confirmed or refunded automatically within 5–7 working days.',
      },
      {
        q: 'Are there any hidden charges?',
        a: 'No hidden charges. The price shown at checkout is the final price. Some properties may charge a refundable security deposit directly at check-in, which will be clearly mentioned on the property page.',
      },
    ],
  },
  {
    category: 'Property & Amenities',
    color: 'bg-purple-100 text-purple-700',
    items: [
      {
        q: 'What amenities are guaranteed at all StayHub properties?',
        a: 'All StayHub-listed properties come with AC rooms with TV, Wi-Fi, clean linen, hygienic washrooms, daily housekeeping, and 24×7 front desk support. Property-specific amenities (pool, restaurant, gym etc.) are shown on the property listing page.',
      },
      {
        q: 'Are pets allowed?',
        a: 'Pets are allowed only at select StayHub properties. Look for the "Pet Friendly" tag on the property listing. Vaccinated dogs and cats are welcome with a valid certificate. Pets must be kept on a leash and are not allowed on beds, in the pool, or in the restaurant.',
      },
      {
        q: 'Is Wi-Fi available at all properties?',
        a: 'Yes, Wi-Fi is available at all StayHub-listed properties. A minimum download speed of 5 Mbps is expected in all rooms and common areas. If you face Wi-Fi issues, contact the property front desk immediately.',
      },
      {
        q: 'Can children stay for free?',
        a: '1 child up to 5 years of age can stay complimentarily without use of an extra mattress. Children above 5 may require an extra mattress (extra charges apply). Breakfast charges may apply for children at all ages.',
      },
    ],
  },
  {
    category: 'Account & Login',
    color: 'bg-indigo-100 text-indigo-700',
    items: [
      {
        q: 'How do I create a StayHub account?',
        a: 'Click "Sign Up" on the top navigation bar. You can register using your email and password, phone number with OTP, or your Google account. Account creation is free and instant.',
      },
      {
        q: 'I forgot my password. How do I reset it?',
        a: 'Click "Forgot Password" on the login page and enter your registered email. You will receive a password reset link. If you signed up with Google or Phone OTP, simply use those methods to log back in.',
      },
      {
        q: 'Can I log in using my phone number?',
        a: 'Yes! StayHub supports phone number login via OTP. Enter your number with the country code, receive an OTP, and you\'re in. This works for both customers and property owners.',
      },
      {
        q: 'How do I access the property owner dashboard?',
        a: 'Property owners have a separate portal at /owner/login. You need an owner-role account issued by the StayHub admin team. If you want to list your property, visit /partner to submit your application.',
      },
    ],
  },
  {
    category: 'Listing Your Property',
    color: 'bg-teal-100 text-teal-700',
    items: [
      {
        q: 'How do I list my hotel or homestay on StayHub?',
        a: 'Visit the "List Your Property" page (link in the footer). Fill in the property details form — name, location, pricing, amenities and images. Our team will review your application and activate your listing within 24–48 hours.',
      },
      {
        q: 'Is there a fee to list a property on StayHub?',
        a: 'Listing is completely free. StayHub operates on a commission model — we only earn when you earn. The platform price (what guests pay) includes our commission, while your net rate (what you receive) is set by you.',
      },
      {
        q: 'How will I get paid for bookings?',
        a: 'Payments are settled directly to your registered bank account on a monthly reconciliation cycle. You will receive a detailed reconciliation statement covering all bookings in the period.',
      },
      {
        q: 'Can I manage my property\'s availability and pricing?',
        a: 'Yes. Once your property is onboarded and your owner account is activated, you can manage availability, pricing, descriptions and amenities from your Owner Dashboard (/owner).',
      },
    ],
  },
];

const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden mb-3">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex justify-between items-start px-5 py-4 text-left bg-white hover:bg-gray-50 transition gap-3">
        <p className="text-sm font-semibold text-gray-900 leading-snug">{q}</p>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
               : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />}
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
          {a}
        </div>
      )}
    </div>
  );
};

export default function FAQ() {
  const [query, setQuery]       = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const categories = ['All', ...FAQS.map(f => f.category)];

  const filtered = FAQS
    .filter(cat => activeTab === 'All' || cat.category === activeTab)
    .map(cat => ({
      ...cat,
      items: cat.items.filter(
        item => !query || item.q.toLowerCase().includes(query.toLowerCase()) || item.a.toLowerCase().includes(query.toLowerCase())
      ),
    }))
    .filter(cat => cat.items.length > 0);

  const totalMatches = filtered.reduce((acc, c) => acc + c.items.length, 0);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-2">
          <Building className="w-7 h-7 text-primary-600" />
          <span className="text-xl font-extrabold text-gray-900">StayHub</span>
        </Link>
        <Link to="/" className="text-sm text-primary-600 font-semibold hover:underline">← Back to Home</Link>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-700 via-primary-600 to-indigo-700 text-white text-center py-14 px-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 mb-4">
          <HelpCircle className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">Frequently Asked Questions</h1>
        <p className="text-primary-100 max-w-xl mx-auto mb-8">
          Find answers to the most common questions about bookings, payments, check-in, and more.
        </p>
        {/* Search */}
        <div className="max-w-lg mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search questions…"
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
          />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveTab(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition ${
                activeTab === cat
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Results count when searching */}
        {query && (
          <p className="text-sm text-gray-500 mb-4">
            {totalMatches > 0 ? `${totalMatches} result${totalMatches > 1 ? 's' : ''} for "${query}"` : `No results for "${query}"`}
          </p>
        )}

        {/* FAQ groups */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-semibold">No questions found for "{query}"</p>
            <p className="text-sm text-gray-400 mt-1">Try different keywords or contact our support team.</p>
            <Link to="/contact" className="mt-4 inline-block text-primary-600 hover:underline text-sm font-semibold">
              Contact Support →
            </Link>
          </div>
        ) : (
          filtered.map(cat => (
            <div key={cat.category} className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${cat.color}`}>{cat.category}</span>
                <span className="text-xs text-gray-400">{cat.items.length} question{cat.items.length > 1 ? 's' : ''}</span>
              </div>
              {cat.items.map(item => <FaqItem key={item.q} q={item.q} a={item.a} />)}
            </div>
          ))
        )}

        {/* Still need help */}
        <div className="mt-8 bg-primary-600 rounded-2xl p-8 text-center text-white">
          <h3 className="text-xl font-extrabold mb-2">Still need help?</h3>
          <p className="text-primary-100 text-sm mb-6">Our support team is available 24×7 to assist you.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="tel:+91XXXXXXXXXX"
              className="flex items-center justify-center gap-2 bg-white text-primary-700 font-bold px-6 py-3 rounded-xl hover:bg-primary-50 transition text-sm">
              <Phone className="w-4 h-4" /> Call Support
            </a>
            <Link to="/contact"
              className="flex items-center justify-center gap-2 border border-white/30 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/10 transition text-sm">
              <Mail className="w-4 h-4" /> Send a Message
            </Link>
          </div>
        </div>
      </div>

      {/* Footer strip */}
      <div className="bg-gray-900 py-5 text-center text-xs text-gray-500 mt-6">
        <Link to="/" className="hover:text-white transition">← StayHub Home</Link>
        <span className="mx-3">·</span>
        <Link to="/contact" className="hover:text-white transition">Contact Us</Link>
        <span className="mx-3">·</span>
        <Link to="/cancellation" className="hover:text-white transition">Cancellation Policy</Link>
        <span className="mx-3">·</span>
        <Link to="/terms" className="hover:text-white transition">Terms of Service</Link>
      </div>
    </div>
  );
}
