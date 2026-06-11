import { FileText, Copy, Check, Edit2, Trash2, Paperclip, Mail, MessageSquare } from 'lucide-react';

export default function TemplateGrid({
  templates,
  loading,
  copiedId,
  onCopy,
  onEdit,
  onDelete
}) {
  if (loading && templates.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800/60 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="h-5 w-32 bg-slate-100 dark:bg-slate-800/60 animate-pulse rounded"></div>
              <div className="h-5 w-16 bg-slate-100 dark:bg-slate-800/60 animate-pulse rounded-full"></div>
            </div>
            <div className="h-28 bg-slate-50 dark:bg-slate-900/40 animate-pulse rounded-lg"></div>
            <div className="flex justify-end space-x-2 pt-2">
              <div className="h-8 w-16 bg-slate-100 dark:bg-slate-800/60 animate-pulse rounded-lg"></div>
              <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800/60 animate-pulse rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="bg-white dark:bg-[#111625] p-16 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center justify-center border border-slate-200 dark:border-slate-800/60 rounded-2xl shadow-xs">
        <FileText className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-3" />
        <span className="font-semibold text-base text-slate-700 dark:text-slate-300">No templates found</span>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">Create outreach message templates to avoid repeating common responses or marketing scripts.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {templates.map((template) => {
        let isEmail = template.message_content?.startsWith('[EMAIL]\nSubject:');
        let subject = '';
        let body = template.message_content || '';
        
        if (isEmail) {
          const parts = body.split('---');
          const header = parts[0] || '';
          body = parts.slice(1).join('---').trim();
          
          const subjectLine = header.split('\n')[1] || '';
          subject = subjectLine.replace('Subject:', '').trim();
        }

        return (
          <div 
            key={template.id} 
            className="bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800/60 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:shadow-sm transition-all group"
          >
            <div>
              <div className="flex items-start justify-between space-x-3 mb-3">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {template.template_name}
                </h3>
                <div className="flex flex-wrap gap-1 items-center shrink-0">
                  {isEmail ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
                      <Mail className="h-3 w-3 mr-1" />
                      Email
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      WhatsApp
                    </span>
                  )}
                  {template.category && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30">
                      {template.category}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Default Subject for Email Templates */}
              {isEmail && subject && (
                <div className="mb-2 text-xs font-semibold text-slate-800 dark:text-slate-300">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Default Subject</span>
                  {subject}
                </div>
              )}

              {/* Message preview block */}
              <div className="relative mt-2">
                <pre className="text-xs font-mono text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#0e1320] border border-slate-100 dark:border-slate-800/80 rounded-xl p-3.5 max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {body}
                </pre>
              </div>

              {/* Template Attachments */}
              {template.attachments && template.attachments.length > 0 && (
                <div className="mt-3.5 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Attached Media Files</span>
                  <div className="flex flex-wrap gap-1.5">
                    {template.attachments.map((file) => (
                      <a 
                        key={file.id}
                        href={file.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-slate-50 dark:bg-[#0e1320] hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800/80 rounded-lg text-[10px] text-slate-600 dark:text-slate-400 font-semibold transition-colors"
                      >
                        <Paperclip className="h-3 w-3 text-slate-400" />
                        <span className="truncate max-w-[120px]" title={file.file_name}>{file.file_name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-4 mt-5">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                Created: {new Date(template.created_at).toLocaleDateString()}
              </span>
              
              <div className="flex items-center space-x-2">
                {/* Copy Button */}
                <button
                  onClick={() => onCopy(template)}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all border ${
                    copiedId === template.id
                      ? 'bg-emerald-50 dark:bg-emerald-950/25 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30'
                      : 'bg-slate-50 dark:bg-[#0e1320] text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {copiedId === template.id ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <FileText className="h-3.5 w-3.5" />
                      <span>Copy Body</span>
                    </>
                  )}
                </button>

                {/* Edit Button */}
                <button
                  onClick={() => onEdit(template)}
                  className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/30 rounded-lg transition-all"
                  title="Edit Template"
                >
                  <Edit2 className="h-4.5 w-4.5" />
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => onDelete(template)}
                  className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-transparent hover:border-rose-100 dark:hover:border-rose-900/30 rounded-lg transition-all"
                  title="Delete Template"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
