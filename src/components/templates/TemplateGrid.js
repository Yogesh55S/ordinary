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
          <div key={n} className="bg-white dark:bg-black border border-mist dark:border-line rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="h-5 w-32 bg-mist/30 animate-pulse rounded"></div>
              <div className="h-5 w-16 bg-mist/30 animate-pulse rounded-full"></div>
            </div>
            <div className="h-28 bg-mist/20 animate-pulse rounded-xl"></div>
            <div className="flex justify-end space-x-2 pt-2">
              <div className="h-8 w-16 bg-mist/30 animate-pulse rounded-xl"></div>
              <div className="h-8 w-8 bg-mist/30 animate-pulse rounded-xl"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="bg-white dark:bg-black p-16 text-center text-black/60 dark:text-mist/70 flex flex-col items-center justify-center border border-mist dark:border-line rounded-2xl shadow-xs">
        <FileText className="h-12 w-12 text-brand mb-3" />
        <span className="font-bold text-base text-black dark:text-white">No templates found</span>
        <p className="text-xs text-black/70 dark:text-mist mt-1 max-w-sm">Create outreach message templates to avoid repeating common responses or marketing scripts.</p>
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
            className="bg-white dark:bg-black border border-mist dark:border-line rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:border-brand transition-all group"
          >
            <div>
              <div className="flex items-start justify-between space-x-3 mb-3">
                <h3 className="font-bold text-black dark:text-white text-base leading-tight group-hover:text-brand transition-colors">
                  {template.template_name}
                </h3>
                <div className="flex flex-wrap gap-1 items-center shrink-0">
                  {isEmail ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-mist/30 dark:bg-black text-brand border border-mist dark:border-line">
                      <Mail className="h-3 w-3 mr-1" />
                      Email
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-mist/30 dark:bg-black text-black dark:text-mist border border-mist dark:border-line">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      WhatsApp
                    </span>
                  )}
                  {template.category && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-white dark:bg-black text-black dark:text-white border border-mist dark:border-line">
                      {template.category}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Default Subject for Email Templates */}
              {isEmail && subject && (
                <div className="mb-2 text-xs font-semibold text-black dark:text-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-black/60 dark:text-mist/70 block">Default Subject</span>
                  {subject}
                </div>
              )}

              {/* Message preview block */}
              <div className="relative mt-2">
                <pre className="text-xs font-mono text-black dark:text-white bg-mist/15 dark:bg-black border border-mist dark:border-line rounded-xl p-3.5 max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {body}
                </pre>
              </div>

              {/* Template Attachments */}
              {template.attachments && template.attachments.length > 0 && (
                <div className="mt-3.5 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-black/60 dark:text-mist/70 block">Attached Media Files</span>
                  <div className="flex flex-wrap gap-1.5">
                    {template.attachments.map((file) => (
                      <a 
                        key={file.id}
                        href={file.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-mist/15 dark:bg-black hover:bg-mist/30 border border-mist dark:border-line rounded-lg text-[10px] text-black dark:text-white font-semibold transition-colors"
                      >
                        <Paperclip className="h-3 w-3 text-brand" />
                        <span className="truncate max-w-[120px]" title={file.file_name}>{file.file_name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between border-t border-mist dark:border-line pt-4 mt-5">
              <span className="text-[10px] text-black/60 dark:text-mist/70 font-medium">
                Created: {new Date(template.created_at).toLocaleDateString()}
              </span>
              
              <div className="flex items-center space-x-2">
                {/* Copy Button */}
                <button
                  onClick={() => onCopy(template)}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all border ${
                    copiedId === template.id
                      ? 'bg-mist/40 dark:bg-black text-brand border-brand'
                      : 'bg-white dark:bg-black text-black dark:text-white border-mist dark:border-line hover:bg-mist/25'
                  }`}
                >
                  {copiedId === template.id ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <FileText className="h-3.5 w-3.5 text-brand" />
                      <span>Copy Body</span>
                    </>
                  )}
                </button>

                {/* Edit Button */}
                <button
                  onClick={() => onEdit(template)}
                  className="p-1.5 text-brand hover:bg-mist/25 rounded-lg transition-all"
                  title="Edit Template"
                >
                  <Edit2 className="h-4.5 w-4.5" />
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => onDelete(template)}
                  className="p-1.5 text-black dark:text-white hover:bg-mist/25 rounded-lg transition-all"
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
