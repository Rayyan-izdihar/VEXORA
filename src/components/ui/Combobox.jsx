'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import { FieldWrapper } from './Input';

export function Combobox({
  label,
  options = [], // [{ value, label, sublabel? }]
  value,
  onChange,
  placeholder = 'Pilih salah satu...',
  searchPlaceholder = 'Cari...',
  error,
  helper,
  required,
  id,
}) {
  const [open, setOpen] = useState(false);
  const [queryText, setQueryText] = useState('');
  const containerRef = useRef(null);

  const selected = options.find((o) => o.value === value);
  const filtered = options.filter((o) => {
    const q = queryText.toLowerCase();
    return (
      o.label.toLowerCase().includes(q) ||
      (o.sublabel && o.sublabel.toLowerCase().includes(q))
    );
  });

  useEffect(() => {
    function handleOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function handleEsc(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  return (
    <FieldWrapper label={label} htmlFor={id} helper={helper} error={error} required={required}>
      <div className="relative" ref={containerRef}>
        <button
          id={id}
          type="button"
          aria-expanded={open}
          aria-haspopup="listbox"
          onClick={() => setOpen((prev) => !prev)}
          className={`w-full h-12 px-3.5 rounded-[12px] bg-white border text-sm text-left flex items-center justify-between gap-2 focus:outline-none focus:border-ink-900 focus:ring-2 focus:ring-lime-400 ${
            error ? 'border-status-danger-fg' : 'border-line-200'
          }`}
        >
          <span className={selected ? 'text-ink-900 truncate' : 'text-ink-400 truncate'}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown className="w-4 h-4 text-ink-600 shrink-0" aria-hidden="true" />
        </button>

        {open && (
          <div className="absolute z-40 mt-1.5 w-full rounded-[12px] bg-white border border-line-200 shadow-[var(--shadow-pop)] overflow-hidden">
            <div className="p-2 border-b border-line-200 flex items-center gap-2 bg-cream-50">
              <Search className="w-4 h-4 text-ink-400 shrink-0" aria-hidden="true" />
              <input
                type="text"
                autoFocus
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
              />
            </div>
            <ul role="listbox" className="max-h-56 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <li className="px-3.5 py-2.5 text-sm text-ink-600">Tidak ada hasil cocok.</li>
              ) : (
                filtered.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <li key={opt.value}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          onChange(opt.value);
                          setOpen(false);
                          setQueryText('');
                        }}
                        className={`w-full px-3.5 py-2.5 text-left text-sm flex items-center justify-between gap-2 hover:bg-cream-100 ${
                          isSelected ? 'bg-lime-100 font-semibold text-ink-900' : 'text-ink-900'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="truncate">{opt.label}</div>
                          {opt.sublabel && (
                            <div className="text-xs text-ink-600 truncate">{opt.sublabel}</div>
                          )}
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-ink-900 shrink-0" />}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        )}
      </div>
    </FieldWrapper>
  );
}
