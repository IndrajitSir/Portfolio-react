import { useEffect, useRef, useState } from 'react';
import { FiDownload } from 'react-icons/fi';

export default function ResumeButton({ href }: { href: string }) {
  const [done, setDone] = useState(false);
  const [burst, setBurst] = useState(0); // re-keys the ring so every click replays it
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const handleClick = () => {
    setDone(true);
    setBurst((n) => n + 1);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setDone(false), 1800);
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      data-state={done ? 'done' : 'idle'}
      className="
        rs-btn
        hidden 2xl:inline-flex items-center gap-1.5 px-3.5 py-1.5
        rounded-full border border-[var(--border)] bg-[var(--surface)]
        font-mono-code text-[0.68rem] uppercase tracking-wider
        text-[var(--text-secondary)]
        hover:border-[var(--accent-teal)] hover:text-[var(--accent-teal)]
        active:scale-[0.97]
        transition-all duration-200
      "
    >
      <span className="rs-icon relative inline-flex h-3 w-3 shrink-0" aria-hidden="true">
        <span key={burst} className="rs-burst" />
        <FiDownload className="rs-dl" size={12} />
        <svg
          className="rs-check"
          viewBox="0 0 24 24"
          width="12"
          height="12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
      Resume
      {/* Screen-reader confirmation, since the visual change is icon-only */}
      <span className="sr-only" role="status" aria-live="polite">
        {done ? 'Resume opened in a new tab' : ''}
      </span>
    </a>
  );
}