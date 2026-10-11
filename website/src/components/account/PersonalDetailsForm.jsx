'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  GraduationCap,
  MapPin,
  Check,
  AlertCircle,
  Loader2,
  Save,
} from 'lucide-react';
import { BRAND } from '@/theme/tokens';

export default function PersonalDetailsForm({ user, onUpdateProfile }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    college: '',
    branch: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        college: user.college || '',
        branch: user.branch || '',
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        pincode: user.address?.pincode || '',
        country: user.address?.country || 'India',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSaveSuccess(false);
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');
    try {
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        college: formData.college.trim(),
        branch: formData.branch.trim(),
        address: {
          street: formData.street.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
          country: formData.country.trim() || 'India',
        },
      };

      const result = await onUpdateProfile(payload);
      if (result?.success || result) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
      } else {
        setErrorMessage(result?.message || 'Unable to update profile. Please try again.');
      }
    } catch (err) {
      setErrorMessage('Failed to save changes. Please check your connection.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Personal & Delivery Details
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Keep your contact info and delivery address up to date for checkout.
          </p>
        </div>

        {saveSuccess && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold animate-in fade-in">
            <Check className="w-3.5 h-3.5" />
            <span>Profile Saved Successfully!</span>
          </div>
        )}

        {errorMessage && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold animate-in fade-in">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6">
        {/* Sub-section 1: Personal Information */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
            <User className="w-3.5 h-3.5 text-blue-600" />
            <span>1. Personal & Contact Info</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Full name"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Mobile Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Mobile number"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        {/* Sub-section 2: Academic & Institutional Details */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
            <GraduationCap className="w-3.5 h-3.5 text-[#032762]" />
            <span>2. College / Organization Affiliation (Optional)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                College / Institution Name
              </label>
              <input
                type="text"
                name="college"
                value={formData.college}
                onChange={handleChange}
                placeholder="College or university (optional)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Branch / Department
              </label>
              <input
                type="text"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                placeholder="Branch or department (optional)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        {/* Sub-section 3: Default Shipping Address */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span>3. Default Shipping Address</span>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Street Address / Room / Landmark
              </label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                placeholder="Street address or building number"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:bg-white transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  PIN Code
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="6-digit PIN code"
                  maxLength={6}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:bg-white transition-all font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold text-xs uppercase tracking-wider shadow-sm active:scale-98 disabled:opacity-50 transition-all cursor-pointer"
            style={{ backgroundColor: BRAND.navy }}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
