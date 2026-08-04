'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

// Compact popover multi-select: closed state shows "X of Y skills selected", opens into a
// checkbox panel grouped by category. Keeps the compose form's footprint small compared to
// always-expanded checkbox cards.
export default function SkillsMultiSelect({ categories, checkedSkills, onToggleSkill, onToggleCategory }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalItems = categories.reduce((sum, g) => sum + g.items.length, 0);
  const totalChecked = categories.reduce((sum, g) => sum + (checkedSkills[g.category]?.size || 0), 0);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0e1320] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
      >
        <span>{totalChecked} of {totalItems} skills selected</span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-20 mt-1.5 w-full max-h-80 overflow-y-auto bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-3 space-y-3">
          {categories.map((group) => {
            const checked = checkedSkills[group.category] || new Set();
            const allChecked = checked.size === group.items.length;
            return (
              <div key={group.category}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{group.category}</span>
                  <button
                    type="button"
                    onClick={() => onToggleCategory(group.category, !allChecked)}
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {allChecked ? 'Clear' : 'All'}
                  </button>
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isChecked = checked.has(item);
                    return (
                      <label
                        key={item}
                        className="flex items-center space-x-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer text-xs text-slate-700 dark:text-slate-300"
                      >
                        <span
                          className={`flex items-center justify-center h-4 w-4 rounded border shrink-0 transition-colors ${
                            isChecked
                              ? 'bg-indigo-600 border-indigo-600'
                              : 'border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {isChecked && <Check className="h-3 w-3 text-white" />}
                        </span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => onToggleSkill(group.category, item)}
                          className="hidden"
                        />
                        <span>{item}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
