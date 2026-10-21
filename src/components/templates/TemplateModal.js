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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
      ></div>
      
      {/* Modal Container */}
      <div className="relative bg-white dark:bg-black rounded-t-3xl sm:rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[90vh] overflow-hidden transition-all border border-mist dark:border-line">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-mist dark:border-line bg-mist/25 dark:bg-black">
          <h3 className="text-lg font-bold text-black dark:text-white">
            {editingTemplate ? `Edit Template` : `Create Template`}
          </h3>
          <button 
            onClick={onClose}
            className="text-black dark:text-white hover:bg-mist/25 rounded-lg p-1.5 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Template Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-black dark:text-white uppercase">Template Name *</label>
              <input
                type="text"
                value={formData.template_name}
                onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
                className={`w-full px-3.5 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-black dark:text-white bg-white dark:bg-black ${
                  formErrors.template_name 
                    ? 'border-brand dark:border-brand bg-brand/5' 
                    : 'border-mist dark:border-line'
                }`}
                placeholder="Welcome Message / Follow Up"
              />
              {formErrors.template_name && (
                <span className="text-xs font-semibold text-black dark:text-white block">{formErrors.template_name}</span>
              )}
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-black dark:text-white uppercase">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2 border border-mist dark:border-line rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-black dark:text-white bg-white dark:bg-black"
                placeholder="Onboarding / Follow-up / Marketing"
                list="template-categories"
              />
              <datalist id="template-categories">
                {categories.map((c) => <option key={c} value={c} />)}
              </datalist>
            </div>

            {/* Outreach Channel */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-black dark:text-white uppercase">Template Channel *</label>
              <select
                value={formData.channel}
                onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                className="w-full px-3.5 py-2 border border-mist dark:border-line rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand bg-white dark:bg-black text-black dark:text-white"
              >
                <option value="whatsapp" className="bg-white dark:bg-black text-black dark:text-white">WhatsApp Template</option>
                <option value="email" className="bg-white dark:bg-black text-black dark:text-white">Email Template</option>
              </select>
            </div>

            {/* Default Email Subject Line (Conditional) */}
            {formData.channel === 'email' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black dark:text-white uppercase">Default Subject Line *</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className={`w-full px-3.5 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-black dark:text-white bg-white dark:bg-black ${
                    formErrors.subject 
                      ? 'border-brand dark:border-brand bg-brand/5' 
                      : 'border-mist dark:border-line'
                  }`}
                  placeholder="Welcome to ordinary"
                />
                {formErrors.subject && (
                  <span className="text-xs font-semibold text-black dark:text-white block">{formErrors.subject}</span>
                )}
              </div>
            )}
          </div>

          {/* Placeholders Guide Card */}
          <div className="p-4 bg-mist/20 dark:bg-black border border-mist dark:border-line rounded-xl flex items-start space-x-3.5">
            <HelpCircle className="h-5 w-5 text-brand shrink-0 mt-0.5" />
            <div className="text-sm">
              <h4 className="font-bold text-black dark:text-white mb-0.5">Dynamic Message Placeholders</h4>
              <p className="text-black/70 dark:text-mist text-xs leading-relaxed">
                You can insert dynamic customer placeholders into your templates. The worker will swap these tags automatically:
              </p>
              <div className="flex flex-wrap gap-2 mt-2 font-mono text-[10px]">
                <span className="bg-white dark:bg-black border border-mist dark:border-line px-2 py-0.5 rounded-lg text-brand">
                  {"{business_name}"}
                </span>
                <span className="bg-white dark:bg-black border border-mist dark:border-line px-2 py-0.5 rounded-lg text-brand">
                  {"{owner_name}"}
                </span>
              </div>
            </div>
          </div>

          {/* Message Content */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-black dark:text-white uppercase">Message Content *</label>
            <textarea
              value={formData.message_content}
              onChange={(e) => setFormData({ ...formData, message_content: e.target.value })}
              rows={6}
              className={`w-full px-3.5 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-black dark:text-white bg-white dark:bg-black font-mono ${
                formErrors.message_content 
                  ? 'border-brand dark:border-brand bg-brand/5' 
                  : 'border-mist dark:border-line'
              }`}
              placeholder={formData.channel === 'email' ? 'Dear {owner_name},\n\nWelcome to our services...' : 'Hello {owner_name},...'}
            />
            {formErrors.message_content && (
              <span className="text-xs font-semibold text-black dark:text-white block">{formErrors.message_content}</span>
            )}
          </div>

          {/* Attachments Section */}
          <div className="space-y-2 border-t border-mist dark:border-line pt-4">
            <label className="text-xs font-bold text-black dark:text-white uppercase block">Media / File Attachments</label>
            <div className="flex items-center space-x-3">
              <label className="cursor-pointer inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white dark:bg-black hover:bg-mist/25 border border-mist dark:border-line rounded-xl text-xs font-bold text-black dark:text-white transition-colors">
                <Paperclip className="h-3.5 w-3.5 text-brand" />
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
                <div className="flex items-center space-x-1.5 text-xs text-brand font-semibold">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Uploading files to cloud...</span>
                </div>
              )}
            </div>
            {uploadError && (
              <p className="text-xs text-black dark:text-white font-bold mt-1">{uploadError}</p>
            )}

            {/* Uploaded Files Display List */}
            {formData.attachments && formData.attachments.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {formData.attachments.map((file) => (
                  <div 
                    key={file.id} 
                    className="flex items-center justify-between bg-mist/15 dark:bg-black border border-mist dark:border-line rounded-xl px-3 py-2 text-xs text-black dark:text-white"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <Paperclip className="h-3.5 w-3.5 text-brand shrink-0" />
                      <span className="truncate font-semibold text-black dark:text-white" title={file.file_name}>{file.file_name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveAttachment(file.id)}
                      className="ml-2 text-black dark:text-white hover:bg-mist/25 rounded-full p-1"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-mist dark:border-line">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-mist dark:border-line hover:bg-mist/25 text-black dark:text-white font-semibold rounded-xl text-sm transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploadingFile}
              className="px-4 py-2 bg-brand hover:opacity-90 text-white font-semibold rounded-xl text-sm shadow-sm transition-all disabled:opacity-50"
            >
              {editingTemplate ? 'Save Changes' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
