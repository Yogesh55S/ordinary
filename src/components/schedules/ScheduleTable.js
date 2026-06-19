import { Fragment } from 'react';
import { Calendar, Clock, Eye, Send, Edit2, Trash2, FileText, MessageSquare, Mail, Paperclip, Search } from 'lucide-react';

export default function ScheduleTable({
  schedules,
  loading,
  onView,
  onSendNow,
  onEdit,
  onDelete,
  getStatusBadgeStyles,
  isHistory = false
}) {
  if (loading && schedules.length === 0) {
    return (
      <div className="p-8 space-y-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="grid grid-cols-5 gap-4 py-3 border-b border-slate-50 dark:border-slate-800/40 last:border-none animate-pulse">
            <div className="h-4 bg-slate-100 dark:bg-slate-800/60 col-span-1 rounded"></div>
            <div className="h-4 bg-slate-100 dark:bg-slate-800/60 col-span-1 rounded"></div>
            <div className="h-4 bg-slate-100 dark:bg-slate-800/60 col-span-1 rounded"></div>
            <div className="h-4 bg-slate-100 dark:bg-slate-800/60 col-span-1 rounded"></div>
            <div className="h-4 bg-slate-100 dark:bg-slate-800/60 col-span-1 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <div className="p-16 text-center text-slate-400 dark:text-slate-400 flex flex-col items-center justify-center">
        <Calendar className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-3" />
        <span className="font-semibold text-base text-slate-700 dark:text-slate-300">No scheduled items found</span>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">No schedules match the selected filters. Click &quot;New Schedule&quot; to add items to the automation queue.</p>
      </div>
    );
  }

  // Group schedules by date for visual separation
  const dateGroups = {};
  schedules.forEach((item) => {
    const date = item.schedule_date || 'Unknown';
    if (!dateGroups[date]) dateGroups[date] = [];
    dateGroups[date].push(item);
  });
  const sortedDates = Object.keys(dateGroups).sort();

  // Format date for group headers
  const formatDateLabel = (dateStr) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      
      if (dateStr === today) return `📅 Today — ${dateStr}`;
      if (dateStr === tomorrow) return `📅 Tomorrow — ${dateStr}`;
      
      const d = new Date(dateStr + 'T00:00:00');
      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
      return `${dayName} — ${dateStr}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
        <thead className="bg-slate-50/70 dark:bg-slate-900/40 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          <tr>
            <th className="px-6 py-4">Client Info</th>
            <th className="px-6 py-4">Channel</th>
            <th className="px-6 py-4">Template Used</th>
            <th className="px-6 py-4">{isHistory ? 'Sent Time' : 'Schedule Time'}</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
          {sortedDates.map((date) => (
            <Fragment key={date}>
              {/* Date group separator */}
              {sortedDates.length > 1 && (
                <tr key={`group-${date}`}>
                  <td colSpan={6} className="px-6 py-2.5 bg-indigo-50/40 dark:bg-indigo-950/10 border-y border-indigo-100/60 dark:border-indigo-900/20">
                    <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
                      {formatDateLabel(date)} — {dateGroups[date].length} schedule{dateGroups[date].length !== 1 ? 's' : ''}
                    </span>
                  </td>
                </tr>
              )}
              {dateGroups[date].map((item, idx) => {
                const isEmail = item.custom_message?.startsWith('[EMAIL]\nSubject:');
                
                return (
                  <tr 
                    key={item.id} 
                    className={`hover:bg-indigo-50/30 dark:hover:bg-indigo-950/10 transition-colors ${
                      idx % 2 === 1 ? 'bg-slate-50/30 dark:bg-slate-900/10' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{item.clients?.business_name || 'Unknown Client'}</span>
                        {item.resolvedAttachments && item.resolvedAttachments.length > 0 && (
                          <Paperclip className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" title={`${item.resolvedAttachments.length} file attachment(s)`} />
                        )}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.clients?.owner_name} • {isEmail ? item.clients?.email : item.clients?.phone_number}
                      </div>
                      {item.clients?.category && (
                        <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50">
                          {item.clients.category}
                        </span>
                      )}
                    </td>
                    
                    {/* Channel Indicator Badge */}
                    <td className="px-6 py-4">
                      {isEmail ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30">
                          <Mail className="h-3.5 w-3.5 mr-1" />
                          Email
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30">
                          <MessageSquare className="h-3.5 w-3.5 mr-1" />
                          WhatsApp
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {item.templates ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30">
                          <FileText className="h-3 w-3 mr-1" />
                          {item.templates.template_name}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 border border-transparent dark:border-slate-700">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Custom
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                        <span>{item.schedule_date}</span>
                      </div>
                      <div className="text-xs text-slate-400 dark:text-slate-400 mt-1 flex items-center space-x-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                        <span>at {item.schedule_time.substring(0, 5)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadgeStyles(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        {/* View message */}
                        <button
                          onClick={() => onView(item)}
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="View Message Content"
                        >
                          <Eye className="h-4.5 w-4.5" />
                        </button>
                        
                        {/* Send Now */}
                        {!isHistory && (item.status === 'Pending' || item.status === 'Scheduled' || item.status === 'Failed') && (
                          <button
                            onClick={() => onSendNow(item)}
                            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-lg transition-colors"
                            title="Send Now (Force Queue Dispatch)"
                          >
                            <Send className="h-4.5 w-4.5" />
                          </button>
                        )}
                        
                        {/* Edit */}
                        {!isHistory && (
                          <button
                            onClick={() => onEdit(item)}
                            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-lg transition-colors"
                            title="Edit Schedule"
                          >
                            <Edit2 className="h-4.5 w-4.5" />
                          </button>
                        )}
                        
                        {/* Delete */}
                        <button
                          onClick={() => onDelete(item)}
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
                          title={isHistory ? "Delete History Record" : "Delete / Cancel Schedule"}
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
