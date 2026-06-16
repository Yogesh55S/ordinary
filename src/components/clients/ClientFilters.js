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
    <div className="bg-white dark:bg-[#111625] rounded-2xl p-4 border border-slate-150 dark:border-slate-800/60 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center w-full">
      {/* Search */}
      <div className="relative w-full md:w-80">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
          <Search className="h-4 w-4" />
        </span>
        <input
          type="text"
          placeholder="Search name, phone, city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#0e1320] border border-slate-200 dark:border-slate-805 dark:border-slate-800 rounded-xl text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-[#0e1320] transition-all text-slate-800 dark:text-slate-100"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        {/* Status filter */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase shrink-0">Status</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto bg-slate-50 dark:bg-[#0e1320] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-[#0e1320]"
          >
            <option value="All" className="dark:bg-[#111625]">All Statuses</option>
            <option value="New" className="dark:bg-[#111625]">New</option>
            <option value="Lead" className="dark:bg-[#111625]">Lead</option>
            <option value="Active" className="dark:bg-[#111625]">Active</option>
            <option value="Inactive" className="dark:bg-[#111625]">Inactive</option>
            <option value="Archived" className="dark:bg-[#111625]">Archived</option>
          </select>
        </div>

        {/* Category filter */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase shrink-0">Category</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto bg-slate-50 dark:bg-[#0e1320] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-[#0e1320]"
          >
            <option value="All" className="dark:bg-[#111625]">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat} className="dark:bg-[#111625]">{cat}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
