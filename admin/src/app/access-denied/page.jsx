import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] flex flex-col justify-center items-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-6 shadow-xs">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-[#032762] dark:text-blue-400 tracking-tight">
        Access Restricted
      </h1>
      <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md text-sm">
        Your assigned role does not hold authorization to access this operational module under the current security matrix.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primaryDark text-white font-semibold text-sm transition-all shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Permitted View
        </Link>
      </div>
    </div>
  );
}
