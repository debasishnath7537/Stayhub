import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Building, ChevronDown, ChevronUp, ScrollText } from 'lucide-react';

const LAST_UPDATED = '04/03/2025';

/* ── Reusable accordion section ── */
const Section = ({ id, num, title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  const ref = useRef(null);
  return (
    <div id={id} ref={ref} className="border border-gray-200 rounded-2xl overflow-hidden mb-4 scroll-mt-24">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex justify-between items-center px-6 py-4 bg-gray-50 hover:bg-gray-100 transition text-left gap-4"
      >
        <h2 className="text-base font-bold text-gray-900">
          <span className="text-primary-500 mr-2">{num}.</span>{title}
        </h2>
        {open
          ? <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" />
          : <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />}
      </button>
      {open && (
        <div className="px-6 py-5 text-sm text-gray-700 space-y-3 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
};

const Bullet = ({ children }) => (
  <li className="flex gap-2 items-start mb-1.5">
    <span className="text-primary-500 mt-0.5 shrink-0">•</span>
    <span>{children}</span>
  </li>
);

const Alpha = ({ letter, children }) => (
  <div className="flex gap-3 mb-2">
    <span className="font-bold text-primary-600 shrink-0">{letter}.</span>
    <span>{children}</span>
  </div>
);

const Sub = ({ title, children }) => (
  <div className="mt-4">
    <p className="font-semibold text-gray-800 mb-2">{title}</p>
    {children}
  </div>
);

const Callout = ({ children, type = 'info' }) => {
  const styles = {
    info: 'bg-blue-50 border-blue-100 text-blue-800',
    warn: 'bg-amber-50 border-amber-100 text-amber-800',
    danger: 'bg-red-50 border-red-100 text-red-800',
  };
  return (
    <div className={`border rounded-xl px-4 py-3 text-xs mt-3 ${styles[type]}`}>
      {children}
    </div>
  );
};

/* ── TOC links ── */
const TOC = [
  [1,  'Scope of Services'],
  [2,  'Eligibility to Use'],
  [3,  'Account Registration & Use'],
  [4,  'StayHub Services'],
  [5,  'Term & Termination'],
  [6,  'Terms for Customers'],
  [7,  'Usage Terms'],
  [8,  'Prohibited Content & Conduct'],
  [9,  'Communications'],
  [10, 'Third-Party Links'],
  [11, 'Guest Support Program'],
  [12, 'Intellectual Property'],
  [13, 'Privacy'],
  [14, 'Indemnification'],
  [15, 'No Warranty'],
  [16, 'Limitation of Liability'],
  [17, 'Refund Claim Period'],
  [18, 'Modification of Terms'],
  [19, 'General Provisions'],
  [20, 'Check-In & Check-Out Policy'],
  [21, 'Property Owner / Partner Terms'],
];

export default function TermsOfService() {
  const scrollTo = (id) => {
    document.getElementById(`sec-${id}`)?.scrollIntoView({ behavior: 'smooth' });
  };

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

      <div className="max-w-5xl mx-auto px-4 py-12 flex gap-8">

        {/* Sidebar TOC — desktop only */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24 bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Table of Contents</p>
            <nav className="space-y-1 max-h-[70vh] overflow-y-auto pr-1">
              {TOC.map(([num, title]) => (
                <button key={num} onClick={() => scrollTo(num)}
                  className="w-full text-left text-xs text-gray-600 hover:text-primary-600 py-1 flex gap-2 transition">
                  <span className="text-primary-400 font-bold shrink-0">{num}.</span>
                  <span className="leading-snug">{title}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-100 mb-4">
              <ScrollText className="w-7 h-7 text-primary-600" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900">Terms of Service</h1>
            <p className="text-gray-500 mt-2 text-sm">Last updated: {LAST_UPDATED}</p>
          </div>

          {/* Intro */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 text-sm text-gray-700 leading-relaxed">
            <p>
              These Terms of Service form a legally binding agreement between Users
              (<strong>"User", "you", "your", "customer"</strong>) and <strong>StayHub Platform Pvt. Ltd.</strong>
              and/or its subsidiaries and affiliates (<strong>"StayHub", "we", "us", "our"</strong>).
              These terms govern the use of our website, mobile application, and call centres
              (collectively the <strong>"StayHub Platform"</strong>) which enables Users to connect with us
              in relation to the services offered.
            </p>
            <p className="mt-3">
              Please read these terms carefully before accessing or using any products or services by StayHub.
              If you do not agree, please refrain from using the StayHub Platform.
              StayHub reserves the right to modify these terms at any time. Continued use of the Platform
              constitutes acceptance of any modifications.
            </p>
          </div>

          {/* ── Section 1 ── */}
          <Section id="sec-1" num={1} title="Scope of Services" defaultOpen>
            <p>
              StayHub markets properties — including hotels and homestays — managed and/or owned by third
              parties (<strong>"Property Partners"</strong>) and/or by StayHub directly, to help Users avail
              accommodation services ("StayHub's Service"). Our Platform offers the following product categories:
            </p>
            <ul className="mt-3 space-y-1">
              <Bullet>StayHub Hotels</Bullet>
              <Bullet>StayHub Homestays</Bullet>
              <Bullet>StayHub Townhouse / Boutique Properties</Bullet>
              <Bullet>StayHub Business Stays</Bullet>
              <Bullet>StayHub Premium Collection</Bullet>
            </ul>
          </Section>

          {/* ── Section 2 ── */}
          <Section id="sec-2" num={2} title="Eligibility to Use">
            <p>
              You must be at least <strong>18 years of age</strong> and capable of entering into a legally
              binding contract. Individuals under 18 may browse the Platform only under parental or legal
              guardian supervision using the guardian's registered account.
            </p>
            <p>
              StayHub reserves the right to terminate access and refuse service if it is discovered that a
              User is under 18 years of age.
            </p>
          </Section>

          {/* ── Section 3 ── */}
          <Section id="sec-3" num={3} title="Account Registration & Use">
            <p>
              StayHub makes Services available upon you providing required User information and creating an
              Account. You are responsible for maintaining the confidentiality of your account credentials
              and are fully responsible for all activities that occur under your account.
            </p>
            <ul className="mt-3 space-y-1">
              <Bullet>Immediately notify StayHub of any unauthorised use of your account</Bullet>
              <Bullet>Log out at the end of each session</Bullet>
              <Bullet>Ensure all registration information is complete, accurate and up-to-date</Bullet>
              <Bullet>Use of another user's account is expressly prohibited</Bullet>
            </ul>
            <p className="mt-3">
              If you change your phone number or mobile operator, update your account details promptly.
              StayHub shall not be liable for any loss or damage arising from your failure to keep account
              information secure.
            </p>
          </Section>

          {/* ── Section 4 ── */}
          <Section id="sec-4" num={4} title="StayHub Services">
            <p>StayHub is primarily responsible for providing a comfortable room stay experience by:</p>
            <ol className="list-decimal pl-5 mt-3 space-y-2">
              <li>Offering a wide variety of hotels and homestays to service customer needs</li>
              <li>Providing booking confirmations that entitle customers to avail stay services at StayHub-listed properties</li>
              <li>Helping customers find suitable accommodation via our support desk if they cannot find a suitable property online</li>
              <li>Ensuring alternate accommodation of comparable standards in the event of a denied check-in for a confirmed booking; or, where alternate accommodation cannot be arranged, issuing a full refund of any pre-paid amount</li>
            </ol>
            <Sub title="Standard amenities promised at StayHub-listed properties:">
              <ul className="space-y-1">
                <Bullet>AC rooms with television</Bullet>
                <Bullet>Wi-Fi connectivity</Bullet>
                <Bullet>Clean, spotless linen</Bullet>
                <Bullet>Hygienic and sanitised washrooms</Bullet>
                <Bullet>Daily housekeeping</Bullet>
                <Bullet>24×7 front desk assistance</Bullet>
              </ul>
            </Sub>
            <Sub title="You can reach us by:">
              <ul className="space-y-1">
                <Bullet>Writing to us via the StayHub support page</Bullet>
                <Bullet>Calling our 24×7 guest support helpline</Bullet>
              </ul>
            </Sub>
          </Section>

          {/* ── Section 5 ── */}
          <Section id="sec-5" num={5} title="Term & Termination">
            <p>
              You may discontinue use of the StayHub Platform at any time by opting out of your membership.
              StayHub reserves the right to unilaterally terminate your access to the Platform without notice
              or liability for breach of these terms.
            </p>
          </Section>

          {/* ── Section 6 ── */}
          <Section id="sec-6" num={6} title="Terms for Customers">
            <Sub title="A. Reservation & Booking">
              <p>
                Booking Services may require disclosure of personal and confidential information.
                Avoid accessing the Platform from unsecured computers or public internet terminals.
                By placing an order, you confirm you have reviewed pricing and service descriptions and
                agree to be bound by these Terms.
              </p>
              <ul className="mt-3 space-y-1">
                <Alpha letter="a">You are legally capable of entering a valid contract and making valid payments</Alpha>
                <Alpha letter="b">StayHub may cancel orders if suspicious activity is detected on your account</Alpha>
                <Alpha letter="c">For credit card payments, you must use a card you are fully authorised to use; StayHub is not liable for credit card fraud</Alpha>
                <Alpha letter="d">You shall strictly comply with the payment procedure and these Terms at all times</Alpha>
              </ul>
            </Sub>
            <Sub title="B. Payment & Usage Fee">
              <p>
                You agree to pay the applicable usage fee as shown on the Platform via the available
                payment methods. StayHub uses third-party payment providers (including Razorpay) and is not
                responsible for delays or errors caused by payment provider systems. All payments are
                processed by the entities specified on our payment information page.
              </p>
            </Sub>
            <Sub title="C. Responsibility">
              <p>
                Please take due care of all personal valuables and belongings. StayHub and its employees
                are <strong>NOT</strong> responsible for any loss, theft or damage to guests' personal
                property. Guest identity verification on the internet is inherently limited; StayHub may
                request government-issued identification for transparency and fraud prevention.
              </p>
            </Sub>
          </Section>

          {/* ── Section 7 ── */}
          <Section id="sec-7" num={7} title="Usage Terms">
            <p>
              Information on the StayHub Platform may inadvertently contain inaccuracies or outdated
              content. StayHub is not bound to honour typographical or pricing errors. StayHub reserves
              the right to refuse or cancel orders that contain incorrect prices, violate applicable laws,
              or are believed to be fraudulent.
            </p>
            <p>
              StayHub expressly disclaims any warranties regarding the accuracy, completeness, suitability,
              reliability, or uninterrupted operation of the Platform. StayHub is not responsible for
              inability to use the Platform due to maintenance, technical issues, or causes beyond our
              reasonable control.
            </p>
            <Callout type="warn">
              Any material downloaded from the Platform is done entirely at your own risk. StayHub accepts
              no liability for errors or omissions with respect to information provided to you.
            </Callout>
          </Section>

          {/* ── Section 8 ── */}
          <Section id="sec-8" num={8} title="Prohibited Content & Conduct">
            <p>
              As a condition of use, you warrant that you shall not use the StayHub Platform for any
              unlawful, unauthorised, or inconsistent purpose. You must not provide or upload:
            </p>
            <ul className="mt-3 space-y-1">
              <Bullet>False, inaccurate, misleading or incomplete information</Bullet>
              <Bullet>Fraudulent data or stolen credit card details</Bullet>
              <Bullet>Content that infringes third-party intellectual property or privacy rights</Bullet>
              <Bullet>Defamatory, threatening or harassing content</Bullet>
              <Bullet>Viruses, Trojan horses, malware or destructive code</Bullet>
            </ul>
            <Sub title="The following activities are specifically prohibited:">
              <ul className="space-y-1">
                <Bullet>Systematically scraping or harvesting data from the Platform without written permission</Bullet>
                <Bullet>Creating accounts by automated means or under false pretences</Bullet>
                <Bullet>Circumventing security features or copy-protection mechanisms</Bullet>
                <Bullet>Impersonating another user, person or entity</Bullet>
                <Bullet>Using the Platform to harass, abuse or harm another person</Bullet>
                <Bullet>Reverse-engineering or decompiling any software on the Platform</Bullet>
                <Bullet>Using scripts, bots, spiders or automated tools without authorisation</Bullet>
                <Bullet>Selling or transferring your account or profile to another person</Bullet>
                <Bullet>Using the Platform to compete with StayHub or for commercial exploitation</Bullet>
                <Bullet>Uploading content that disparages or tarnishes StayHub's brand or reputation</Bullet>
                <Bullet>Any activity inconsistent with applicable laws or regulations</Bullet>
              </ul>
            </Sub>
          </Section>

          {/* ── Section 9 ── */}
          <Section id="sec-9" num={9} title="Communications">
            <p>
              By using the Platform, you agree to communicate with StayHub through electronic records and
              consent to receive communications electronically (email, SMS, app notifications, etc.).
              StayHub will use best efforts to safeguard your personally identifiable information, but
              internet transmissions cannot be made absolutely secure.
            </p>
            <p>
              StayHub shall not be liable for disclosure of your information due to transmission errors or
              unauthorised acts of third parties, including phishing attacks. You are responsible for
              managing your browser's cookie settings.
            </p>
          </Section>

          {/* ── Section 10 ── */}
          <Section id="sec-10" num={10} title="Third-Party Links">
            <p>
              The Platform may contain links to third-party websites. Such links are provided for
              convenience only and do not constitute endorsement by StayHub. StayHub is not responsible
              for the content, privacy practices, or accuracy of any third-party websites. Visiting any
              linked site is entirely at your own risk.
            </p>
          </Section>

          {/* ── Section 11 ── */}
          <Section id="sec-11" num={11} title="Guest Support Program">
            <p>
              StayHub offers a Guest Support Program that provides discretionary assistance for certain
              events during your stay at StayHub-listed properties across India. This may include
              assistance with alternate accommodation, complaint resolution, and emergency support.
              Terms and conditions of the program apply and may be updated from time to time.
            </p>
          </Section>

          {/* ── Section 12 ── */}
          <Section id="sec-12" num={12} title="Intellectual Property">
            <p>
              The StayHub Platform and all content — including pictures, branding, text, graphics, logos,
              audio, video, interfaces and other information — is protected and owned, controlled or
              licensed by StayHub (<strong>"StayHub IP"</strong>).
            </p>
            <p>
              You may not modify, copy, transmit, sell, reproduce, distribute, frame, download, display
              or commercially exploit StayHub IP in any way.
            </p>
            <p>
              Any feedback, comments, ideas or suggestions you contribute to StayHub shall be deemed to
              grant StayHub a royalty-free, perpetual, irrevocable, worldwide licence to use such content
              without additional approval or consideration.
            </p>
          </Section>

          {/* ── Section 13 ── */}
          <Section id="sec-13" num={13} title="Privacy">
            <p>
              Please refer to our{' '}
              <Link to="/privacy" className="text-primary-600 hover:underline font-semibold">Privacy Policy</Link>
              {' '}which governs your use of the StayHub Platform and Services. By using the Platform, you
              agree to the collection and use of your information as described in that policy.
            </p>
          </Section>

          {/* ── Section 14 ── */}
          <Section id="sec-14" num={14} title="Indemnification">
            <p>
              You agree to indemnify, defend and hold StayHub harmless — including its affiliates, agents
              and employees — from and against any losses, liabilities, claims, damages, demands, costs and
              expenses (including legal fees) arising out of or related to:
            </p>
            <ul className="mt-3 space-y-1">
              <Bullet>Your use or misuse of the Platform</Bullet>
              <Bullet>Any violation of these Terms and Conditions</Bullet>
              <Bullet>Any breach of representations or warranties made by you</Bullet>
              <Bullet>Any infringement of third-party intellectual property or privacy rights</Bullet>
            </ul>
          </Section>

          {/* ── Section 15 ── */}
          <Section id="sec-15" num={15} title="No Warranty">
            <p>
              The Services are provided by StayHub on an <strong>"as is"</strong> basis without warranty
              of any kind — express, implied, statutory or otherwise — including implied warranties of
              merchantability or fitness for a particular purpose. StayHub makes no warranty that:
            </p>
            <ul className="mt-3 space-y-1">
              <Bullet>The Platform or Services will meet your requirements or be error-free</Bullet>
              <Bullet>Results from use of the Platform will be accurate or reliable</Bullet>
              <Bullet>Defects in the Platform or Services will be corrected</Bullet>
            </ul>
            <Callout type="warn">
              StayHub and Property Partners are separate, independent entities. StayHub is not the agent
              or representative of any Property Partner. StayHub will be the first point of contact for
              online payment disputes, refunds and cancellations.
            </Callout>
          </Section>

          {/* ── Section 16 ── */}
          <Section id="sec-16" num={16} title="Limitation of Liability">
            <p>
              StayHub shall not be liable for any direct, indirect, incidental, punitive, exemplary or
              consequential damages arising from use of the Platform or Services, regardless of whether
              such damages are based on contract, tort, negligence or otherwise.
            </p>
            <Callout type="danger">
              <strong>NOTWITHSTANDING THE ABOVE:</strong> StayHub's entire liability to you for any claim
              shall be limited to the amount equivalent to the price paid for the product or service giving
              rise to such claim.
            </Callout>
            <p className="mt-3">
              You waive any claim or cause of action arising out of or related to the Platform after
              <strong> one (1) year</strong> from the first occurrence of the relevant act, event or omission.
            </p>
            <p className="mt-3">
              If you wish to claim a refund, you must raise the request within{' '}
              <strong>7 days from your checkout date</strong>.
            </p>
          </Section>

          {/* ── Section 17 ── */}
          <Section id="sec-17" num={17} title="Refund Claim Period">
            <p>
              If you wish to claim a refund, you have the option to raise a request within{' '}
              <strong>7 days from your checkout date</strong>. Refund requests submitted after this period
              may not be considered. Please contact our support team at{' '}
              <a href="mailto:support@stayhub.com" className="text-primary-600 hover:underline">
                support@stayhub.com
              </a>{' '}
              to initiate a refund request.
            </p>
          </Section>

          {/* ── Section 18 ── */}
          <Section id="sec-18" num={18} title="Modification of Terms">
            <p>
              StayHub reserves the right to modify these Terms at any time. Changes will be published on
              this page with an updated "Last Updated" date. Your continued use of the Platform after
              any changes constitutes acceptance of the revised Terms. It is your responsibility to
              review these Terms periodically.
            </p>
          </Section>

          {/* ── Section 19 ── */}
          <Section id="sec-19" num={19} title="General Provisions">
            <Sub title="Governing Law & Jurisdiction">
              <p>
                This Agreement shall be governed by the laws of India. All claims and disputes arising
                under or in connection with the Platform or these Terms shall be subject to the exclusive
                jurisdiction of the courts at <strong>New Delhi, India</strong>.
              </p>
            </Sub>
            <Sub title="No Waiver">
              <p>
                Any failure or delay by StayHub in exercising any right or enforcing these Terms shall
                not constitute a waiver of that right.
              </p>
            </Sub>
            <Sub title="Severability">
              <p>
                If any provision of these Terms is found to be unenforceable, the remaining provisions
                shall continue in full force and effect.
              </p>
            </Sub>
          </Section>

          {/* ── Section 20 ── */}
          <Section id="sec-20" num={20} title="Check-In & Check-Out Policy">
            <p>Standard check-in time is <strong>12:00 noon</strong> and standard check-out time is <strong>11:00 AM</strong>, unless otherwise specified in your booking confirmation.</p>

            <Sub title="Early Check-In Charges">
              <div className="overflow-x-auto mt-2">
                <table className="w-full text-xs border border-gray-200 rounded-xl overflow-hidden">
                  <thead className="bg-gray-100 text-gray-600">
                    <tr>
                      <th className="px-4 py-2 text-left">Check-in Time</th>
                      <th className="px-4 py-2 text-left">Charges</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr><td className="px-4 py-2">Before 6:00 AM</td><td className="px-4 py-2">100% of previous night's room rate</td></tr>
                    <tr><td className="px-4 py-2">6:00 AM – 10:00 AM</td><td className="px-4 py-2">Up to 30% of previous day's room rate (min. ₹200)</td></tr>
                    <tr><td className="px-4 py-2">10:00 AM – 12:00 Noon</td><td className="px-4 py-2">Complimentary (subject to availability)</td></tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-400 mt-1">Note: Complimentary breakfast is not included for the day of early check-in.</p>
            </Sub>

            <Sub title="Late Check-Out Charges">
              <div className="overflow-x-auto mt-2">
                <table className="w-full text-xs border border-gray-200 rounded-xl overflow-hidden">
                  <thead className="bg-gray-100 text-gray-600">
                    <tr>
                      <th className="px-4 py-2 text-left">Check-out Time</th>
                      <th className="px-4 py-2 text-left">Charges</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr><td className="px-4 py-2">11:00 AM – 1:00 PM</td><td className="px-4 py-2">Complimentary (subject to availability)</td></tr>
                    <tr><td className="px-4 py-2">1:00 PM – 5:00 PM</td><td className="px-4 py-2">Up to 30% of current day's room rate (min. ₹300)</td></tr>
                    <tr><td className="px-4 py-2">After 5:00 PM</td><td className="px-4 py-2">100% of current day's room rate</td></tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-400 mt-1">Late check-out is subject to availability and cannot be guaranteed in advance.</p>
            </Sub>
          </Section>

          {/* ── Section 21 ── */}
          <Section id="sec-21" num={21} title="Property Owner / Partner Terms">
            <p className="font-semibold text-gray-800">
              These terms apply to property owners and operators ("Property Partners") who list their
              properties on the StayHub Platform.
            </p>

            <Sub title="Partner Obligations">
              <ul className="space-y-1">
                <Bullet>Keep the property open and operational during the term of the agreement</Bullet>
                <Bullet>Ensure all bookings (walk-in and online) are logged in the StayHub system</Bullet>
                <Bullet>Maintain at least 90% of rooms available and operational for guests</Bullet>
                <Bullet>Honour all confirmed bookings and provide comparable alternate accommodation if unable to do so</Bullet>
                <Bullet>Maintain price parity between online and walk-in bookings</Bullet>
                <Bullet>Ensure 24×7 reception coverage for guest support and check-in/check-out</Bullet>
                <Bullet>Maintain adequate CCTV coverage and provide access upon StayHub's request</Bullet>
                <Bullet>Comply with all applicable laws including health & safety, immigration, and fire safety regulations</Bullet>
                <Bullet>Ensure staff wear uniform in clean, presentable condition at all times during working hours</Bullet>
              </ul>
            </Sub>

            <Sub title="Guest Billing">
              <p>Property Partners must display a <strong>'No Bill – No Pay'</strong> notice prominently at the reception and provide guests with a proper invoice (via email or WhatsApp) at checkout. Non-compliance attracts a penalty of <strong>₹20,000 per instance</strong>.</p>
            </Sub>

            <Sub title="CCTV">
              <p>CCTV cameras installed at the property must not be tampered with, switched off, repositioned or covered. Tampering attracts a penalty of <strong>₹10,000 per incident</strong>.</p>
            </Sub>

            <Sub title="Google Rating Policy">
              <p>Property Partners are expected to maintain a Google My Business rating of <strong>4.5 stars or above</strong>. Where the rating falls below 4.5 stars by 0.2 stars in any given month, a penalty of <strong>₹10,000</strong> will be levied.</p>
            </Sub>

            <Sub title="Audit Access">
              <p>StayHub and its authorised representatives shall have access to the property for audit, inspection or review at any time. Denial of audit access attracts a penalty of <strong>₹20,000 per instance</strong>.</p>
            </Sub>

            <Sub title="Walk-In Requirement">
              <p>A minimum of <strong>10% of total occupied rooms</strong> per day must be from walk-in guests. Failure to meet this requirement may result in charges equivalent to the average daily booking rate for that calendar month, except where occupancy is at or above 90% or a Force Majeure Event applies.</p>
            </Sub>

            <Sub title="Intellectual Property & Confidentiality">
              <ul className="space-y-1">
                <Bullet>StayHub grants Property Partners a non-exclusive licence to use StayHub's branding solely for the purpose of the partnership</Bullet>
                <Bullet>All property photographs taken by StayHub remain StayHub's property</Bullet>
                <Bullet>All terms and commercial information under this agreement are strictly confidential</Bullet>
              </ul>
            </Sub>

            <Sub title="Termination">
              <p>Either party may terminate the agreement with 30 days' written notice. Early termination by the Property Partner may incur Liquidated Damages which are a genuine pre-estimate of StayHub's loss of profits. All outstanding amounts must be settled upon termination. Upon termination, all StayHub branding must be removed immediately.</p>
            </Sub>

            <Sub title="Governing Law">
              <p>Partner agreements are governed by the laws of India. Disputes shall be subject to the exclusive jurisdiction of the courts at New Delhi, India.</p>
            </Sub>

            <Callout type="info">
              For the full Property Partner Agreement, contact us at{' '}
              <a href="mailto:partner@stayhub.com" className="font-semibold hover:underline">
                partner@stayhub.com
              </a>
            </Callout>
          </Section>

          {/* Footer */}
          <div className="mt-8 text-center text-xs text-gray-400 pb-4">
            © {new Date().getFullYear()} StayHub Platform Pvt. Ltd. · All rights reserved ·{' '}
            <Link to="/privacy" className="hover:text-primary-500 transition">Privacy Policy</Link>
            {' · '}
            <a href="mailto:legal@stayhub.com" className="hover:text-primary-500 transition">
              legal@stayhub.com
            </a>
          </div>
        </main>
      </div>
    </div>
  );
}
