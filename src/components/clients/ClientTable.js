import { Phone, Mail, Edit2, Trash2, Building } from 'lucide-react';

export default function ClientTable({ 
  clients, 
  loading, 
  onRowClick, 
  onEdit, 
  onDelete,
  getStatusBadgeStyles,
  selectedIds = [],
  onSelectRow,
  onSelectAll
}) {
  if (loading && clients.length === 0) {
    return (
      <div className="p-8 space-y-4">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="grid grid-cols-5 gap-4 py-3 border-b border-slate-50 dark:border-slate-800/40 last:border-none animate-pulse">
            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded col-span-2"></div>
            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded col-span-1"></div>
            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded col-span-1"></div>
            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded col-span-1"></div>
          </div>
        ))}
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="p-16 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center justify-center">
        <Building className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-3" />
        <span className="font-semibold text-base text-slate-700 dark:text-slate-300">No clients found</span>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">No clients match your search criteria. Try modifying your filters or add a new client.</p>
      </div>
    );
  }

  const isAllSelected = clients.length > 0 && selectedIds.length === clients.length;

  return (
    <>
    {/* Mobile & tablet: card list */}
    <div className="lg:hidden">
      <label className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400">
        <input
          type="checkbox"
          checked={isAllSelected}
          onChange={onSelectAll}
          className="rounded border-slate-300 dark:border-slate-800 text-indigo-600 focus:ring-indigo-500 h-5 w-5"
        />
        <span>Select all · {clients.length}</span>
      </label>
      <ul className="divide-y divide-slate-100 dark:divide-slate-800">
        {clients.map((client) => {
          const isSelected = selectedIds.includes(client.id);
          return (
            <li
              key={client.id}
              onClick={() => onRowClick(client)}
              className={`flex items-start gap-3 px-4 py-3.5 active:bg-slate-50 dark:active:bg-white/5 transition-colors ${
                isSelected ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
              }`}
            >
              <span className="pt-0.5" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onSelectRow(client.id)}
                  aria-label={`Select ${client.business_name}`}
                  className="rounded border-slate-300 dark:border-slate-800 text-indigo-600 focus:ring-indigo-500 h-5 w-5"
                />
              </span>
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-800 dark:text-slate-100">{client.business_name}</p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">{client.owner_name || 'No Owner Name'}</p>
                  </div>
                  <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadgeStyles(client.status)}`}>
                    {client.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <a
                    href={`tel:${client.phone_number}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1"
                  >
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    {client.phone_number}
                  </a>
                  {client.category && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-semibold">
                      {client.category}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={(e) => onEdit(e, client)}
                  className="p-2 text-slate-500 hover:text-indigo-600 rounded-lg"
                  aria-label={`Edit ${client.business_name}`}
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => onDelete(e, client)}
                  className="p-2 text-slate-500 hover:text-rose-600 rounded-lg"
                  aria-label={`Delete ${client.business_name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>

    {/* Desktop: table */}
    <div className="hidden lg:block overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
        <thead className="bg-slate-50/70 dark:bg-slate-900/40 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3.5 w-12 text-center">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={onSelectAll}
                className="rounded border-slate-300 dark:border-slate-800 text-indigo-600 dark:text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
              />
            </th>
            <th className="px-5 py-3.5 whitespace-nowrap">Business & Owner</th>
            <th className="px-5 py-3.5 whitespace-nowrap">Contact Info</th>
            <th className="px-5 py-3.5 whitespace-nowrap">Category</th>
            <th className="px-5 py-3.5 whitespace-nowrap">Status</th>
            <th className="px-5 py-3.5 whitespace-nowrap text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
          {clients.map((client) => {
            const isSelected = selectedIds.includes(client.id);
            return (
              <tr 
                key={client.id} 
                onClick={() => onRowClick(client)}
                className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/10 cursor-pointer transition-colors ${
                  isSelected ? 'bg-indigo-50/20 dark:bg-indigo-950/15' : ''
                }`}
              >
                <td className="px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onSelectRow(client.id)}
                    className="rounded border-slate-300 dark:border-slate-800 text-indigo-600 dark:text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                  />
                </td>
                <td className="px-5 py-3.5 min-w-[220px]">
                  <div className="font-bold text-slate-800 dark:text-slate-200 line-clamp-2" title={client.business_name}>{client.business_name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{client.owner_name || 'No Owner Name'}</div>
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <div className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-300">
                    <Phone className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                    <span>{client.phone_number}</span>
                  </div>
                  {client.email && (
                    <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400 text-xs mt-1.5">
                      <Mail className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                      <span className="truncate max-w-[180px]">{client.email}</span>
                    </div>
                  )}
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap">
                  {client.category ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-transparent dark:border-slate-700">
                      {client.category}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">None</span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadgeStyles(client.status)}`}>
                    {client.status}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={(e) => onEdit(e, client)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-lg transition-colors"
                      title="Edit Client"
                    >
                      <Edit2 className="h-4.5 w-4.5" />
                    </button>
                    <button
                      onClick={(e) => onDelete(e, client)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
                      title="Delete Client"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    </>
  );
}
