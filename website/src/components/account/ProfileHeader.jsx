'use client';

import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  ShieldAlert,
  GraduationCap,
  Copy,
  Check,
  Calendar,
  Edit3,
} from 'lucide-react';
import { BRAND } from '@/theme/tokens';

export default function ProfileHeader({ user, onEditProfileClick }) {
  const [copiedId, setCopiedId] = useState(false);

  const displayName = user?.name?.trim() || (user?.email ? user.email.split('@')[0] : 'Account');
  const displayEmail = user?.email || null;
  const displayPhone = user?.phone
    ? user.phone.replace(/(\+?\d{2,3})?(\d{2})(\d{4,6})(\d{2})/, '$1 $2****$4')
    : null;
  const userRole = user?.role ? String(user.role).toUpperCase() : null;
  const userId = user?._id || user?.id;
  const userIdStr = userId ? String(userId).slice(-8) : null;

  const isVerified = Boolean(user?.isEmailVerified || user?.isPhoneVerified);

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', {
        month: 'short',
        year: 'numeric',
      })
    : null;

  const handleCopyId = () => {
    if (!userId) return;
    navigator.clipboard.writeText(String(userId));
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5 text-center sm:text-left">
        {/* Left: Avatar & Real User Identity */}
        <div className="flex flex-col sm:flex-row items-center gap-4.5">
          {/* Avatar with optional role chip */}
          <div className="relative shrink-0">
            {user?.avatar && !user.avatar.includes('unsplash') ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar}
                alt={displayName}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-200 shadow-xs"
              />
            ) : (
              <div
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-white font-black text-2xl tracking-tight shadow-xs select-none"
                style={{ backgroundColor: BRAND.navy }}
              >
                {displayName ? displayName.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
              </div>
            )}
            {userRole && (
              <div
                className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase text-white shadow-2xs tracking-wide"
                style={{ backgroundColor: BRAND.orange }}
              >
                {userRole}
              </div>
            )}
          </div>

          {/* User Details */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {displayName}
              </h1>

              {/* Real Verification Status */}
              {isVerified ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Verified</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  <ShieldAlert className="w-3 h-3 text-slate-500" />
                  <span>Unverified</span>
                </span>
              )}
            </div>

            {(displayEmail || displayPhone) && (
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-xs text-slate-500">
                {displayEmail && <span>{displayEmail}</span>}
                {displayEmail && displayPhone && <span className="text-slate-300">•</span>}
                {displayPhone && <span>{displayPhone}</span>}
              </div>
            )}

            {/* Badges / Chips Row — only show if real data exists */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              {/* ID Pill with Copy */}
              {userIdStr && (
                <button
                  type="button"
                  onClick={handleCopyId}
                  title="Click to copy User ID"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors cursor-pointer"
                >
                  <span>ID: {userIdStr}</span>
                  {copiedId ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3 text-sky-600" />
                  )}
                  {copiedId && <span className="text-[10px] text-emerald-600">Copied</span>}
                </button>
              )}

              {/* College / Institute Tag if genuinely present in user data */}
              {user?.college && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-50 border border-slate-200 text-slate-700">
                  <GraduationCap className="w-3.5 h-3.5 text-[#032762]" />
                  <span className="truncate max-w-[200px]">{user.college}</span>
                </div>
              )}

              {/* Member Since — only if real creation date exists */}
              {memberSince && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-50 border border-slate-200 text-slate-500">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>Joined {memberSince}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Quick Edit Action */}
        {onEditProfileClick && (
          <button
            type="button"
            onClick={onEditProfileClick}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:scale-98 transition-all shrink-0 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>
    </div>
  );
}
