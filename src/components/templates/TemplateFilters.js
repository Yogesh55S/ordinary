import { Search } from 'lucide-react';

export default function TemplateFilters({
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  categories
}) {
  return (
    <div className="bg-white dark:bg-black rounded-2xl p-4 border border-[#CBDDE9] dark:border-[#2A72A1]/40 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center w-full transition-colors">
      {/* Search */}
      <div className="relative w-full md:w-80">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#2A72A1]">
          <Search className="h-4 w-4" />
        </span>
        <input
          type="text"
          placeholder="Search template name or message..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-black border border-[#CBDDE9] dark:border-[#2A72A1]/40 rounded-xl text-sm placeholder-black/40 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#2A72A1]/30 focus:border-[#2A72A1] text-black dark:text-white transition-colors"
        />
      </div>

      {/* Category filter */}
      <div className="flex items-center space-x-2 w-full md:w-auto">
        <span className="text-xs font-bold text-black dark:text-white uppercase shrink-0">Filter Category</span>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full md:w-auto bg-white dark:bg-black border border-[#CBDDE9] dark:border-[#2A72A1]/40 text-black dark:text-white rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A72A1]/30 focus:border-[#2A72A1] transition-colors"
        >
          <option value="All" className="bg-white dark:bg-black text-black dark:text-white">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat} className="bg-white dark:bg-black text-black dark:text-white">{cat}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
