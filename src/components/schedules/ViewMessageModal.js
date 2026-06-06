import { X, FileText, AlertCircle, Mail, MessageSquare, Paperclip, ExternalLink } from 'lucide-react';

export default function ViewMessageModal({
  isOpen,
  onClose,
  schedule,
  getStatusBadgeStyles
}) {
  if (!isOpen || !schedule) return null;

  let channel = 'WhatsApp';
  let subject = '';
  let body = schedule.custom_message || '';
  
  if (body.startsWith('[EMAIL]\nSubject:')) {
    channel = 'Email';
    const parts = body.split('---');
    const header = parts[0] || '';
    body = parts.slice(1).join('---').trim();
    
    const subjectLine = header.split('\n')[1] || '';
    subject = subjectLine.replace('Subject:', '').trim();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-xs transition-opacity duration-355"
      ></div>
      
      {/* Modal Container */}
      <div className="relative bg-white dark:bg-[#111625] rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden transition-all border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">Outreach Message Review</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-sm flex-1 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-2 gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Recipient</span>
              <span className="font-bold text-slate-800 dark:text-slate-100">{schedule.clients?.business_name || 'System Client'}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Outreach Channel</span>
              <span className="flex items-center mt-0.5">
                {channel === 'Email' ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 text-xs font-bold">
                    <Mail className="h-3 w-3 mr-1" />
                    Email
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 text-xs font-bold">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    WhatsApp
                  </span>
                )}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Scheduled For</span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">{schedule.schedule_date} at {schedule.schedule_time.substring(0, 5)}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider block">Queue Status</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${getStatusBadgeStyles(schedule.status)}`}>
                {schedule.status}
              </span>
            </div>
          </div>

          {/* Subject row for email */}
          {channel === 'Email' && subject && (
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Subject Line</span>
              <span className="font-bold text-slate-805 dark:text-slate-200 mt-1 block">{subject}</span>
            </div>
          )}

          {/* Message content */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">Message Body (Unsubstituted template content)</span>
            <pre className="p-4 bg-slate-50 dark:bg-[#0e1320] border border-slate-100 dark:border-slate-800/80 rounded-xl text-xs font-mono text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
              {body}
            </pre>
          </div>

          {/* Attachments list */}
          {schedule.resolvedAttachments && schedule.resolvedAttachments.length > 0 && (
            <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">File Attachments ({schedule.resolvedAttachments.length})</span>
              <div className="grid grid-cols-1 gap-2">
                {schedule.resolvedAttachments.map((file) => (
                  <a
                    key={file.id}
                    href={file.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-[#0e1320] hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs transition-colors group"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <Paperclip className="h-4 w-4 text-slate-405 group-hover:text-indigo-600 shrink-0" />
                      <span className="truncate text-slate-700 dark:text-slate-300 font-semibold" title={file.file_name}>{file.file_name}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0">
                      <span>Download</span>
                      <ExternalLink className="h-3 w-3" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {schedule.status === 'Pending' && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl text-xs text-amber-800 dark:text-amber-400 flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>This message is pending execution. Placeholders like <code>{"{business_name}"}</code> will be replaced with client profile details automatically during dispatch.</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4.5 bg-slate-50/50 dark:bg-slate-900/20 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
