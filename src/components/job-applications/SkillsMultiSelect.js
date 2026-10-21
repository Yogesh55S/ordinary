'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

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
        className="w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-md border border-mist dark:border-line bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:border-brand transition-colors"
      >
        <span>{totalChecked} of {totalItems} skills selected</span>
        <ChevronDown className={`h-3.5 w-3.5 text-brand transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full max-h-72 overflow-y-auto bg-white dark:bg-black border border-mist dark:border-line rounded-md shadow-md p-2.5 space-y-2.5">
          {categories.map((group) => {
            const checked = checkedSkills[group.category] || new Set();
            const allChecked = checked.size === group.items.length;
            return (
              <div key={group.category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand dark:text-mist">{group.category}</span>
                  <button
                    type="button"
                    onClick={() => onToggleCategory(group.category, !allChecked)}
                    className="text-[10px] font-semibold text-brand dark:text-mist hover:underline"
                  >
                    {allChecked ? 'Clear' : 'All'}
                  </button>
                </div>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isChecked = checked.has(item);
                    return (
                      <label
                        key={item}
                        className="flex items-center space-x-2 px-2 py-1 rounded hover:bg-mist/20 cursor-pointer text-xs text-black dark:text-white"
                      >
                        <span
                          className={`flex items-center justify-center h-3.5 w-3.5 rounded-sm border shrink-0 transition-colors ${
                            isChecked
                              ? 'bg-brand border-brand'
                              : 'border-mist dark:border-line bg-white dark:bg-black'
                          }`}
                        >
                          {isChecked && <Check className="h-2.5 w-2.5 text-white" />}
                        </span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => onToggleSkill(group.category, item)}
                          className="hidden"
                        />
                        <span className="text-xs">{item}</span>
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
