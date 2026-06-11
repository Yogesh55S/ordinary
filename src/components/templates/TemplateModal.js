import { X, HelpCircle, Paperclip, RefreshCw } from 'lucide-react';

export default function TemplateModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  categories,
  formErrors,
  editingTemplate,
  
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
            {editingTemplate ? `Edit Template` : `Create Template`}
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
            {/* Template Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Template Name *</label>
              <input
                type="text"
                value={formData.template_name}
                onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
                className={`w-full px-3.5 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 dark:bg-[#0e1320] ${
                  formErrors.template_name 
                    ? 'border-rose-300 bg-rose-50/30 dark:border-rose-900/50 dark:bg-rose-950/10' 
                    : 'border-slate-200 dark:border-slate-800'
                }`}
                placeholder="Welcome Message / Follow Up"
              />
              {formErrors.template_name && (
                <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 block">{formErrors.template_name}</span>
              )}
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 dark:bg-[#0e1320]"
                placeholder="Onboarding / Follow-up / Marketing"
                list="template-categories"
              />
              <datalist id="template-categories">
                {categories.map((c) => <option key={c} value={c} />)}
              </datalist>
            </div>

            {/* Outreach Channel */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Template Channel *</label>
              <select
                value={formData.channel}
                onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-[#0e1320] text-slate-800 dark:text-slate-300"
              >
                <option value="whatsapp">WhatsApp Template</option>
                <option value="email">Email Template</option>
              </select>
            </div>

            {/* Default Email Subject Line (Conditional) */}
            {formData.channel === 'email' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Default Subject Line *</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className={`w-full px-3.5 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 dark:bg-[#0e1320] ${
                    formErrors.subject 
                      ? 'border-rose-300 bg-rose-50/30 dark:border-rose-900/50 dark:bg-rose-950/10' 
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                  placeholder="Welcome to ordinary"
                />
                {formErrors.subject && (
                  <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 block">{formErrors.subject}</span>
                )}
              </div>
            )}
          </div>

          {/* Placeholders Guide Card */}
          <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-xl flex items-start space-x-3.5">
            <HelpCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <h4 className="font-bold text-indigo-900 dark:text-indigo-300 mb-0.5">Dynamic Message Placeholders</h4>
              <p className="text-indigo-800 dark:text-indigo-400 text-xs leading-relaxed">
                You can insert dynamic customer placeholders into your templates. The worker script will swap these tags automatically prior to dispatching:
              </p>
              <div className="flex flex-wrap gap-2 mt-2 font-mono text-[10px]">
                <span className="bg-white dark:bg-[#111625] border border-indigo-100 dark:border-indigo-900/50 px-2 py-0.5 rounded text-indigo-900 dark:text-indigo-300">
                  {"{business_name}"}
                </span>
                <span className="bg-white dark:bg-[#111625] border border-indigo-100 dark:border-indigo-900/50 px-2 py-0.5 rounded text-indigo-900 dark:text-indigo-300">
                  {"{owner_name}"}
                </span>
              </div>
            </div>
          </div>

          {/* Message Content */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Message Content *</label>
            <textarea
              value={formData.message_content}
              onChange={(e) => setFormData({ ...formData, message_content: e.target.value })}
              rows={6}
              className={`w-full px-3.5 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 dark:bg-[#0e1320] font-mono ${
                formErrors.message_content 
                  ? 'border-rose-300 bg-rose-50/30 dark:border-rose-900/50 dark:bg-rose-950/10' 
                  : 'border-slate-200 dark:border-slate-800'
              }`}
              placeholder={formData.channel === 'email' ? 'Dear {owner_name},\n\nWelcome to our services...' : 'Hello {owner_name},...'}
            />
            {formErrors.message_content && (
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 block">{formErrors.message_content}</span>
            )}
          </div>

          {/* Attachments Section */}
          <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase block font-bold">Media / File Attachments</label>
            <div className="flex items-center space-x-3">
              <label className="cursor-pointer inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-50 dark:bg-[#0e1320] hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors">
                <Paperclip className="h-3.5 w-3.5 animate-pulse" />
                <span>Choose Files</span>
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

            {/* Uploaded Files Display List */}
            {formData.attachments && formData.attachments.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {formData.attachments.map((file) => (
                  <div 
                    key={file.id} 
                    className="flex items-center justify-between bg-slate-50 dark:bg-[#0e1320] border border-slate-200 dark:border-slate-800/80 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-350"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <Paperclip className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate font-semibold text-slate-700 dark:text-slate-300" title={file.file_name}>{file.file_name}</span>
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
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-sm transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploadingFile}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-all disabled:opacity-50"
            >
              {editingTemplate ? 'Save Changes' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
