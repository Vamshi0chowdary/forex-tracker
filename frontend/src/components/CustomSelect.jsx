import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';

function CustomSelect({ options = [], value, onChange, id, ariaLabel }) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const rootRef = useRef(null);
  const listRef = useRef(null);
  const [rect, setRect] = useState(null);
  const [placement, setPlacement] = useState('bottom');

  useEffect(() => {
    if (open && highlighted === -1) {
      const idx = options.indexOf(value);
      setHighlighted(idx >= 0 ? idx : 0);
    }
  }, [open, highlighted, options, value]);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    function onDocClick(e) {
      if (!rootRef.current) return;
      // If the click is inside the control, keep it open.
      // Also ignore clicks inside the portaled list (listRef.current).
      const target = e.target;
      const inControl = rootRef.current && rootRef.current.contains(target);
      const inList = listRef.current && listRef.current.contains && listRef.current.contains(target);

      if (!inControl && !inList) {
        close();
      }
    }

    document.addEventListener('pointerdown', onDocClick);
    return () => document.removeEventListener('pointerdown', onDocClick);
  }, [close]);

  // measure control rect when opening dropdown
  useEffect(() => {
    if (open && rootRef.current) {
      const r = rootRef.current.getBoundingClientRect();
      setRect(r);
      setPlacement(window.innerHeight - r.bottom < 280 ? 'top' : 'bottom');
    }
  }, [open]);

  // update rect on resize/scroll while open
  useEffect(() => {
    if (!open) return undefined;
    function onUpdate() {
      if (rootRef.current) {
        const nextRect = rootRef.current.getBoundingClientRect();
        setRect(nextRect);
        setPlacement(window.innerHeight - nextRect.bottom < 280 ? 'top' : 'bottom');
      }
    }
    window.addEventListener('resize', onUpdate);
    window.addEventListener('scroll', onUpdate, true);
    return () => {
      window.removeEventListener('resize', onUpdate);
      window.removeEventListener('scroll', onUpdate, true);
    };
  }, [open]);

  const selectIndex = useCallback((idx) => {
    if (idx < 0 || idx >= options.length) return;
    onChange(options[idx]);
    setOpen(false);
  }, [onChange, options]);

  const onKeyDown = useCallback((e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setHighlighted((h) => Math.min(options.length - 1, Math.max(0, h + 1)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setOpen(true);
      setHighlighted((h) => Math.min(options.length - 1, Math.max(0, h - 1)));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (open && highlighted >= 0) {
        selectIndex(highlighted);
      } else {
        setOpen(true);
      }
    } else if (e.key === 'Escape') {
      close();
    } else if (e.key === 'Home') {
      e.preventDefault();
      setHighlighted(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setHighlighted(options.length - 1);
    }
  }, [close, open, highlighted, options.length, selectIndex]);

  useEffect(() => {
    if (open && listRef.current && highlighted >= 0) {
      const el = listRef.current.children[highlighted];
      if (el) el.scrollIntoView({ block: 'nearest' });
    }
  }, [open, highlighted]);

  return (
    <div className="custom-select" ref={rootRef} id={id}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={ariaLabel}
        className="custom-select__control"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onKeyDown}
      >
        <span className="custom-select__value">{value}</span>
        <span className="custom-select__caret" aria-hidden />
      </button>

      {open && rect
        ? createPortal(
            <motion.ul
              role="listbox"
              tabIndex={-1}
              ref={listRef}
              className="custom-select__list custom-select__list--portal"
              aria-label={ariaLabel}
              initial={{ opacity: 0, y: placement === 'bottom' ? -10 : 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: placement === 'bottom' ? -8 : 8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'fixed',
                left: rect.left,
                width: rect.width,
                zIndex: 9999,
                pointerEvents: 'auto',
                ...(placement === 'bottom'
                  ? { top: rect.bottom + 10 }
                  : { bottom: window.innerHeight - rect.top + 10 }),
              }}
            >
              {options.map((opt, i) => {
                const selected = opt === value;
                const highlightedClass = i === highlighted ? 'custom-select__option--highlighted' : '';
                const selClass = selected ? 'custom-select__option--selected' : '';

                return (
                  <motion.li
                    key={opt}
                    role="option"
                    aria-selected={selected}
                    className={`custom-select__option ${highlightedClass} ${selClass}`}
                    onMouseEnter={() => setHighlighted(i)}
                    onClick={() => selectIndex(i)}
                    whileHover={{ x: 2 }}
                    transition={{ duration: 0.12 }}
                  >
                    {opt}
                  </motion.li>
                );
              })}
            </motion.ul>,
            document.body,
          )
        : null}
    </div>
  );
}

export default CustomSelect;
