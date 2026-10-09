import Link from 'next/link';
import { Truck, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Shipping & Delivery Policy — TechCrate',
  description: 'Learn about TechCrate domestic dispatch times, campus deliveries, and free shipping rates.',
};

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-3">
          <Truck className="w-3.5 h-3.5" />
          <span>FULFILLMENT GUIDELINES</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Shipping & Delivery Policy</h1>
        <p className="text-sm text-slate-400 mt-1">Last updated: October 2026</p>
      </div>

      <div className="prose prose-invert max-w-none space-y-6 text-sm text-slate-300 leading-relaxed">
        <section className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-sky-400" />
            <span>1. Dispatch & Processing Timelines</span>
          </h2>
          <p>
            All electronic components, kits, and microcontrollers are packed and dispatched within <strong>24 to 48 business hours</strong> of payment confirmation. Orders placed before 12:00 PM IST on business days are dispatched on the same day whenever possible.
          </p>
        </section>

        <section className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-400" />
            <span>2. Delivery Rates & Free Shipping</span>
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
            <li><strong>Standard Delivery:</strong> Flat ₹49 delivery charge across all serviceable pincodes in India.</li>
            <li><strong>Free Express Delivery:</strong> Automatically applied to all orders with an item total of <strong>₹499 or more</strong>.</li>
            <li>Estimated delivery turnaround is <strong>2 to 4 business days</strong> for metro cities and <strong>3 to 6 business days</strong> for other locations.</li>
          </ul>
        </section>

        <section className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span>3. College Campus & Hostel Deliveries</span>
          </h2>
          <p>
            TechCrate specializes in delivering to engineering colleges, polytechnics, and universities across India. When entering your shipping address, please clearly include your <strong>Hostel Number, Room Number, or College Department Gate</strong> along with your active 10-digit phone number.
          </p>
        </section>

        <section className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-indigo-400" />
            <span>4. Tracking Your Consignment</span>
          </h2>
          <p>
            Once your order is picked up by our courier partners (Delhivery, BlueDart, DTDC, or Speed Post), you will receive a tracking link via email and your TechCrate <Link href="/orders" className="text-brand-primary underline">Orders Dashboard</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
