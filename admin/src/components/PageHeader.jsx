'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function PageHeader({
  title,
  subtitle,
  breadcrumbs = [],
  action,
  secondaryAction,
  icon: Icon,
  className = '',
}) {
  return (
    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 ${className}`}>
      <div className="space-y-1">
        {/* Optional Breadcrumb Trail */}
        {breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <Link href="/dashboard" className="hover:text-brand-primary transition-colors">
              Home
            </Link>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-brand-primary transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        {/* Title and Icon */}
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-brand-primary border border-blue-100 dark:border-blue-900/40">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#032762] dark:text-blue-400 tracking-tight">
            {title}
          </h1>
        </div>

        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
          {secondaryAction}
          {action}
        </div>
      )}
    </div>
  );
}
