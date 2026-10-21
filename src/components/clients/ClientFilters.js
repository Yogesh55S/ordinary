import { Search } from 'lucide-react';

export default function ClientFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  categories
}) {
  return (
    <div className="bg-white dark:bg-ink-800 rounded-2xl p-3 sm:p-4 border border-slate-150 dark:border-slate-800/60 shadow-xs flex flex-col lg:flex-row gap-3 lg:gap-4 justify-between lg:items-center w-full">
      {/* Search */}
      <div className="relative w-full lg:max-w-sm">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
          <Search className="h-4 w-4" />
        </span>
        <input
          type="text"
          placeholder="Search name, phone, city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-ink-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-ink-900 transition-all text-slate-800 dark:text-slate-100"
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 lg:flex gap-2.5 lg:gap-3 w-full lg:w-auto">
        {/* Status filter */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="hidden lg:inline text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase shrink-0">Status</span>
          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full lg:w-auto min-w-0 bg-slate-50 dark:bg-ink-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl px-3 py-2.5 lg:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-ink-900"
          >
            <option value="All" className="dark:bg-ink-800">All Statuses</option>
            <option value="New" className="dark:bg-ink-800">New</option>
            <option value="Lead" className="dark:bg-ink-800">Lead</option>
            <option value="Active" className="dark:bg-ink-800">Active</option>
            <option value="Inactive" className="dark:bg-ink-800">Inactive</option>
            <option value="Archived" className="dark:bg-ink-800">Archived</option>
          </select>
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="hidden lg:inline text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase shrink-0">Category</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by category"
            className="w-full lg:w-auto min-w-0 bg-slate-50 dark:bg-ink-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl px-3 py-2.5 lg:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-ink-900"
          >
            <option value="All" className="dark:bg-ink-800">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat} className="dark:bg-ink-800">{cat}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
