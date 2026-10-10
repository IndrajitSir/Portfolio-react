import { lazy, Suspense, useCallback, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import TerminalGoo from '../ui/TerminalGoo';

const loadModal = () => import('./terminalModal');
const TerminalModal = lazy(loadModal);

export default function TerminalLauncher() {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    btnRef.current?.focus();
  }, []);

  return (
    <>
      <TerminalGoo
        buttonRef={btnRef}
        onClick={() => setOpen(true)}
        onPointerEnter={() => void loadModal()} // prefetch the chunk on hover
      />
      <AnimatePresence>
        {open && (
          <Suspense key="terminal" fallback={null}>
            <TerminalModal onClose={close} />
          </Suspense>
        )}
      </AnimatePresence>
    </>
  );
}