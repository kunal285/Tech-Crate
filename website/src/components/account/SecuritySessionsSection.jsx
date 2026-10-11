'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Laptop,
  Key,
  Lock,
  Download,
  AlertTriangle,
  Check,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react';
import api from '@/lib/api';
import { BRAND } from '@/theme/tokens';

export default function SecuritySessionsSection({ user }) {
  // Sessions State
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [revokingId, setRevokingId] = useState(null);
  const [sessionMessage, setSessionMessage] = useState('');

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passFeedback, setPassFeedback] = useState({ type: '', text: '' });

  // Load real active sessions from backend
  const fetchSessions = async () => {
    try {
      setLoadingSessions(true);
      const res = await api.get('/auth/security/sessions');
      if (Array.isArray(res.data)) {
        setSessions(res.data);
      } else {
        setSessions([]);
      }
    } catch (err) {
      setSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevokeSession = async (sessionId) => {
    try {
      setRevokingId(sessionId);
      await api.delete(`/auth/security/sessions/${sessionId}`);
      setSessions((prev) => prev.filter((s) => s._id !== sessionId));
      setSessionMessage('Session successfully revoked.');
      setTimeout(() => setSessionMessage(''), 3000);
    } catch (err) {
      setSessionMessage('Failed to revoke session. It may have already expired.');
      setTimeout(() => setSessionMessage(''), 3000);
    } finally {
      setRevokingId(null);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassFeedback({ type: '', text: '' });

    if (!currentPassword) {
      setPassFeedback({ type: 'error', text: 'Please enter your current password.' });
      return;
    }

    if (newPassword.length < 6) {
      setPassFeedback({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassFeedback({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    try {
      setIsChangingPass(true);
      const res = await api.put('/auth/profile', {
        currentPassword,
        newPassword,
      });

      if (res.data) {
        setPassFeedback({
          type: 'success',
          text: 'Password updated successfully! Use your new password for future logins.',
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPassFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Password update failed. Please verify your current password.',
      });
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleExportData = () => {
    const dataToExport = {
      user: {
        name: user?.name,
        email: user?.email,
        phone: user?.phone,
        role: user?.role,
        college: user?.college,
        branch: user?.branch,
        address: user?.address,
        createdAt: user?.createdAt,
      },
      exportTimestamp: new Date().toISOString(),
      source: 'Tech Crate Account Data Portability Service',
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `techcrate_account_data_${String(user?._id || 'user').slice(-6)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* 1. Password & Authentication Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600" />
              <span>Password & Authentication</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your account password and security credentials.
            </p>
          </div>

          {/* 2FA Status Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-50 border border-slate-200 text-slate-700">
            {user?.twoFactorEnabled ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">2FA Active</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-600">2FA Disabled</span>
              </>
            )}
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="p-5 sm:p-6 space-y-4">
          {passFeedback.text && (
            <div
              className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                passFeedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {passFeedback.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{passFeedback.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isChangingPass}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-xs uppercase tracking-wider shadow-sm active:scale-98 disabled:opacity-50 transition-all cursor-pointer"
              style={{ backgroundColor: BRAND.navy }}
            >
              {isChangingPass ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Key className="w-4 h-4" />
              )}
              <span>{isChangingPass ? 'Updating...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Active Devices & Sessions Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Laptop className="w-4 h-4 text-emerald-600" />
              <span>Active Devices & Authorized Sessions</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Devices authenticated to access your Tech Crate account.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchSessions}
            disabled={loadingSessions}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Refresh Sessions"
          >
            <RefreshCw className={`w-4 h-4 ${loadingSessions ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {sessionMessage && (
          <div className="m-5 mb-0 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-blue-600" />
            <span>{sessionMessage}</span>
          </div>
        )}

        <div className="p-5 sm:p-6">
          {sessions.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {sessions.map((session) => (
                <div
                  key={session._id}
                  className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                      {session.deviceInfo?.toLowerCase().includes('mobile') ? (
                        <Smartphone className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Laptop className="w-5 h-5 text-[#032762]" />
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-slate-900">
                          {session.deviceInfo || 'Authorized Session'}
                        </span>
                        {session.isCurrent && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-100 text-emerald-800">
                            THIS DEVICE
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        {session.ipAddress && <span>IP: {session.ipAddress}</span>}
                        {session.lastActive && (
                          <>
                            <span>•</span>
                            <span>
                              Active:{' '}
                              {new Date(session.lastActive).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {!session.isCurrent && (
                    <button
                      type="button"
                      onClick={() => handleRevokeSession(session._id)}
                      disabled={revokingId === session._id}
                      className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors shrink-0 cursor-pointer"
                    >
                      {revokingId === session._id ? 'Revoking...' : 'Revoke'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500 text-xs space-y-1">
              <Laptop className="w-8 h-8 text-slate-300 mx-auto mb-1" />
              <p className="font-semibold text-slate-700">Current session active</p>
              <p className="text-[11px] text-slate-400">
                No additional remote sessions are logged in.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3. Account Data & Privacy Controls Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-sm font-bold text-slate-900">
            Account Data & Privacy Center
          </h3>
          <p className="text-xs text-slate-500">
            Export a machine-readable JSON copy of your authenticated user profile.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportData}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs active:scale-98 transition-all shrink-0 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-blue-600" />
          <span>Export My Data (JSON)</span>
        </button>
      </div>
    </div>
  );
}
