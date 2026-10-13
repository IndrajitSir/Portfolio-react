import type { ReactNode } from 'react';
import type { CommandContext } from './Commands';

/**
 * The terminal's presentational pieces.
 *
 * These three render-only helpers (and the two palette constants they share)
 * used to live at the top of `Commands.tsx`. That file's real job is data —
 * the command list, `execute`, `FILE_NAMES` — and a file that exports both
 * data and components is not a Fast Refresh boundary, which `react-refresh`
 * rightly complains about. Splitting the components out lets `Commands.tsx`
 * stay a pure data module and this file a pure view module; consumers import
 * the colour constants from here directly.
 */

export const ACCENT = 'var(--accent-teal, #2dd4bf)';
export const MUTED = '#8b9bb0';

export const Heading = ({ children }: { children: ReactNode }) => (
  <div className="mb-1 font-semibold" style={{ color: ACCENT }}>{children}</div>
);

export const A = ({ href, children }: { href: string; children: ReactNode }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="underline underline-offset-2 hover:opacity-80"
    style={{ color: ACCENT }}
  >
    {children}
  </a>
);

export const RunLink = ({ cmd, ctx }: { cmd: string; ctx: CommandContext }) => (
  <button
    type="button"
    onClick={() => ctx.run(cmd)}
    className="text-left underline-offset-2 hover:underline"
    style={{ color: ACCENT }}
  >
    {cmd}
  </button>
);
