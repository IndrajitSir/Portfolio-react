import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { FiCode, FiX } from 'react-icons/fi';

// Lazy-load the heavy panel so it doesn't inflate the About bundle.
const loadPanel = () => import('./InteractiveCodePanel');
const InteractiveCodePanel = lazy(loadPanel);

const EASE = [0.22, 1, 0.36, 1] as const;

/** The 50 × 50 trigger button — matches TerminalGoo's footprint. */
function CodePanelButton({
  onClick,
  onPointerEnter,
  btnRef,
}: {
  onClick: () => void;
  onPointerEnter: () => void;
  btnRef: React.Ref<HTMLButtonElement>;
}) {
  return (
    <button
      ref={btnRef}
      type="button"
      onClick={onClick}
      onPointerEnter={onPointerEnter}
      aria-label="Open interactive code panel"
      title="Open code panel"
      className="
        relative h-[50px] w-[50px] shrink-0 rounded-xl
        border-2 cursor-pointer
        flex items-center justify-center
        transition-all duration-300
        hover:-translate-y-0.5
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4
      "
      style={{
        borderColor: 'var(--accent-indigo)',
        background: 'var(--glow-indigo, rgba(99,102,241,0.08))',
        color: 'var(--accent-indigo)',
        boxShadow: '0 0 14px var(--glow-indigo, rgba(99,102,241,0.18))',
        outlineColor: 'var(--accent-indigo)',
      }}
    >
      <FiCode size={22} aria-hidden="true" />
    </button>
  );
}

/** Full-screen backdrop + centred panel modal. */
function CodePanelModal({ onClose }: { onClose: () => void }) {
  // Escape key to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Scroll lock while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
      style={{ background: 'rgba(2,6,12,0.75)', backdropFilter: 'blur(6px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      aria-modal="true"
      role="dialog"
      aria-label="Interactive code panel"
    >
      <motion.div
        className="relative w-full max-w-2xl"
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.22, ease: EASE }}
      >
        {/* Close button in top-right corner of the panel */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close code panel"
          className="
            absolute -top-3 -right-3 z-10
            flex h-7 w-7 items-center justify-center
            rounded-full border border-[var(--border)]
            bg-[var(--surface)] text-[var(--text-muted)]
            transition-colors hover:border-[var(--accent-indigo)] hover:text-[var(--accent-indigo)]
          "
        >
          <FiX size={13} aria-hidden="true" />
        </button>

        <Suspense fallback={
          <div
            className="flex h-48 items-center justify-center rounded-2xl border border-[var(--border-strong)]"
            style={{ background: 'var(--panel)', color: 'var(--text-muted)' }}
          >
            <span className="font-mono-code text-xs animate-pulse">Loading…</span>
          </div>
        }>
          <InteractiveCodePanel />
        </Suspense>
      </motion.div>
    </motion.div>,
    document.body,
  );
}

/** Drop-in beside TerminalLauncher — same flex-row slot, no layout changes needed. */
export default function CodePanelLauncher() {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    btnRef.current?.focus();
  }, []);

  return (
    <>
      <CodePanelButton
        btnRef={btnRef}
        onClick={() => setOpen(true)}
        onPointerEnter={() => void loadPanel()}
      />
      <AnimatePresence>
        {open && <CodePanelModal key="code-panel" onClose={close} />}
      </AnimatePresence>
    </>
  );
}

