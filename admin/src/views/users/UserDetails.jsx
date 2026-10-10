'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Mail,
  GraduationCap,
  Calendar,
  Phone,
  ShieldCheck,
  AlertCircle,
  Building,
} from 'lucide-react';
import { userService } from '../../services/userService';

export default function UserDetails() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const data = await userService.getUserById(id);
      setUser(data);
    } catch (err) {
      console.error('[Load User Error]', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-3xl space-y-4">
        <div className="h-6 w-32 bg-slate-800 rounded animate-pulse"></div>
        <div className="h-64 bg-slate-900 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">User Record Not Found</h2>
        <button
          onClick={() => router.push('/users')}
          className="px-4 py-2 rounded-xl bg-slate-800 text-white text-sm"
        >
          Back to User List
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-3xl">
      <button
        onClick={() => router.push('/users')}
        className="flex items-center gap-2 text-sm text-cyan-400 font-semibold hover:underline"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Users
      </button>

      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-3xl font-extrabold flex-shrink-0">
            {user.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-white">{user.name}</h1>
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                  user.role === 'admin'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : user.role === 'seller'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                }`}
              >
                {user.role || 'customer'}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-500" /> {user.email}
            </p>
          </div>
        </div>

        {/* Academic / Profile Details */}
        <div className="border-t border-slate-800/80 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 uppercase font-semibold flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-cyan-400" /> College / Institution
            </span>
            <p className="text-white font-medium">{user.college || 'Not specified'}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 uppercase font-semibold flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-cyan-400" /> Engineering Branch & Year
            </span>
            <p className="text-white font-medium">
              {user.branch || 'General Engineering'} {user.year ? `• Year ${user.year}` : ''}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 uppercase font-semibold flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-cyan-400" /> Phone Contact
            </span>
            <p className="text-white font-medium">{user.phone || 'Not verified'}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 uppercase font-semibold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Account Created
            </span>
            <p className="text-white font-medium">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active Member'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
