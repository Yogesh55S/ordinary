'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { X, UserPlus, Globe, MapPin, Phone, Mail, Building2 } from 'lucide-react';
import { mapPlaceTypeToCategory, extractCityFromAddress } from '@/lib/placeUtils';

const STATUS_OPTIONS = ['New', 'Lead', 'Active', 'Inactive', 'Archived'];

function buildInitialForm(place) {
  const city = extractCityFromAddress(place.formatted_address);
  const category = mapPlaceTypeToCategory(place.types);
  const noteLines = ['Google Maps Source', `Address: ${place.formatted_address || ''}`];
  if (place.rating != null) noteLines.push(`Google Rating: ${place.rating}/5`);

  return {
    business_name: place.name || '',
    owner_name: '',
    phone_number: place.formatted_phone_number || '',
    email: '',
    website: place.website || '',
    city,
    category,
    notes: noteLines.join('\n'),
    status: 'Lead',
  };
}

function InputField({ label, icon: Icon, required, error, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <div className={Icon ? 'relative' : undefined}>
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />}
        {children}
      </div>
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  );
}

const inputClass = (hasIcon, hasError) =>
  `w-full ${hasIcon ? 'pl-9' : 'px-4'} pr-4 py-2.5 text-sm rounded-xl border ${
    hasError
      ? 'border-rose-400 dark:border-rose-500'
      : 'border-slate-200 dark:border-slate-700'
  } bg-white dark:bg-[#0e1320] text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors`;

export default function AddClientModal({ place, onClose, onSuccess }) {
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (place) {
      setForm(buildInitialForm(place));
      setErrors({});
    }
  }, [place]);

  if (!place || !form) return null;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.business_name.trim()) e.business_name = 'Business name is required';
    const phone = form.phone_number.replace(/[\s\-().+]/g, '');
    if (form.phone_number.trim() && !/^\+?\d{8,15}$/.test(form.phone_number.replace(/[\s\-()]/g, ''))) {
      e.phone_number = 'Enter a valid phone number with country code (e.g. +919876543210)';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        business_name: form.business_name.trim(),
        owner_name: form.owner_name.trim() || null,
        phone_number: form.phone_number.replace(/[\s\-()]/g, '') || null,
        email: form.email.trim() || null,
        website: form.website.trim() || null,
        city: form.city.trim() || null,
        category: form.category.trim() || null,
        tags: [],
        notes: form.notes.trim() || null,
        status: form.status,
        updated_at: new Date().toISOString(),
      };

      const { error: insertError } = await supabase.from('clients').insert(payload);
      if (insertError) throw insertError;

      await supabase.from('activity_logs').insert({
        action_type: 'Created Client',
        details: `Added "${payload.business_name}" from Prospect Finder (Google Maps).`,
      });

      onSuccess(payload.business_name);
    } catch (err) {
      alert('Failed to add client: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#111625] rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-[#111625] z-10">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
              <UserPlus className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Add as Client</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Review extracted details before saving</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <InputField label="Business Name" icon={Building2} required error={errors.business_name}>
            <input
              type="text"
              value={form.business_name}
              onChange={set('business_name')}
              className={inputClass(true, !!errors.business_name)}
            />
          </InputField>

          <InputField label="Owner / Contact Name">
            <input
              type="text"
              value={form.owner_name}
              onChange={set('owner_name')}
              placeholder="Optional"
              className={inputClass(false, false)}
            />
          </InputField>

          <InputField label="Phone Number" icon={Phone} error={errors.phone_number}>
            <input
              type="text"
              value={form.phone_number}
              onChange={set('phone_number')}
              placeholder="+91XXXXXXXXXX"
              className={inputClass(true, !!errors.phone_number)}
            />
          </InputField>

          <InputField label="Email" icon={Mail}>
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="Optional"
              className={inputClass(true, false)}
            />
          </InputField>

          <InputField label="Website" icon={Globe}>
            <input
              type="text"
              value={form.website}
              onChange={set('website')}
              placeholder="https://..."
              className={inputClass(true, false)}
            />
          </InputField>

          <div className="grid grid-cols-2 gap-3">
            <InputField label="City" icon={MapPin}>
              <input
                type="text"
                value={form.city}
                onChange={set('city')}
                className={inputClass(true, false)}
              />
            </InputField>
            <InputField label="Category">
              <input
                type="text"
                value={form.category}
                onChange={set('category')}
                className={inputClass(false, false)}
              />
            </InputField>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
            <select
              value={form.status}
              onChange={set('status')}
              className={inputClass(false, false)}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Notes</label>
            <textarea
              value={form.notes}
              onChange={set('notes')}
              rows={3}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0e1320] text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 resize-none transition-colors"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl text-sm shadow-sm transition-all"
            >
              <UserPlus className="h-4 w-4 shrink-0" />
              <span>{saving ? 'Saving...' : 'Add as Client'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
