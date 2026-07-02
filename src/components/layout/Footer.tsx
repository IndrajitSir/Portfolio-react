import { FiGithub, FiMail } from 'react-icons/fi'
import { personalInfo } from '@/data'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      className="relative z-10 border-t border-[var(--border)]"
      style={{ background: 'var(--bg-secondary)' }}
    >
      <div className="max-container section-padding py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="font-mono-code text-xs text-[var(--text-muted)]">
          Designed & built by{' '}
          <span className="text-[var(--accent-teal)]">Indrajit Mandal</span>{' '}
          · {year}
        </p>

        <div className="flex items-center gap-4">
          <a
            href={personalInfo.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub profile"
            className="text-[var(--text-muted)] hover:text-[var(--accent-teal)] transition-colors duration-200"
          >
            <FiGithub size={16} />
          </a>
          <a
            href={`mailto:${personalInfo.email}`}
            aria-label="Send email"
            className="text-[var(--text-muted)] hover:text-[var(--accent-teal)] transition-colors duration-200"
          >
            <FiMail size={16} />
          </a>
        </div>
      </div>
    </footer>
  )
}
