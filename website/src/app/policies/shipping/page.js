import Link from 'next/link';
import { Truck, ShieldCheck, Clock, CheckCircle2, MapPin, AlertCircle } from 'lucide-react';
import { BRAND } from '@/theme/tokens';

export const metadata = {
  title: 'Shipping & Delivery Policy — TechCrate India',
  description: 'Fast domestic dispatch within 24-48 hours across 19,000+ Indian pincodes. Free express shipping on orders ₹499+.',
};

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3"
          style={{ backgroundColor: `${BRAND.navy}10`, color: BRAND.navy }}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Domestic Fulfillment Standards</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Shipping & Delivery Policy
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Last updated: October 2026 • Compliant with Consumer Protection (E-Commerce) Rules
        </p>
      </div>

      <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
        {/* Section 1 */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-sky-600" />
            <span>1. Dispatch Timelines & Same-Day Cutoff</span>
          </h2>
          <p>
            All electronic components, sensors, microcontrollers, and DIY maker kits are tested, ESD-packaged, and dispatched within <strong>24 to 48 business hours</strong> of payment confirmation. Orders placed before <strong>12:00 PM IST (Monday through Saturday)</strong> are dispatched on the same business day whenever stock is available in our fulfillment facility.
          </p>
        </section>

        {/* Section 2 */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-600" />
            <span>2. Delivery Charges & Free Shipping Threshold</span>
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li>
              <strong>Standard Courier Delivery:</strong> Flat rate of <strong>₹49</strong> per order across all serviceable pincodes in India.
            </li>
            <li>
              <strong>Free Express Shipping:</strong> Automatically applied to all orders with an item subtotal of <strong>₹499 or more</strong>.
            </li>
            <li>
              <strong>Estimated Transit Durations:</strong>
              <ul className="list-circle pl-5 mt-1 space-y-1">
                <li>Tier-1 Metro Cities (Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Pune, Kolkata): <strong>2 to 4 business days</strong>.</li>
                <li>Rest of India & Tier-2/Tier-3 Towns: <strong>3 to 6 business days</strong>.</li>
                <li>Special & Remote Regions (North-East, J&K, Island territories): <strong>5 to 8 business days</strong> via Speed Post / Surface Air.</li>
              </ul>
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-600" />
            <span>3. College Campus, Hostel & Lab Deliveries</span>
          </h2>
          <p>
            We regularly ship to engineering colleges, IITs, NITs, polytechnic institutions, and student residences across India. To guarantee hassle-free delivery:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>Clearly mention your <strong>Hostel Name / Room Number</strong> or <strong>Department Gate</strong> in Line 2 of your address.</li>
            <li>Provide a working <strong>10-digit mobile number</strong> so the courier executive can call for OTP verification or security gate handoff.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-teal-600" />
            <span>4. Logistics Partners & Real-Time Tracking</span>
          </h2>
          <p>
            Shipments are handled through tier-1 courier aggregators and express services including <strong>Delhivery, BlueDart, DTDC, Xpressbees, and India Post EMS</strong>. As soon as your parcel is picked up, an Air Waybill (AWB) number and direct tracking link are sent via SMS, email, and updated in your <Link href="/orders" className="text-brand-primary font-bold underline">Orders Dashboard</Link>.
          </p>
        </section>

        {/* Section 5 */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <span>5. Undelivered Parcels & Return to Origin (RTO)</span>
          </h2>
          <p>
            Couriers make up to 3 delivery attempts. If a shipment is returned to origin due to incorrect pincode, incomplete address, or customer unavailability, our support team will reach out for address re-verification. Re-dispatch charges may apply for re-shipment if the initial delivery address provided was invalid.
          </p>
        </section>
      </div>
    </div>
  );
}
