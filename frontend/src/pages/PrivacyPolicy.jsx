import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building, ChevronDown, ChevronUp, Shield } from 'lucide-react';

const LAST_UPDATED = '04/03/2025';

const Section = ({ title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden mb-4">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex justify-between items-center px-6 py-4 bg-gray-50 hover:bg-gray-100 transition text-left gap-4">
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
        {open ? <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />}
      </button>
      {open && <div className="px-6 py-5 prose prose-sm max-w-none text-gray-700">{children}</div>}
    </div>
  );
};

const Bullet = ({ children }) => (
  <li className="flex gap-2 items-start mb-2">
    <span className="text-primary-500 mt-1 shrink-0">•</span>
    <span>{children}</span>
  </li>
);

export default function PrivacyPolicy() {
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

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-100 mb-4">
            <Shield className="w-7 h-7 text-primary-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Privacy Policy</h1>
          <p className="text-gray-500 mt-2 text-sm">Last updated: {LAST_UPDATED}</p>
          <p className="text-gray-600 mt-4 max-w-xl mx-auto text-sm leading-relaxed">
            StayHub is committed to protecting your information. This policy explains what we collect,
            how we use it, how we protect it, and your rights.
          </p>
        </div>

        {/* Sections */}
        <Section title="1. Information about StayHub" defaultOpen>
          <p>
            In this privacy policy, references to <strong>"StayHub"</strong>, <strong>"we"</strong>, <strong>"us"</strong> or <strong>"our"</strong> refer
            to StayHub Platform and its affiliated entities. StayHub is an online aggregator platform connecting
            guests with hotels and homestay owners across India.
          </p>
          <p className="mt-3">
            Depending on how you interact with us — via our app, website, or by booking a property through
            a third-party — different aspects of your data may be handled. Contact us for more details.
          </p>
        </Section>

        <Section title="2. Scope of this Policy">
          <p>This policy applies to anyone who interacts with StayHub in relation to our products and services via any channel — including our website, app, email, phone, or in-person interactions.</p>
          <p className="mt-3">It applies when you:</p>
          <ul className="mt-2 space-y-1">
            <Bullet>Sign up for a StayHub account</Bullet>
            <Bullet>Make or manage a booking</Bullet>
            <Bullet>Contact our customer support</Bullet>
            <Bullet>Stay at a StayHub-listed property</Bullet>
            <Bullet>List your property on StayHub</Bullet>
            <Bullet>Otherwise communicate or interact with us</Bullet>
          </ul>
          <p className="mt-3 text-sm bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-amber-800">
            <strong>Note:</strong> If you book a stay at a partner property not directly managed by StayHub,
            that property owner may have their own separate privacy policy.
          </p>
          <p className="mt-3">StayHub's services are not aimed at children. We do not knowingly allow children to make bookings without a responsible adult.</p>
        </Section>

        <Section title="3. How we obtain your information">
          <p>We collect personal information directly from you and from third parties who book on your behalf.</p>
          <p className="mt-3 font-semibold text-gray-800">Sources include:</p>
          <ul className="mt-2 space-y-1">
            <Bullet>Directly from you — through our website, app, email, phone or in-person</Bullet>
            <Bullet>Travel agencies or booking platforms that partner with StayHub</Bullet>
            <Bullet>Property owners and accommodation providers</Bullet>
            <Bullet>Third-party service providers who work with us</Bullet>
            <Bullet>Corporate clients booking accommodation for employees</Bullet>
          </ul>
          <p className="mt-3 text-sm text-gray-500">
            If you provide us information about other individuals (e.g. fellow guests), please ensure they
            are aware of and comfortable with this privacy policy.
          </p>
          <p className="mt-3 text-sm bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-blue-800">
            <strong>Call recording:</strong> We may record or monitor calls for compliance and quality assurance.
          </p>
        </Section>

        <Section title="4. Categories of personal information we collect">
          <p className="font-semibold text-gray-800 mb-3">Standard Personal Information:</p>
          <ul className="space-y-1">
            <Bullet><strong>Contact Info:</strong> Name, username, address, email, phone number(s), profile picture, country, age, gender, date of birth</Bullet>
            <Bullet><strong>Location Info:</strong> Approximate location from IP address; precise GPS location (if you allow our app to access location services)</Bullet>
            <Bullet><strong>Transaction Info:</strong> Type of service, booking dates, amount charged, nights stayed, referral details</Bullet>
            <Bullet><strong>Account History:</strong> Booking records, complaints, past interactions</Bullet>
            <Bullet><strong>Usage & Preferences:</strong> IP addresses, search terms, device information, app interaction data</Bullet>
            <Bullet><strong>Log Data:</strong> Device IP, access times, pages viewed, app crashes, browser type</Bullet>
            <Bullet><strong>Device Info:</strong> Hardware model, OS version, unique device identifiers, advertising IDs</Bullet>
            <Bullet><strong>Call & SMS Data:</strong> Date, time, phone numbers of calls/messages with property managers</Bullet>
            <Bullet><strong>CCTV:</strong> If you visit our offices or partner premises using CCTV monitoring</Bullet>
            <Bullet><strong>WiFi:</strong> If you use WiFi at a StayHub property — login info and usage data</Bullet>
          </ul>

          <p className="font-semibold text-gray-800 mt-5 mb-3">Special Category Information (with extra protections):</p>
          <ul className="space-y-1">
            <Bullet><strong>Religious/philosophical beliefs</strong> — revealed through food preferences (halal, kosher, vegetarian etc.)</Bullet>
            <Bullet><strong>Health information</strong> — from special assistance requests or disability-friendly accommodation needs</Bullet>
            <Bullet><strong>Sexual orientation</strong> — if voluntarily shared through relationship status or partner details</Bullet>
          </ul>
        </Section>

        <Section title="5. How we use your information">
          <p>We process your information based on these legal grounds:</p>
          <ul className="mt-3 space-y-1">
            <Bullet><strong>Performance of a contract:</strong> To fulfil your booking and provide services you've requested</Bullet>
            <Bullet><strong>Legitimate interests:</strong> Improving our services, fraud prevention, marketing, customer support</Bullet>
            <Bullet><strong>Legal obligations:</strong> Where required by applicable law or regulation</Bullet>
            <Bullet><strong>Your consent:</strong> Where we specifically ask for it (e.g. special category data)</Bullet>
          </ul>
          <p className="mt-4 font-semibold text-gray-800">We specifically use your data to:</p>
          <ul className="mt-2 space-y-1">
            <Bullet>Process bookings and provide accommodation services</Bullet>
            <Bullet>Send booking confirmations, updates and service communications</Bullet>
            <Bullet>Handle payments, refunds and receipts</Bullet>
            <Bullet>Respond to queries, complaints and support requests</Bullet>
            <Bullet>Authenticate users and maintain platform security</Bullet>
            <Bullet>Improve our app, website and booking experience</Bullet>
            <Bullet>Send relevant marketing (you can opt out at any time)</Bullet>
            <Bullet>Detect and prevent fraud and abuse</Bullet>
            <Bullet>Enforce our terms and protect legal rights</Bullet>
          </ul>
        </Section>

        <Section title="6. Marketing & preferences">
          <p>
            We may use your information to send marketing communications via email, SMS, app notifications,
            social media and post. We may also personalise recommendations based on your preferences and
            past bookings (this is sometimes called "profiling").
          </p>
          <p className="mt-3">You can opt out at any time by:</p>
          <ul className="mt-2 space-y-1">
            <Bullet>Clicking the <strong>Unsubscribe</strong> link in any marketing email</Bullet>
            <Bullet>Adjusting push notification settings in your device settings</Bullet>
            <Bullet>Contacting us at <a href="mailto:privacy@stayhub.com" className="text-primary-600 hover:underline">privacy@stayhub.com</a></Bullet>
          </ul>
        </Section>

        <Section title="7. Analytics & third-party advertising">
          <p>
            We use third-party analytics and advertising providers who may use cookies, web beacons and
            similar technologies to analyse your interactions with our platform and serve tailored marketing.
          </p>
          <p className="mt-3">We use Google Analytics and Google Places API to improve search suggestions and location-based features.
            Please refer to <a href="http://www.google.com/privacy.html" className="text-primary-600 hover:underline" target="_blank" rel="noreferrer">Google's privacy policy</a> for their data practices.
          </p>
          <p className="mt-3 text-sm text-gray-500">For more details, refer to our separate Cookie Policy.</p>
        </Section>

        <Section title="8. Sharing your information">
          <p>We share your information with:</p>
          <ul className="mt-3 space-y-1">
            <Bullet><strong>StayHub group entities</strong> — for internal operations and service delivery</Bullet>
            <Bullet><strong>Property owners & managers</strong> — your name, check-in time and booking details so they can host you</Bullet>
            <Bullet><strong>Payment processors</strong> — Razorpay and other financial service providers to process transactions</Bullet>
            <Bullet><strong>Technology providers</strong> — cloud, hosting, analytics, and communication services</Bullet>
            <Bullet><strong>Referral partners</strong> — limited details if you used or shared a referral code</Bullet>
            <Bullet><strong>Law enforcement / government</strong> — when required by law or court order</Bullet>
            <Bullet><strong>Business transfers</strong> — in the event of a merger, acquisition or sale of StayHub assets</Bullet>
          </ul>
          <p className="mt-3 text-sm text-gray-500">
            Where we share your data, appropriate contractual safeguards are in place. We may also share
            aggregated, anonymised data that cannot identify you individually.
          </p>
        </Section>

        <Section title="9. Data transfers outside India">
          <p>
            StayHub may transfer your personal information to servers or partners located outside India.
            When we do so, we ensure appropriate safeguards are in place — including contractual protections
            in line with applicable data protection laws.
          </p>
          <p className="mt-3">
            For more information about international transfer safeguards, contact us at{' '}
            <a href="mailto:privacy@stayhub.com" className="text-primary-600 hover:underline">privacy@stayhub.com</a>.
          </p>
        </Section>

        <Section title="10. How long we keep your data">
          <p>We retain your personal information for as long as necessary to:</p>
          <ul className="mt-3 space-y-1">
            <Bullet>Maintain your active account and booking history</Bullet>
            <Bullet>Fulfil legal obligations and respond to potential claims</Bullet>
            <Bullet>Comply with statutory retention periods</Bullet>
            <Bullet>Resolve disputes or exercise our legal rights</Bullet>
          </ul>
          <p className="mt-3 text-sm text-gray-500">
            When we no longer need your data, we securely delete or anonymise it.
          </p>
        </Section>

        <Section title="11. Your rights">
          <p>Depending on your location and applicable law, you may have the following rights regarding your personal information:</p>
          <ul className="mt-3 space-y-2">
            <Bullet><strong>Right of access:</strong> Request a copy of the personal information we hold about you</Bullet>
            <Bullet><strong>Right to rectification:</strong> Ask us to correct inaccurate or incomplete data</Bullet>
            <Bullet><strong>Right to deletion:</strong> Request deletion of your personal information (subject to legal obligations)</Bullet>
            <Bullet><strong>Right to restriction:</strong> Ask us to limit how we use your data in certain circumstances</Bullet>
            <Bullet><strong>Right to object:</strong> Object to processing based on legitimate interests, including direct marketing</Bullet>
            <Bullet><strong>Right to data portability:</strong> Receive your data in a machine-readable format</Bullet>
            <Bullet><strong>Right to withdraw consent:</strong> Where processing is based on your consent, withdraw it at any time</Bullet>
          </ul>
          <p className="mt-4 text-sm bg-primary-50 border border-primary-100 rounded-xl px-4 py-3 text-primary-800">
            To exercise any of these rights, contact us at{' '}
            <a href="mailto:privacy@stayhub.com" className="font-semibold hover:underline">privacy@stayhub.com</a>.
            We may need to verify your identity before responding.
          </p>
        </Section>

        <Section title="12. Contact us">
          <p>If you have questions, comments or complaints about this policy or how we handle your data, please contact:</p>
          <div className="mt-4 bg-gray-50 rounded-xl p-5 space-y-1 text-sm">
            <p className="font-bold text-gray-900 text-base">StayHub Privacy Team</p>
            <p>📧 <a href="mailto:privacy@stayhub.com" className="text-primary-600 hover:underline">privacy@stayhub.com</a></p>
            <p>📍 StayHub Platform Pvt. Ltd., India</p>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            If you are not satisfied with our response, you have the right to lodge a complaint with your local
            data protection or consumer rights authority.
          </p>
        </Section>

        <div className="mt-8 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} StayHub Platform Pvt. Ltd. · All rights reserved. ·{' '}
          <Link to="/terms" className="hover:text-primary-500 transition">Terms of Service</Link>
        </div>
      </div>
    </div>
  );
}
