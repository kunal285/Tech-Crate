import Link from 'next/link';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] flex flex-col justify-center items-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-brand-primary mb-6 shadow-xs">
        <FileQuestion className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-[#032762] dark:text-blue-400 tracking-tight">404</h1>
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-2">Section Not Found</h2>
      <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md text-sm">
        The requested admin dashboard view, resource, or identifier does not exist or has been relocated.
      </p>
      <div className="mt-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primaryDark text-white font-semibold text-sm transition-all shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
