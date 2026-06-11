import { AlertCircle } from 'lucide-react';

export default function ActivityLogs({ activityLogs, loading }) {
  const getLogTypeStyles = (actionType) => {
    const type = actionType ? actionType.toLowerCase() : '';
    if (type.includes('sent') || type.includes('success')) {
      return {
        bg: 'bg-emerald-500',
        badge: 'bg-emerald-500',
      };
    } else if (type.includes('fail') || type.includes('error')) {
      return {
        bg: 'bg-rose-500',
        badge: 'bg-rose-500',
      };
    } else if (type.includes('create') || type.includes('add') || type.includes('schedule') || type.includes('template')) {
      return {
        bg: 'bg-indigo-600 dark:bg-indigo-500',
        badge: 'bg-indigo-600 dark:bg-indigo-500',
      };
    } else {
      return {
        bg: 'bg-slate-500',
        badge: 'bg-slate-500',
      };
    }
  };

  const formatLogTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800/60 rounded-2xl shadow-xs flex flex-col overflow-hidden">
      <div className="p-5 border-b border-slate-100 dark:border-slate-800">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Activity History</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Outreach log chronological history</p>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[350px]">
        {loading ? (
          <div className="p-5 space-y-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="flex items-start space-x-3">
                <div className="h-2 w-2 rounded-full bg-slate-200 dark:bg-slate-700 mt-2"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800/60 animate-pulse rounded"></div>
                  <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800/60 animate-pulse rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : activityLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400 dark:text-slate-500 h-full">
            <AlertCircle className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-3" />
            <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">No activity recorded</span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[200px]">Logs are generated automatically by the local background worker process.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {activityLogs.map((log) => {
              const style = getLogTypeStyles(log.action_type);
              return (
                <div key={log.id} className="p-4 flex items-start space-x-3.5 hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-colors">
                  <div className={`mt-2 h-2.5 w-2.5 rounded-full shrink-0 ${style.badge}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {log.action_type}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed break-words">
                      {log.details}
                    </p>
                    <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-2 block">
                      {formatLogTime(log.created_at)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
