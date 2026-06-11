export default function StatusFilters({
  statusFilter,
  setStatusFilter,
  counts
}) {
  const filters = [
    { key: 'All', label: 'All Queue', count: counts.Pending + counts.Sent + counts.Failed, colorActive: 'bg-indigo-600 text-white border-indigo-600 shadow-sm', colorBadge: 'bg-indigo-700 text-white', colorBadgeInactive: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350' },
    { key: 'Pending', label: 'Pending / Scheduled', count: counts.Pending, colorActive: 'bg-amber-500 text-white border-amber-500 shadow-sm', colorBadge: 'bg-amber-600 text-white', colorBadgeInactive: 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400' },
    { key: 'Sent', label: 'Sent Messages', count: counts.Sent, colorActive: 'bg-emerald-600 text-white border-emerald-600 shadow-sm', colorBadge: 'bg-emerald-700 text-white', colorBadgeInactive: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400' },
    { key: 'Failed', label: 'Failed Delivery', count: counts.Failed, colorActive: 'bg-rose-600 text-white border-rose-600 shadow-sm', colorBadge: 'bg-rose-700 text-white', colorBadgeInactive: 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400' }
  ];

  return (
    <div className="sm:col-span-3 flex flex-wrap gap-3">
      {filters.map((filter) => {
        const isActive = statusFilter === filter.key;
        return (
          <button 
            key={filter.key}
            onClick={() => setStatusFilter(filter.key)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center space-x-2 ${
              isActive
                ? filter.colorActive
                : 'bg-white dark:bg-[#111625] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <span>{filter.label}</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] ${isActive ? filter.colorBadge : filter.colorBadgeInactive}`}>
              {filter.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
