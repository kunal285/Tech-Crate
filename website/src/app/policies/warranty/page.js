import Link from 'next/link';
import { ShieldCheck, Award, Wrench, CheckCircle2, AlertTriangle } from 'lucide-react';
import { BRAND } from '@/theme/tokens';

export const metadata = {
  title: 'Warranty & Quality Assurance — TechCrate India',
  description: 'Verified authentic silicon, factory testing standards, and 7-day hardware replacement warranty on TechCrate.',
};

export default function WarrantyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3"
          style={{ backgroundColor: `${BRAND.primary}12`, color: BRAND.primary }}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Quality Standard</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Warranty & Quality Assurance
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Authentic maker silicon, quality testing protocols, and student-focused engineering support
        </p>
      </div>

      <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
        {/* Section 1 */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>1. 100% Genuine Silicon & Authentic Modules</span>
          </h2>
          <p>
            At TechCrate, every microcontroller (ESP32 by Espressif, Arduino by official authorized channels, RP2040 by Raspberry Pi Foundation) and sensor module is sourced directly from certified semiconductor distributors. We do not sell counterfeit or factory reject ICs.
          </p>
          <p>
            All critical development boards are batch-verified on test fixtures for power-on self-test (POST) and serial baud rate response before warehousing.
          </p>
        </section>

        {/* Section 2 */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-sky-600" />
            <span>2. 7-Day Replacement Warranty on Prototyping Hardware</span>
          </h2>
          <p>
            Because prototyping modules are designed for hands-on experimentation on solderless breadboards, PCBs, and custom circuits, they are covered under our <strong>7-Day Dead On Arrival (DOA) / Manufacturing Defect Warranty</strong>.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
            <li>Defective crystals, non-responsive bootloader ROMs, or non-functional integrated LDO voltage regulators.</li>
            <li>Sensors with internal open circuits or erratic I2C communication upon first breadboard test.</li>
            <li>Incomplete kit contents or missing accessories identified upon delivery unboxing.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>3. Technical Support & Debugging Assistance</span>
          </h2>
          <p>
            Before concluding that a module is defective, our community hardware engineers provide <strong>free debugging guidance</strong>. More than 80% of perceived hardware issues in educational robotics are resolved by verifying:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
            <li>USB to UART driver installation (CH340G, CP2102, FTDI drivers for Windows and macOS).</li>
            <li>Microcontroller bootloader strapping pins (e.g. GPIO0 pulled LOW on ESP32 during flashing).</li>
            <li>Logic level mismatches (e.g. interfacing a 3.3V SPI sensor with a 5V Arduino Uno without a level shifter).</li>
          </ul>
          <p className="pt-2">
            Reach out via our <Link href="/contact" className="text-brand-primary font-bold underline">Contact & Engineering Support Desk</Link> with your wiring schematics and code for prompt assistance.
          </p>
        </section>
      </div>
    </div>
  );
}
