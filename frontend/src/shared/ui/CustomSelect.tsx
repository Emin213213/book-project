import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon.tsx';
import styles from './CustomSelect.module.css';

export interface SelectOption {
  value: string | number;
  label: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  required?: boolean;
  size?: 'normal' | 'compact';
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = 'Оберіть...',
  required,
  size = 'normal',
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);

  // Position dropdown
  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setDropPos({
      top: rect.bottom + 4,
      left: rect.left,
      width: Math.max(rect.width, 220),
    });
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        dropRef.current && !dropRef.current.contains(target)
      ) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on external scroll
  useEffect(() => {
    if (!open) return;
    const handler = (e: Event) => {
      // Ignore scroll inside dropdown itself
      if (dropRef.current && dropRef.current.contains(e.target as Node)) return;
      setOpen(false);
      setSearch('');
    };
    window.addEventListener('scroll', handler, true);
    return () => window.removeEventListener('scroll', handler, true);
  }, [open]);

  // Focus search on open
  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

  const filtered = search
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const handleSelect = (opt: SelectOption) => {
    onChange(opt.value);
    setOpen(false);
    setSearch('');
  };

  const hiddenValue = value === 0 || value === '' ? '' : String(value);

  return (
    <div className={`${styles.wrapper} ${size === 'compact' ? styles.compact : ''}`}>
      <button
        ref={triggerRef}
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ''} ${!selected ? styles.triggerPlaceholder : ''}`}
        onClick={() => setOpen(!open)}
      >
        <span className={styles.triggerText}>
          {selected ? selected.label : placeholder}
        </span>
        <Icon name={open ? 'expand_less' : 'expand_more'} />
      </button>

      {required && (
        <input
          className={styles.hiddenInput}
          tabIndex={-1}
          value={hiddenValue}
          required
          onChange={() => {}}
        />
      )}

      {open && createPortal(
        <div
          ref={dropRef}
          className={styles.dropdown}
          style={{ top: dropPos.top, left: dropPos.left, width: dropPos.width }}
        >
          {options.length > 5 && (
            <div className={styles.searchWrap}>
              <Icon name="search" />
              <input
                ref={searchRef}
                className={styles.searchInput}
                type="text"
                placeholder="Пошук..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}
          <div className={styles.list}>
            {filtered.length === 0 ? (
              <div className={styles.noResults}>Нічого не знайдено</div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`${styles.option} ${opt.value === value ? styles.optionActive : ''}`}
                  onClick={() => handleSelect(opt)}
                >
                  <span>{opt.label}</span>
                  {opt.value === value && <Icon name="check" />}
                </button>
              ))
            )}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}