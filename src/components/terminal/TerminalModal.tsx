import {
  useCallback, useEffect, useRef, useState,
  type KeyboardEvent, type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { ACCENT, MUTED, commandNames, execute, FILE_NAMES, type CommandContext } from './Commands';
import { terminalData as d } from '../../data/terminal';

interface Entry { id: number; cmd: string | null; out: ReactNode }

const QUICK = ['help', 'about', 'skills', 'projects', 'contact'];

const Prompt = () => (
  <span className="shrink-0 select-none">
    <span style={{ color: ACCENT }}>visitor@indrajit</span>
    <span style={{ color: MUTED }}>:~$</span>
  </span>
);

export default function TerminalModal({ onClose }: { onClose: () => void }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [showBanner, setShowBanner] = useState(true);
  const [value, setValue] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const history = useRef<string[]>([]);
  const cursor = useRef(-1);
  const draft = useRef('');
  const idRef = useRef(0);
  const runRef = useRef<(raw: string) => void>(() => {});

  const push = useCallback((cmd: string | null, out: ReactNode) => {
    setEntries((e) => [...e, { id: ++idRef.current, cmd, out }]);
  }, []);

  const run = useCallback(
    (raw: string) => {
      const input = raw.trim();
      cursor.current = -1;
      if (!input) { push('', null); return; }
      history.current.push(input);

      let cleared = false;
      const ctx: CommandContext = {
        clear: () => { cleared = true; setEntries([]); setShowBanner(false); },
        close: onClose,
        run: (c) => runRef.current(c),
      };
      const out = execute(input, ctx);
      if (!cleared) push(input, out);
    },
    [onClose, push],
  );
  runRef.current = run;

  // Scroll lock, Escape to close, initial focus
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: globalThis.KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    inputRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  // Keep the newest output in view
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [entries, showBanner]);

  const complete = () => {
    const parts = value.split(/\s+/);
    const pool = parts.length === 1 ? commandNames : parts[0] === 'cat' && parts.length === 2 ? FILE_NAMES : [];
    const stem = parts[parts.length - 1];
    const matches = pool.filter((n) => n.startsWith(stem));
    if (matches.length === 1) {
      setValue([...parts.slice(0, -1), matches[0]].join(' ') + (parts.length === 1 ? ' ' : ''));
    } else if (matches.length > 1) {
      push(value, <span style={{ color: MUTED }}>{matches.join('   ')}</span>);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const h = history.current;
    if (e.key === 'Enter') {
      run(value);
      setValue('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!h.length) return;
      if (cursor.current === -1) { draft.current = value; cursor.current = h.length - 1; }
      else cursor.current = Math.max(0, cursor.current - 1);
      setValue(h[cursor.current]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (cursor.current === -1) return;
      cursor.current += 1;
      if (cursor.current >= h.length) { cursor.current = -1; setValue(draft.current); }
      else setValue(h[cursor.current]);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      complete();
    } else if (e.ctrlKey && e.key.toLowerCase() === 'l') {
      e.preventDefault();
      setEntries([]);
      setShowBanner(false);
    } else if (e.ctrlKey && e.key.toLowerCase() === 'c') {
      e.preventDefault();
      push(value + '^C', null);
      setValue('');
    }
  };

  const ctxForUi: CommandContext = {
    clear: () => {}, close: onClose, run: (c) => runRef.current(c),
  };

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
      style={{ background: 'rgba(2,6,12,0.72)', backdropFilter: 'blur(6px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Interactive terminal"
        data-lenis-prevent
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="flex h-[min(580px,82vh)] w-full max-w-3xl flex-col overflow-hidden rounded-xl border shadow-2xl"
        style={{
          background: '#0a0e14',
          color: '#cbd5e1',
          borderColor: 'rgba(148,163,184,0.25)',
          boxShadow: '0 0 40px rgba(45,212,191,0.12), 0 25px 60px rgba(0,0,0,0.6)',
        }}
      >
        {/* Title bar */}
        <div className="flex items-center gap-2 border-b px-3 py-2" style={{ borderColor: 'rgba(148,163,184,0.15)', background: '#0f141b' }}>
          <button type="button" onClick={onClose} aria-label="Close terminal" className="h-3 w-3 rounded-full" style={{ background: '#ff5f57' }} />
          <span className="h-3 w-3 rounded-full" style={{ background: '#febc2e' }} />
          <span className="h-3 w-3 rounded-full" style={{ background: '#28c840' }} />
          <span className="mx-auto font-mono text-xs" style={{ color: MUTED }}>visitor@indrajit: ~</span>
          <button type="button" onClick={onClose} aria-label="Close terminal" className="p-1 hover:opacity-70" style={{ color: MUTED }}>
            <FiX size={14} />
          </button>
        </div>

        {/* Screen */}
        <div
          ref={bodyRef}
          className="flex-1 overflow-y-auto px-4 py-3 font-mono text-[13px] leading-relaxed"
          onClick={() => { if (!window.getSelection()?.toString()) inputRef.current?.focus(); }}
        >
          {showBanner && (
            <div className="mb-3">
              <div style={{ color: ACCENT }}>Welcome to {d.name}&apos;s portfolio shell v1.0</div>
              <div style={{ color: MUTED }}>
                Type <b>help</b> to see what you can run, or press Esc to leave.
              </div>
            </div>
          )}

          {entries.map((e) => (
            <div key={e.id} className="mb-2">
              {e.cmd !== null && e.cmd !== undefined && (
                <div className="flex gap-2"><Prompt /><span className="break-all">{e.cmd}</span></div>
              )}
              {e.cmd === null && e.out === null && null}
              {e.out !== null && <div className="mt-1 whitespace-pre-wrap break-words">{e.out}</div>}
            </div>
          ))}

          <div className="flex items-center gap-2">
            <Prompt />
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => { setValue(e.target.value); cursor.current = -1; }}
              onKeyDown={onKeyDown}
              aria-label="Terminal input"
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="off"
              spellCheck={false}
              className="min-w-0 flex-1 bg-transparent font-mono text-[13px] outline-none"
              style={{ caretColor: ACCENT, color: '#e2e8f0' }}
            />
          </div>
        </div>

        {/* Quick commands (handy on mobile keyboards) */}
        <div className="flex flex-wrap gap-2 border-t px-3 py-2" style={{ borderColor: 'rgba(148,163,184,0.15)', background: '#0f141b' }}>
          {QUICK.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => { ctxForUi.run(c); inputRef.current?.focus(); }}
              className="rounded-md border px-2 py-0.5 font-mono text-xs hover:opacity-80"
              style={{ borderColor: 'rgba(148,163,184,0.25)', color: ACCENT }}
            >
              {c}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}