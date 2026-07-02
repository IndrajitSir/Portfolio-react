interface TagProps {
  label: string
  variant?: 'default' | 'accent' | 'indigo'
}

const variants = {
  default: 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)]',
  accent:  'bg-[var(--glow-teal)] border-[var(--border-glow)] text-[var(--accent-teal)]',
  indigo:  'bg-[var(--glow-indigo)] border-[rgba(129,140,248,0.25)] text-[var(--accent-indigo)]',
}

export default function Tag({ label, variant = 'default' }: TagProps) {
  return (
    <span
      className={`
        inline-block px-3 py-1 rounded-full border font-mono-code text-[0.72rem]
        transition-all duration-200 hover:scale-105
        ${variants[variant]}
      `}
    >
      {label}
    </span>
  )
}
