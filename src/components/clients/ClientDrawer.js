import { Info, X, Users, Phone, Mail, Globe, ExternalLink, MapPin, Tag, Edit2, Trash2 } from 'lucide-react';

export default function ClientDrawer({
  client,
  onClose,
  onEdit,
  onDelete,
  getStatusBadgeStyles
}) {
  if (!client) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex pl-10 max-w-full">
      {/* Backdrop overlay */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/35 dark:bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
      ></div>

      {/* Panel Container */}
      <div className="relative w-screen max-w-md bg-white dark:bg-[#0e1320] shadow-2xl flex flex-col h-full border-l border-slate-200 dark:border-slate-800 animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center space-x-2">
            <Info className="h-5 w-5 text-indigo-650 dark:text-indigo-400" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">Client Details</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 dark:text-slate-500 hover:text-slate-650 dark:hover:text-slate-200 rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable details */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Primary Profile Details */}
          <div className="space-y-4">
            <div>
              <h4 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 leading-snug">
                {client.business_name}
              </h4>
              <div className="flex items-center space-x-2.5 mt-1.5">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadgeStyles(client.status)}`}>
                  {client.status}
                </span>
                {client.category && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350 border border-transparent dark:border-slate-750">
                    {client.category}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3.5 pt-2 text-sm">
              {/* Owner */}
              <div className="flex items-start space-x-3">
                <Users className="h-4.5 w-4.5 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Owner / Contact Person</span>
                  <span className="text-slate-905 dark:text-slate-200 font-medium">{client.owner_name || 'Not Specified'}</span>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start space-x-3">
                <Phone className="h-4.5 w-4.5 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">WhatsApp Number</span>
                  <span className="text-slate-900 dark:text-slate-200 font-medium">{client.phone_number}</span>
                </div>
              </div>

              {/* Email */}
              {client.email && (
                <div className="flex items-start space-x-3">
                  <Mail className="h-4.5 w-4.5 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Email Address</span>
                    <a href={`mailto:${client.email}`} className="text-indigo-650 dark:text-indigo-400 hover:underline font-medium">
                      {client.email}
                    </a>
                  </div>
                </div>
              )}

              {/* Website */}
              {client.website && (
                <div className="flex items-start space-x-3">
                  <Globe className="h-4.5 w-4.5 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Website</span>
                    <a 
                      href={client.website.startsWith('http') ? client.website : `https://${client.website}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-indigo-650 dark:text-indigo-400 hover:underline font-medium inline-flex items-center space-x-1"
                    >
                      <span>{client.website}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* City */}
              {client.city && (
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4.5 w-4.5 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">City</span>
                    <span className="text-slate-900 dark:text-slate-200 font-medium">{client.city}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Tags Section */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">CRM Tags</span>
            {client.tags && client.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {client.tags.map((tag) => (
                  <span 
                    key={tag} 
                    className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50/70 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30"
                  >
                    <Tag className="h-3 w-3 mr-1 text-indigo-500" />
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-slate-400 dark:text-slate-550 italic">No tags assigned.</span>
            )}
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Notes Section */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">CRM Notes</span>
            <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-800/80 rounded-xl">
              {client.notes ? (
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {client.notes}
                </p>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic">No notes created for this client.</p>
              )}
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Timestamp Logs */}
          <div className="space-y-1 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            <div>Created at: {new Date(client.created_at).toLocaleString()}</div>
            <div>Last updated: {new Date(client.updated_at).toLocaleString()}</div>
          </div>
        </div>

        {/* Quick Actions Drawer Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex space-x-3 bg-slate-50/50 dark:bg-slate-900/20">
          <button
            onClick={(e) => onEdit(e, client)}
            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-sm transition-all space-x-1.5"
          >
            <Edit2 className="h-4 w-4" />
            <span>Edit Client</span>
          </button>
          <button
            onClick={(e) => onDelete(e, client)}
            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-700 dark:text-rose-450 font-semibold rounded-xl text-sm border border-rose-100 dark:border-rose-900/30 transition-all space-x-1.5"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Client</span>
          </button>
        </div>
      </div>
    </div>
  );
}
