import { Fragment, type ReactNode } from 'react';
import { terminalData as d } from '../../data/terminal';

export interface CommandContext {
  clear: () => void;
  close: () => void;
  run: (input: string) => void;
}

export interface Command {
  name: string;
  desc: string;
  hidden?: boolean;
  run: (args: string[], ctx: CommandContext) => ReactNode;
}

export const ACCENT = 'var(--accent-teal, #2dd4bf)';
export const MUTED = '#8b9bb0';
const ERROR = '#ff7b72';

const Heading = ({ children }: { children: ReactNode }) => (
  <div className="mb-1 font-semibold" style={{ color: ACCENT }}>{children}</div>
);

const A = ({ href, children }: { href: string; children: ReactNode }) => (
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

const RunLink = ({ cmd, ctx }: { cmd: string; ctx: CommandContext }) => (
  <button
    type="button"
    onClick={() => ctx.run(cmd)}
    className="text-left underline-offset-2 hover:underline"
    style={{ color: ACCENT }}
  >
    {cmd}
  </button>
);

const FILES: Record<string, string> = {
  'about.txt': 'about',
  'skills.txt': 'skills',
  'experience.txt': 'experience',
  'education.txt': 'education',
  'projects.md': 'projects',
  'contact.txt': 'contact',
};
export const FILE_NAMES = Object.keys(FILES);

const LOGO = [
  ' ___ __  __ ',
  '|_ _|  \\/  |',
  ' | || |\\/| |',
  ' | || |   | |',
  '|___|_|   |_|',
];

export const commands: Command[] = [
  {
    name: 'help',
    desc: 'List available commands',
    run: (_a, ctx) => (
      <div>
        <Heading>Available commands</Heading>
        <div className="grid grid-cols-[110px_1fr] gap-x-3 gap-y-0.5">
          {commands.filter((c) => !c.hidden).map((c) => (
            <Fragment key={c.name}>
              <RunLink cmd={c.name} ctx={ctx} />
              <span style={{ color: MUTED }}>{c.desc}</span>
            </Fragment>
          ))}
        </div>
        <p className="mt-2" style={{ color: MUTED }}>
          Tip: Tab autocompletes, ↑/↓ browse history, Ctrl+L clears. Click any command to run it.
        </p>
      </div>
    ),
  },
  {
    name: 'whoami',
    desc: 'Who is this?',
    run: () => (
      <div>
        <span style={{ color: ACCENT }}>{d.name}</span> ({d.handle}), {d.role} at {d.company}.
        <div style={{ color: MUTED }}>{d.location}</div>
      </div>
    ),
  },
  {
    name: 'about',
    desc: 'A short bio',
    run: () => (
      <div>
        <Heading>About</Heading>
        {d.bio.map((line) => <p key={line}>{line}</p>)}
      </div>
    ),
  },
  {
    name: 'skills',
    desc: 'Tech stack by category',
    run: () => (
      <div>
        <Heading>Skills</Heading>
        {Object.entries(d.skills).map(([group, items]) => (
          <div key={group} className="flex gap-3">
            <span className="w-24 shrink-0" style={{ color: ACCENT }}>{group}</span>
            <span>{items.join(' · ')}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    name: 'experience',
    desc: 'Work history',
    run: () => (
      <div className="space-y-2">
        <Heading>Experience</Heading>
        {d.experience.map((e) => (
          <div key={e.role + e.company}>
            <div>
              <span style={{ color: ACCENT }}>{e.role}</span> @ {e.company}
              {e.period && <span style={{ color: MUTED }}> ({e.period})</span>}
            </div>
            {e.points.map((p) => (
              <div key={p} style={{ color: MUTED }}>  - {p}</div>
            ))}
          </div>
        ))}
      </div>
    ),
  },
  {
    name: 'education',
    desc: 'Academic background',
    run: () => (
      <div>
        <Heading>Education</Heading>
        {d.education.map((e) => (
          <div key={e.degree}>
            <span style={{ color: ACCENT }}>{e.degree}</span>, {e.school}
            <span style={{ color: MUTED }}> ({e.affiliation})</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    name: 'projects',
    desc: 'Things I have built',
    run: () => (
      <div className="space-y-2">
        <Heading>Projects</Heading>
        {d.projects.map((p) => (
          <div key={p.name}>
            <div style={{ color: ACCENT }}>{p.name}</div>
            {p.stack && <div style={{ color: MUTED }}>{p.stack}</div>}
            <div>{p.desc}</div>
            {p.link && <A href={p.link}>{p.link}</A>}
          </div>
        ))}
      </div>
    ),
  },
  {
    name: 'contact',
    desc: 'How to reach me',
    run: () => (
      <div>
        <Heading>Contact</Heading>
        <div>email    <A href={`mailto:${d.contact.email}`}>{d.contact.email}</A></div>
        <div>github   <A href={d.contact.github}>{d.contact.github}</A></div>
        {d.contact.linkedin && (
          <div>linkedin <A href={d.contact.linkedin}>{d.contact.linkedin}</A></div>
        )}
        <div style={{ color: MUTED }}>based in {d.location}</div>
      </div>
    ),
  },
  {
    name: 'neofetch',
    desc: 'System-info style summary',
    run: () => {
      const info: ReactNode[] = [
        <><span style={{ color: ACCENT }}>visitor</span>@<span style={{ color: ACCENT }}>indrajit</span></>,
        '--------------------',
        <><b>Role</b>: {d.role}</>,
        <><b>Company</b>: {d.company}</>,
        <><b>Location</b>: {d.location}</>,
        <><b>Stack</b>: {Object.values(d.skills).flat().slice(0, 4).join(', ')}</>,
        <><b>Shell</b>: portfolio-sh</>,
      ];
      return (
        <div className="overflow-x-auto">
          {info.map((line, i) => (
            <div key={i} className="whitespace-pre">
              <span style={{ color: ACCENT }}>{(LOGO[i] ?? '').padEnd(14, ' ')}</span>
              {line}
            </div>
          ))}
        </div>
      );
    },
  },
  {
    name: 'ls',
    desc: 'List files',
    run: () => (
      <div className="flex flex-wrap gap-x-5">
        {FILE_NAMES.map((f) => <span key={f} style={{ color: ACCENT }}>{f}</span>)}
      </div>
    ),
  },
  {
    name: 'cat',
    desc: 'Read a file, e.g. cat about.txt',
    run: (args, ctx) => {
      const file = args[0];
      if (!file) return <span style={{ color: MUTED }}>usage: cat &lt;file&gt;</span>;
      const target = FILES[file];
      if (!target) return <span style={{ color: ERROR }}>cat: {file}: No such file or directory</span>;
      return byName[target].run([], ctx);
    },
  },
  { name: 'pwd', desc: 'Print working directory', hidden: true, run: () => '/home/visitor/indrajit' },
  { name: 'date', desc: 'Current date', hidden: true, run: () => new Date().toString() },
  { name: 'echo', desc: 'Echo text', hidden: true, run: (args) => args.join(' ') },
  {
    name: 'sudo',
    desc: 'Try it 😉',
    hidden: true,
    run: (args) =>
      args.join(' ').toLowerCase().startsWith('hire') ? (
        <div>
          <span style={{ color: ACCENT }}>Permission granted.</span> Great decision. Send a message to{' '}
          <A href={`mailto:${d.contact.email}`}>{d.contact.email}</A>
        </div>
      ) : (
        <span style={{ color: ERROR }}>visitor is not in the sudoers file. This incident will be reported.</span>
      ),
  },
  {
    name: 'clear',
    desc: 'Clear the screen',
    run: (_a, ctx) => { ctx.clear(); return null; },
  },
  {
    name: 'exit',
    desc: 'Close the terminal',
    run: (_a, ctx) => { ctx.close(); return null; },
  },
];

const byName: Record<string, Command> = Object.fromEntries(commands.map((c) => [c.name, c]));
export const commandNames = commands.map((c) => c.name);

export function execute(input: string, ctx: CommandContext): ReactNode {
  const [name, ...args] = input.trim().split(/\s+/);
  const cmd = byName[name.toLowerCase()];
  if (!cmd) {
    return (
      <span style={{ color: ERROR }}>
        bash: {name}: command not found. Try <RunLink cmd="help" ctx={ctx} />
      </span>
    );
  }
  return cmd.run(args, ctx);
}