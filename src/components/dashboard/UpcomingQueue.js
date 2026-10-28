import Link from 'next/link';
import { Calendar, ArrowRight, FileText, MessageSquare } from 'lucide-react';

export default function UpcomingQueue({ upcomingSchedules, loading }) {
  return (
    <div className="bg-white dark:bg-ink-800 border border-slate-200 dark:border-slate-800/60 rounded-2xl shadow-xs flex flex-col overflow-hidden">
      <div className="p-3.5 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Upcoming Queue</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">The next 5 scheduled outreach tasks</p>
        </div>
        <Link 
          href="/workspace/schedules" 
          className="shrink-0 whitespace-nowrap text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors"
        >
          <span>View all</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="flex-1 overflow-x-auto">
        {loading ? (
          <div className="p-5 space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800/50 pb-4 last:pb-0 last:border-none">
                <div className="space-y-2">
                  <div className="h-4 w-36 bg-slate-100 dark:bg-slate-800/60 animate-pulse rounded"></div>
                  <div className="h-3.5 w-24 bg-slate-100 dark:bg-slate-800/60 animate-pulse rounded"></div>
                </div>
                <div className="h-6 w-20 bg-slate-100 dark:bg-slate-800/60 animate-pulse rounded-full"></div>
              </div>
            ))}
          </div>
        ) : upcomingSchedules.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400 dark:text-slate-500">
            <Calendar className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-3" />
            <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">No upcoming outreach scheduled</span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">Create scheduled items or templates to begin automated client outreach cycles.</p>
          </div>
        ) : (
          <>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 lg:hidden">
            {upcomingSchedules.map((item) => (
              <div key={item.id} className="space-y-1.5 px-3.5 sm:px-5 py-3.5 sm:py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-sm text-slate-800 dark:text-slate-200">
                      {item.clients?.business_name || 'Unknown Business'}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {item.clients?.phone_number || 'No phone number'}
                    </p>
                  </div>
                  <div className="shrink-0 text-right text-xs">
                    <p className="font-medium text-slate-700 dark:text-slate-300">{item.schedule_date || 'Date not set'}</p>
                    <p className="mt-0.5 text-slate-400">{item.schedule_time ? `at ${item.schedule_time.slice(0, 5)}` : 'Time not set'}</p>
                  </div>
                </div>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {item.templates?.template_name || item.custom_message || 'Custom message'}
                </p>
              </div>
            ))}
          </div>
          <table className="hidden min-w-full divide-y divide-slate-100 dark:divide-slate-800 lg:table">
            <thead className="bg-slate-50/70 dark:bg-slate-900/40 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Client & Target</th>
                <th className="px-5 py-3.5">Outreach Message</th>
                <th className="px-5 py-3.5 text-right">Schedule Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {upcomingSchedules.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {item.clients?.business_name || 'Unknown Business'}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {item.clients?.phone_number || 'No Phone'}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {item.templates ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30">
                        <FileText className="h-3 w-3 mr-1" />
                        {item.templates.template_name}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Custom Message
                      </span>
                    )}
                    <p className="text-xs text-slate-400 dark:text-slate-400 truncate max-w-[200px] mt-1.5">
                      {item.custom_message}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="font-medium text-slate-700 dark:text-slate-300">
                      {item.schedule_date}
                    </div>
                    <div className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">
                      {item.schedule_time ? `at ${item.schedule_time.slice(0, 5)}` : 'Time not set'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </>
        )}
      </div>
    </div>
  );
}
