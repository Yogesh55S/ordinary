import { X } from 'lucide-react';

export default function ClientModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  categories,
  formErrors,
  editingClient
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
      ></div>
      
      {/* Modal Container */}
      <div className="relative bg-white dark:bg-[#111625] rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transition-all scale-100 border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200">
            {editingClient ? `Edit Client Profile` : `Add New Client`}
          </h3>
          <button 
            onClick={onClose}
            className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Business Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Business Name *</label>
              <input
                type="text"
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                className={`w-full px-3.5 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 dark:bg-[#0e1320] ${
                  formErrors.business_name 
                    ? 'border-rose-300 bg-rose-50/30 dark:border-rose-900/50 dark:bg-rose-950/10' 
                    : 'border-slate-200 dark:border-slate-800'
                }`}
                placeholder="Acme Corporation"
              />
              {formErrors.business_name && (
                <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 block">{formErrors.business_name}</span>
              )}
            </div>

            {/* Owner Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Owner Name</label>
              <input
                type="text"
                value={formData.owner_name}
                onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 dark:bg-[#0e1320]"
                placeholder="John Doe"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Phone Number (with Country Code) *</label>
              <input
                type="text"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className={`w-full px-3.5 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 dark:bg-[#0e1320] ${
                  formErrors.phone_number 
                    ? 'border-rose-300 bg-rose-50/30 dark:border-rose-900/50 dark:bg-rose-950/10' 
                    : 'border-slate-200 dark:border-slate-800'
                }`}
                placeholder="+919876543210"
              />
              {formErrors.phone_number && (
                <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 block">{formErrors.phone_number}</span>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 dark:bg-[#0e1320]"
                placeholder="john@acme.com"
              />
            </div>

            {/* Website */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Website URL</label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 dark:bg-[#0e1320]"
                placeholder="https://acme.com"
              />
            </div>

            {/* City */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 dark:bg-[#0e1320]"
                placeholder="Mumbai"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-805 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 dark:bg-[#0e1320]"
                placeholder="Retail / Tech / Agency"
                list="categories-datalist"
              />
              <datalist id="categories-datalist">
                {categories.map((c) => <option key={c} value={c} />)}
              </datalist>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Outreach Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-[#0e1320] text-slate-805 dark:text-slate-300"
              >
                <option value="New" className="dark:bg-[#111625] text-slate-800 dark:text-slate-200">New</option>
                <option value="Lead" className="dark:bg-[#111625] text-slate-800 dark:text-slate-200">Lead</option>
                <option value="Active" className="dark:bg-[#111625] text-slate-800 dark:text-slate-200">Active</option>
                <option value="Inactive" className="dark:bg-[#111625] text-slate-800 dark:text-slate-200">Inactive</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Tags (comma-separated)</label>
            <input
              type="text"
              value={formData.tagsString}
              onChange={(e) => setFormData({ ...formData, tagsString: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 dark:bg-[#0e1320]"
              placeholder="VIP, Retail, Local, June Out"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">CRM Profile Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 dark:bg-[#0e1320] resize-y"
              placeholder="Details regarding pricing conversation, dynamic message tags, specific scheduler requests..."
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#111625] transition-colors">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-sm transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-all"
            >
              {editingClient ? 'Save Changes' : 'Create Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
