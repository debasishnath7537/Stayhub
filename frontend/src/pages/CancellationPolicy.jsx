import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building, ChevronDown, ChevronUp, FileText,
  LogIn, LogOut, XCircle, Baby, PawPrint, ShieldAlert,
  Phone, Mail, AlertTriangle, Clock, Users, Cigarette, BookOpen
} from 'lucide-react';

const LAST_UPDATED = '04/03/2025';

const Section = ({ icon: Icon, title, children, defaultOpen = false, color = 'primary' }) => {
  const [open, setOpen] = useState(defaultOpen);
  const colors = {
    primary: 'bg-primary-50 text-primary-600',
    amber:   'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    red:     'bg-red-50 text-red-600',
    blue:    'bg-blue-50 text-blue-600',
    purple:  'bg-purple-50 text-purple-600',
  };
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden mb-4">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex justify-between items-center px-6 py-4 bg-gray-50 hover:bg-gray-100 transition text-left gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colors[color]}`}>
            <Icon className="w-4 h-4" />
          </div>
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />}
      </button>
      {open && <div className="px-6 py-5 text-sm text-gray-700 space-y-3 leading-relaxed">{children}</div>}
    </div>
  );
};

const Bullet = ({ children }) => (
  <li className="flex gap-2 items-start mb-1.5">
    <span className="text-primary-500 mt-0.5 shrink-0">•</span><span>{children}</span>
  </li>
);

const Alpha = ({ letter, children }) => (
  <div className="flex gap-3 mb-2">
    <span className="font-bold text-primary-600 shrink-0">{letter}.</span><span>{children}</span>
  </div>
);

const Callout = ({ children, type = 'info' }) => {
  const s = {
    info:   'bg-blue-50 border-blue-100 text-blue-800',
    warn:   'bg-amber-50 border-amber-100 text-amber-800',
    danger: 'bg-red-50 border-red-100 text-red-800',
    green:  'bg-emerald-50 border-emerald-100 text-emerald-800',
  };
  return <div className={`border rounded-xl px-4 py-3 text-xs mt-3 ${s[type]}`}>{children}</div>;
};

const Table = ({ headers, rows }) => (
  <div className="overflow-x-auto mt-2">
    <table className="w-full text-xs border border-gray-200 rounded-xl overflow-hidden">
      <thead className="bg-gray-100 text-gray-600">
        <tr>{headers.map(h => <th key={h} className="px-4 py-2 text-left font-semibold">{h}</th>)}</tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {rows.map((r, i) => (
          <tr key={i} className="hover:bg-gray-50">
            {r.map((c, j) => <td key={j} className="px-4 py-2">{c}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default function CancellationPolicy() {
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
            <FileText className="w-7 h-7 text-primary-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Guest Policies &amp; Cancellation Policy</h1>
          <p className="text-gray-500 mt-2 text-sm">Last updated: {LAST_UPDATED}</p>
          <p className="text-gray-600 mt-4 max-w-xl mx-auto text-sm leading-relaxed">
            Policies for Hotels and Homestays listed on StayHub across India. Please read these carefully before making a booking.
          </p>
        </div>

        {/* General Booking Policy */}
        <Section icon={BookOpen} title="General Booking Policy" defaultOpen color="primary">
          <ul className="space-y-1">
            <Bullet>Certain destinations may have different travel guidelines for specific times of year. Please abide by all applicable laws and guidelines.</Bullet>
            <Bullet>Policies are booking-specific and will be communicated to the guest at the time of booking or upon check-in.</Bullet>
            <Bullet>Reference to "StayHub" includes its affiliates, employees and officers. "Property" refers to the hotel or homestay where you have made a valid booking through StayHub.</Bullet>
          </ul>
          <Callout type="info">
            📞 Need help creating a new booking? Our support team is available <strong>24×7</strong>.<br />
            Call: <strong>+91-XXXXXXXXXX</strong> &nbsp;|&nbsp; Email: <a href="mailto:support@stayhub.com" className="underline">support@stayhub.com</a>
          </Callout>
          <Callout type="warn">
            📞 To cancel or change a reservation made through StayHub app, website or call centre:<br />
            Call: <strong>+91-XXXXXXXXXX</strong> &nbsp;|&nbsp; Email: <a href="mailto:support@stayhub.com" className="underline">support@stayhub.com</a>
          </Callout>
        </Section>

        {/* Check-in Policy */}
        <Section icon={LogIn} title="Check-In Policy" color="emerald">
          <ul className="space-y-1">
            <Bullet>The primary guest must be at least <strong>18 years of age</strong> to check in.</Bullet>
            <Bullet>Standard check-in time is <strong>12:00 noon</strong>. You may check in at any time after that while your reservation is valid.</Bullet>
            <Bullet>All guests above 18 must present a valid government-issued photo ID at check-in. Accepted IDs: <strong>Aadhaar Card, Driving Licence, Voter ID Card, Passport</strong>. PAN card is <strong>not</strong> accepted.</Bullet>
            <Bullet>Without an original valid ID, check-in will not be permitted.</Bullet>
          </ul>
          <p className="font-semibold text-gray-800 mt-4">If you face difficulty checking in:</p>
          <ul className="space-y-1 mt-2">
            <Alpha letter="a">StayHub will try to arrange accommodation in the same property</Alpha>
            <Alpha letter="b">StayHub will try to provide alternate accommodation in another listed property if available</Alpha>
            <Alpha letter="c">If alternate accommodation cannot be arranged or is not accepted, a full refund may be offered</Alpha>
            <Alpha letter="d">StayHub will not be liable for compensation beyond your booking payment</Alpha>
          </ul>
          <Callout type="warn">
            StayHub shall not be held liable to refund the booking amount in case of unavailability due to natural disasters (earthquake, landslide etc.), terrorist activity, government guidelines, or any Force Majeure event beyond StayHub's control.
          </Callout>
        </Section>

        {/* Early Check-in & Late Check-out */}
        <Section icon={Clock} title="Early Check-In &amp; Late Check-Out" color="blue">
          <p className="font-semibold text-gray-800">1. Early Check-In</p>
          <p className="text-gray-600 mt-1 mb-2">Standard check-in is 12:00 noon. Early check-in is subject to availability. Extra charges apply as below:</p>
          <Table
            headers={['Check-in Time', 'Early Check-In Charges']}
            rows={[
              ['Before 6:00 AM', '100% of previous night\'s room rate'],
              ['6:00 AM – 10:00 AM', 'Up to 30% of previous day\'s room rate (hotel policy applies; min. ₹200)'],
              ['10:00 AM – 12:00 Noon', 'Complimentary (subject to availability)'],
            ]}
          />
          <Callout type="warn">Complimentary breakfast will <strong>not</strong> be available for the day of early check-in.</Callout>

          <p className="font-semibold text-gray-800 mt-5">2. Late Check-Out</p>
          <p className="text-gray-600 mt-1 mb-2">Standard check-out is 11:00 AM. Late check-out is subject to availability and cannot be confirmed in advance.</p>
          <Table
            headers={['Check-out Time', 'Late Check-Out Charges']}
            rows={[
              ['11:00 AM – 1:00 PM', 'Complimentary (subject to availability)'],
              ['1:00 PM – 5:00 PM', 'Up to 30% of current day\'s room rate (hotel policy applies; min. ₹300)'],
              ['After 5:00 PM', '100% of current day\'s room rate'],
            ]}
          />
        </Section>

        {/* Booking Extension */}
        <Section icon={BookOpen} title="Booking Extension Policy" color="purple">
          <p>
            Any extension of stay at the property is subject to availability of rooms at the <strong>current ongoing rate</strong>, not the rate at which the original booking was made.
          </p>
        </Section>

        {/* Cancellation Policy */}
        <Section icon={XCircle} title="Cancellation Policy" color="red">
          <ol className="list-decimal pl-5 space-y-3">
            <li>You can cancel your booking through the StayHub website or mobile app.</li>
            <li>The applicable refund amount will be credited within <strong>7–14 working days</strong> to your original payment method.</li>
            <li>
              Some properties do not accept bookings from certain guest categories or do not accept local IDs. This information is available before booking.
              For cancellations or check-in denials related to such bookings, StayHub shall be under <strong>no obligation to refund</strong> any amount.
            </li>
            <li>
              Properties reserve the right to deny check-in where guests cannot provide a valid government ID, where minor guests travel unaccompanied, or where the property is suspicious of the nature of the visit. In such cases, StayHub shall be under <strong>no obligation to refund</strong>.
            </li>
            <li>For corporate bookings, the cancellation policy mentioned in your corporate contract will apply.</li>
            <li>
              If no specific cancellation policy is mentioned on the property details page, please refer to your <strong>booking voucher</strong> for the applicable policy.
            </li>
          </ol>

          <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2 text-xs">
            <p className="font-bold text-gray-700">No Show Policy</p>
            <p className="text-gray-600">For booking-specific no-show policy, please refer to your booking voucher.</p>
            <p className="font-bold text-gray-700 mt-3">Long Stay Bookings (7+ nights)</p>
            <p className="text-gray-600">All outstanding payments must be settled on a weekly basis. Further accommodation is subject to timely settlement of the outstanding amount.</p>
          </div>
        </Section>

        {/* Triple Occupancy */}
        <Section icon={Users} title="Triple Occupancy Policy" color="blue">
          <p>
            Some properties allow triple occupancy by providing an extra mattress for the third person for an additional fee.
            However, no extra bed is usually provided. Please check the property listing or contact StayHub support to confirm availability before booking.
          </p>
        </Section>

        {/* Visitors Policy */}
        <Section icon={Users} title="Visitors Policy" color="primary">
          <p>Please check with your property for its specific visitor policy. StayHub encourages properties to follow this guideline:</p>
          <ul className="mt-3 space-y-1">
            <Alpha letter="a">Visitors are generally allowed to meet guests in guest rooms during the day, except in emergency cases</Alpha>
            <Alpha letter="b">Visitors are not permitted to stay overnight</Alpha>
            <Alpha letter="c">All visitors must present a government-approved photo ID before accessing guest floors or rooms</Alpha>
          </ul>
        </Section>

        {/* Child Policy */}
        <Section icon={Baby} title="Child Policy" color="emerald">
          <ul className="space-y-1">
            <Bullet>Stay of <strong>1 child up to 5 years of age</strong> is complimentary without use of an extra mattress.</Bullet>
            <Bullet>Breakfast charges may be applicable for the child.</Bullet>
            <Bullet>Please check with the property for specific child policies before booking.</Bullet>
          </ul>
        </Section>

        {/* Pet Policy */}
        <Section icon={PawPrint} title="Pet Policy" color="amber">
          <Callout type="warn">Applicable on select StayHub-serviced properties only. Check the property listing before booking.</Callout>
          <ul className="mt-4 space-y-1">
            <Bullet>Pets must be vaccinated — vaccination certificate required at check-in</Bullet>
            <Bullet>Pets must be kept on a leash in all common areas</Bullet>
            <Bullet>Only pet dogs and cats are welcome</Bullet>
            <Bullet>Maximum of 1 pet per booking</Bullet>
            <Bullet>Pet food is not available at the property</Bullet>
            <Bullet>Pets are <strong>not allowed</strong> on beds, in the swimming pool, or in the restaurant</Bullet>
            <Bullet>Guests must ensure no inconvenience is caused to fellow guests</Bullet>
            <Bullet>Additional cleaning charges or penalties may apply if pets cause damage</Bullet>
            <Bullet>Guests must carry poop bags and muzzles</Bullet>
          </ul>
        </Section>

        {/* Service On-Time */}
        <Section icon={Clock} title="Service On-Time Guarantee" color="emerald">
          <p>
            Select StayHub-listed properties carry the <strong>Service On-Time</strong> tag. For these properties:
          </p>
          <ul className="mt-3 space-y-1">
            <Bullet>If you face any issue during your stay, we promise resolution within <strong>1 hour</strong> or we will provide a refund</Bullet>
            <Bullet>If the issue cannot be resolved, we will offer a room change within the same property or a shift to a different listed property</Bullet>
            <Bullet>Refund amounts are subject to the severity of the issue and assessed as per StayHub's guidelines</Bullet>
          </ul>
          <Callout type="info">
            To register an issue: Call <strong>+91-XXXXXXXXXX</strong> or email{' '}
            <a href="mailto:support@stayhub.com" className="underline">support@stayhub.com</a><br />
            Currently available in select properties in: Bengaluru, Kolkata, Delhi, Gurugram, Hyderabad, Lucknow.
          </Callout>
        </Section>

        {/* Code of Conduct */}
        <Section icon={ShieldAlert} title="Code of Conduct" color="red">
          <p>Illegal activities are strictly prohibited in any StayHub-listed property. The property reserves the right to refuse service or evict a guest for:</p>
          <ul className="mt-3 space-y-1">
            <Alpha letter="a">Refusal or failure to pay for accommodation</Alpha>
            <Alpha letter="b">Disorderly conduct that disturbs the peace of other guests</Alpha>
            <Alpha letter="c">Destruction, damage or defacement of property or threats of harm</Alpha>
            <Alpha letter="d">Any actions deemed inappropriate by the property management</Alpha>
          </ul>
          <p className="mt-3">Please maintain the property in good condition. You may be held liable for any damage to property assets (except normal wear and tear).</p>
        </Section>

        {/* Smoking, Drugs, Alcohol */}
        <Section icon={Cigarette} title="Smoking, Drugs &amp; Alcohol Policy" color="red">
          <ul className="space-y-2">
            <Bullet>Smoking is prohibited in StayHub Townhouse properties and may be restricted in other properties — check with the front desk.</Bullet>
            <Bullet>
              Anyone found using or under the influence of illegal drugs or substances classified under the <em>Narcotic Drugs and Psychotropic Substances Act, 1985</em> will be reported to the police and asked to leave.
            </Bullet>
            <Bullet>
              Alcohol consumption is prohibited in all public areas including lobbies, hallways and parking areas. Please consult the property front desk regarding consumption within your room, without disturbing other guests or the property's discipline.
            </Bullet>
          </ul>
        </Section>

        {/* Safety */}
        <Section icon={ShieldAlert} title="Safety &amp; Security" color="amber">
          <ol className="list-decimal pl-5 space-y-2">
            <li>For your safety, please follow all fire safety and emergency response procedures as directed by property staff.</li>
            <li>StayHub and the property are <strong>not liable</strong> for lost, misplaced, damaged or stolen valuables or belongings.</li>
          </ol>
          <Callout type="green">
            🆘 The StayHub app includes an <strong>SOS button</strong> that activates upon check-in. Use it immediately in case of any emergency during your stay.
          </Callout>
        </Section>

        {/* Contact Policies */}
        <Section icon={Phone} title="Contact &amp; Communication Policy" color="blue">
          <ul className="space-y-1">
            <Bullet>StayHub may contact you before check-in to confirm your arrival status or arrival time via calls or messages.</Bullet>
            <Bullet>If StayHub does not receive a response after multiple attempts, your booking may be placed on hold or cancelled. Contact StayHub to reinstate your booking (subject to availability).</Bullet>
            <Bullet>We may reach out for feedback about your stay experience.</Bullet>
            <Bullet>We may occasionally reach out with relevant offers and deals.</Bullet>
          </ul>
        </Section>

        {/* Fraud Warning */}
        <Section icon={AlertTriangle} title="Beware of Fraud" color="red">
          <p>
            StayHub does <strong>not</strong> authorise any employee, consultant, third-party vendor or associate
            to collect payment through any gateway other than the official StayHub payment gateway and
            its affiliated OTA payment gateway links.
          </p>
          <p>
            Any attempt to collect payment via unauthorised gateways is an act of fraud. StayHub will not be
            responsible for any loss or liability arising from such fraudulent transactions.
          </p>
          <Callout type="danger">
            ⚠️ If you encounter a suspicious payment request, do not proceed. Contact StayHub support immediately at{' '}
            <a href="mailto:support@stayhub.com" className="underline font-semibold">support@stayhub.com</a>
          </Callout>
        </Section>

        {/* Contact & Grievances */}
        <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="font-extrabold text-gray-900 text-lg mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary-600" /> Contact &amp; Grievances
          </h3>
          <p className="text-sm text-gray-600 mb-5">
            While StayHub works with property partners to enable a comfortable stay, if your concern is not resolved
            by the property, you may escalate to StayHub. <strong>No complaint will be entertained post check-out.</strong>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: Phone, label: '24×7 Support', value: '+91-XXXXXXXXXX', href: 'tel:+91XXXXXXXXXX' },
              { icon: Mail,  label: 'Support Email', value: 'support@stayhub.com', href: 'mailto:support@stayhub.com' },
              { icon: Mail,  label: 'Grievances Email', value: 'grievances@stayhub.com', href: 'mailto:grievances@stayhub.com' },
              { icon: Phone, label: 'Grievance Officer', value: 'Contact via email', href: 'mailto:grievances@stayhub.com' },
            ].map(({ icon: Icon, label, value, href }) => (
              <a key={label} href={href}
                className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 hover:border-primary-300 hover:bg-primary-50 transition">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-sm font-semibold text-gray-800">{value}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} StayHub Platform Pvt. Ltd. · All rights reserved ·{' '}
          <Link to="/privacy" className="hover:text-primary-500 transition">Privacy Policy</Link>
          {' · '}
          <Link to="/terms" className="hover:text-primary-500 transition">Terms of Service</Link>
        </div>
      </div>
    </div>
  );
}
