import { X, Paperclip, RefreshCw } from 'lucide-react';

export default function ScheduleModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  clients,
  templates,
  onTemplateChange,
  formErrors,
  editingSchedule,
  
  // Attachments props
  uploadingFile,
  uploadError,
  onFileUpload,
  onRemoveAttachment
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
      <div className="relative bg-white dark:bg-[#111625] rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transition-all border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            {editingSchedule ? 'Edit Schedule Event' : 'Create New Outreach Schedule'}
          </h3>
          <button 
            onClick={onClose}
            className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Client selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Target Client *</label>
              <select
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                className={`w-full px-3.5 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-[#0e1320] text-slate-800 dark:text-slate-300 ${
                  formErrors.client_id 
                    ? 'border-rose-300 bg-rose-50/30 dark:border-rose-900/50 dark:bg-rose-950/10' 
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <option value="" className="dark:bg-[#111625]">-- Choose Recipient --</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id} className="dark:bg-[#111625]">
                    {client.business_name} ({client.phone_number || client.email})
                  </option>
                ))}
              </select>
              {formErrors.client_id && (
                <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 block">{formErrors.client_id}</span>
              )}
            </div>

            {/* Template selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Predefined Template (Optional)</label>
              <select
                value={formData.template_id}
                onChange={onTemplateChange}
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-[#0e1320] text-slate-800 dark:text-slate-300"
              >
                <option value="" className="dark:bg-[#111625]">-- Custom Message (No Template) --</option>
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id} className="dark:bg-[#111625]">
                    {tpl.template_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Outreach Channel */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Outreach Channel *</label>
              <select
                value={formData.channel}
                onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-[#0e1320] text-slate-800 dark:text-slate-300"
              >
                <option value="whatsapp" className="dark:bg-[#111625]">WhatsApp Business Link</option>
                <option value="email" className="dark:bg-[#111625]">Email (SMTP Server)</option>
              </select>
            </div>

            {/* Email Subject Line (Conditional) */}
            {formData.channel === 'email' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Email Subject Line *</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className={`w-full px-3.5 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 dark:bg-[#0e1320] ${
                    formErrors.subject 
                      ? 'border-rose-300 bg-rose-50/30 dark:border-rose-900/50 dark:bg-rose-950/10' 
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                  placeholder="Demo Idea for your business"
                />
                {formErrors.subject && (
                  <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 block">{formErrors.subject}</span>
                )}
              </div>
            )}

            {/* Date picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Schedule Date *</label>
              <input
                type="date"
                value={formData.schedule_date}
                onChange={(e) => setFormData({ ...formData, schedule_date: e.target.value })}
                className={`w-full px-3.5 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 dark:bg-[#0e1320] ${
                  formErrors.schedule_date 
                    ? 'border-rose-300 bg-rose-50/30 dark:border-rose-900/50 dark:bg-rose-950/10' 
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              />
              {formErrors.schedule_date && (
                <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 block">{formErrors.schedule_date}</span>
              )}
            </div>

            {/* Time picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Schedule Time *</label>
              <input
                type="time"
                value={formData.schedule_time}
                onChange={(e) => setFormData({ ...formData, schedule_time: e.target.value })}
                className={`w-full px-3.5 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 dark:bg-[#0e1320] ${
                  formErrors.schedule_time 
                    ? 'border-rose-300 bg-rose-50/30 dark:border-rose-900/50 dark:bg-rose-950/10' 
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              />
              {formErrors.schedule_time && (
                <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 block">{formErrors.schedule_time}</span>
              )}
            </div>
          </div>

          {/* Message content editor */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Message Content *</label>
            <textarea
              value={formData.custom_message}
              onChange={(e) => setFormData({ ...formData, custom_message: e.target.value })}
              rows={5}
              className={`w-full px-3.5 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 dark:bg-[#0e1320] font-mono ${
                formErrors.custom_message 
                  ? 'border-rose-300 bg-rose-50/30 dark:border-rose-900/50 dark:bg-rose-950/10' 
                  : 'border-slate-200 dark:border-slate-800'
              }`}
              placeholder="Insert custom content or load a template above..."
            />
            {formErrors.custom_message && (
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 block">{formErrors.custom_message}</span>
            )}
          </div>

          {/* Attachments Section */}
          <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase block font-bold">Outreach Attachments</label>
            <div className="flex items-center space-x-3">
              <label className="cursor-pointer inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-50 dark:bg-[#0e1320] hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors">
                <Paperclip className="h-3.5 w-3.5" />
                <span>Add Files</span>
                <input
                  type="file"
                  multiple
                  onChange={onFileUpload}
                  disabled={uploadingFile}
                  className="hidden"
                />
              </label>
              {uploadingFile && (
                <div className="flex items-center space-x-1.5 text-xs text-indigo-600 dark:text-indigo-400 animate-pulse font-semibold">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Uploading files to cloud...</span>
                </div>
              )}
            </div>
            {uploadError && (
              <p className="text-xs text-rose-600 font-bold mt-1">{uploadError}</p>
            )}

            {/* Attached Files List */}
            {formData.attachments && formData.attachments.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {formData.attachments.map((file) => (
                  <div 
                    key={file.id} 
                    className="flex items-center justify-between bg-slate-50 dark:bg-[#0e1320] border border-slate-200 dark:border-slate-800/80 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-350"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <Paperclip className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate font-semibold text-slate-750 dark:text-slate-300" title={file.file_name}>{file.file_name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveAttachment(file.id)}
                      className="ml-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full p-1 leading-none"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#111625]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-sm transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploadingFile}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-all disabled:opacity-50"
            >
              {editingSchedule ? 'Save Changes' : 'Schedule Outreach'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
