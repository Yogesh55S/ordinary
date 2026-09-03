export default function StatusFilters({
  statusFilter,
  setStatusFilter,
  counts
}) {
  const filters = [
    { key: 'All', label: 'All Queue', count: counts.Pending + counts.Sent + counts.Failed },
    { key: 'Pending', label: 'Pending / Scheduled', count: counts.Pending },
    { key: 'Sent', label: 'Sent Messages', count: counts.Sent },
    { key: 'Failed', label: 'Failed Delivery', count: counts.Failed }
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
                ? 'bg-[#2A72A1] text-white border-[#2A72A1] shadow-sm'
                : 'bg-white dark:bg-black text-black dark:text-[#CBDDE9] border-[#CBDDE9] dark:border-[#2A72A1]/40 hover:bg-[#CBDDE9]/25'
            }`}
          >
            <span>{filter.label}</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
              isActive
                ? 'bg-black/20 text-white'
                : 'bg-[#CBDDE9]/40 dark:bg-black text-black dark:text-white'
            }`}>
              {filter.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
