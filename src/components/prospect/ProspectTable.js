'use client';

import {
  Globe, PhoneOff, Phone, Star,
  CheckSquare, Square, UserPlus, ExternalLink,
  CheckCircle2, Clock, UserCheck,
} from 'lucide-react';
import { mapPlaceTypeToCategory } from '@/lib/placeUtils';

export default function ProspectTable({ results, selectedIds, onSelectRow, onSelectAll, onAddClient, clientStatusMap = {} }) {
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <Globe className="h-7 w-7 text-slate-400 dark:text-slate-500" />
        </div>
        <p className="text-slate-600 dark:text-slate-400 font-semibold">No results match this filter</p>
        <p className="text-slate-400 dark:text-slate-600 text-sm mt-1">Try changing the filter or search for something else.</p>
      </div>
    );
  }

  const allSelected = results.length > 0 && selectedIds.length === results.length;

  return (
    <>
    {/* Mobile & tablet: card list */}
    <div className="lg:hidden">
      <button
        onClick={onSelectAll}
        className="flex w-full items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400"
      >
        {allSelected ? <CheckSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> : <Square className="h-5 w-5" />}
        <span>Select all · {results.length}</span>
      </button>
      <ul className="divide-y divide-slate-100 dark:divide-slate-800/40">
        {results.map((place) => {
          const isSelected = selectedIds.includes(place.place_id);
          const status = clientStatusMap[place.place_id];
          return (
            <li
              key={place.place_id}
              className={`flex gap-3 px-4 py-3.5 ${isSelected ? 'bg-indigo-50/50 dark:bg-indigo-950/10' : ''}`}
            >
              <button
                onClick={() => onSelectRow(place.place_id)}
                className="self-start pt-0.5 text-slate-400"
                aria-label={`Select ${place.name}`}
              >
                {isSelected ? <CheckSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> : <Square className="h-5 w-5" />}
              </button>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-sm text-slate-800 dark:text-slate-100 leading-snug">{place.name}</p>
                  {place.rating != null && (
                    <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                      {place.rating}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300">
                    {mapPlaceTypeToCategory(place.types)}
                  </span>
                  {place.website ? (
                    <a
                      href={place.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400"
                    >
                      <Globe className="h-3 w-3 mr-1" /> Website
                    </a>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400">No Website</span>
                  )}
                </div>
                {place.formatted_address && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{place.formatted_address}</p>
                )}
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  {place.formatted_phone_number ? (
                    <a href={`tel:${place.formatted_phone_number}`} className="inline-flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-300">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      {place.formatted_phone_number}
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-400"><PhoneOff className="h-3.5 w-3.5" /> Not listed</span>
                  )}
                  <ProspectAction status={status} onAdd={() => onAddClient(place)} />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>

    {/* Desktop: table */}
    <div className="hidden lg:block overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800/60">
        <thead>
          <tr className="bg-slate-50/70 dark:bg-ink-900/60">
            <th className="px-4 py-3 w-10">
              <button
                onClick={onSelectAll}
                className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                aria-label="Select all"
              >
                {allSelected
                  ? <CheckSquare className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400" />
                  : <Square className="h-4.5 w-4.5" />
                }
              </button>
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Business</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Phone</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Website</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rating</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Address</th>
            <th className="px-4 py-3 w-32 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pr-5">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
          {results.map((place) => {
            const isSelected = selectedIds.includes(place.place_id);
            const hasWebsite = !!place.website;
            const category = mapPlaceTypeToCategory(place.types);
            const status = clientStatusMap[place.place_id];

            return (
              <tr
                key={place.place_id}
                className={`transition-colors ${isSelected ? 'bg-indigo-50/50 dark:bg-indigo-950/10' : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/20'}`}
              >
                <td className="px-4 py-3.5">
                  <button
                    onClick={() => onSelectRow(place.place_id)}
                    className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {isSelected
                      ? <CheckSquare className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400" />
                      : <Square className="h-4.5 w-4.5" />
                    }
                  </button>
                </td>

                <td className="px-4 py-3.5 min-w-[160px]">
                  <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 leading-tight">{place.name}</p>
                  {place.business_status && place.business_status !== 'OPERATIONAL' && (
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wide">
                      {place.business_status.replace(/_/g, ' ')}
                    </span>
                  )}
                </td>

                <td className="px-4 py-3.5">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/30 whitespace-nowrap">
                    {category}
                  </span>
                </td>

                <td className="px-4 py-3.5 min-w-[140px]">
                  {place.formatted_phone_number ? (
                    <div className="flex items-center space-x-1.5 text-sm text-slate-700 dark:text-slate-300">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="whitespace-nowrap">{place.formatted_phone_number}</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1.5 text-sm text-slate-400 dark:text-slate-600">
                      <PhoneOff className="h-3.5 w-3.5 shrink-0" />
                      <span>Not listed</span>
                    </div>
                  )}
                </td>

                <td className="px-4 py-3.5">
                  {hasWebsite ? (
                    <div className="flex items-center space-x-1.5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30 whitespace-nowrap">
                        <Globe className="h-3 w-3 mr-1 shrink-0" />
                        Has Website
                      </span>
                      <a
                        href={place.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        title={place.website}
                        onClick={e => e.stopPropagation()}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-900/30 whitespace-nowrap">
                      No Website
                    </span>
                  )}
                </td>

                <td className="px-4 py-3.5">
                  {place.rating != null ? (
                    <div className="flex items-center space-x-1">
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{place.rating}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-400">—</span>
                  )}
                </td>

                <td className="px-4 py-3.5 text-xs text-slate-500 dark:text-slate-400 max-w-[200px]">
                  <span className="block truncate" title={place.formatted_address}>
                    {place.formatted_address}
                  </span>
                </td>

                <td className="px-4 py-3.5 text-right pr-5">
                  <ProspectAction status={status} onAdd={() => onAddClient(place)} />
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

function ProspectAction({ status, onAdd }) {
  if (status?.hasSent) {
    return (
      <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30 whitespace-nowrap">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
        <span>Message Sent</span>
      </span>
    );
  }
  if (status?.hasPending) {
    return (
      <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30 whitespace-nowrap">
        <Clock className="h-3.5 w-3.5 shrink-0" />
        <span>In Queue</span>
      </span>
    );
  }
  if (status?.clientId) {
    return (
      <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/30 whitespace-nowrap">
        <UserCheck className="h-3.5 w-3.5 shrink-0" />
        <span>Already Added</span>
      </span>
    );
  }
  return (
    <button
      onClick={onAdd}
      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition-all shadow-sm whitespace-nowrap"
    >
      <UserPlus className="h-3.5 w-3.5 shrink-0" />
      <span>Add Client</span>
    </button>
  );
}
