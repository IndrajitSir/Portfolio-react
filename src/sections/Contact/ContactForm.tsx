import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSend, FiCheck, FiBriefcase, FiCode, FiMessageCircle } from 'react-icons/fi'
import { personalInfo } from '@/data'
import { DURATION, EASE_OUT_EXPO, EASE_STANDARD } from '@/utils/motion'

interface FormState {
  name: string
  email: string
  message: string
}

type Status = 'idle' | 'sending' | 'sent' | 'error'

/**
 * Conversation intents. Choosing one does two useful things: it seeds the
 * message with a concrete starting point (only when the field is still empty, so
 * nothing a visitor typed is ever overwritten) and it sets the email subject, so
 * the message that lands in the inbox is already triaged.
 */
const INTENTS = [
  {
    id: 'hiring',
    label: 'Hiring',
    icon: FiBriefcase,
    subject: 'Role opportunity',
    seed: "Hi Indrajit,\n\nWe're hiring for a role I think you'd be a strong fit for. Here's the context:\n\n",
  },
  {
    id: 'collab',
    label: 'Collaboration',
    icon: FiCode,
    subject: 'Project collaboration',
    seed: "Hi Indrajit,\n\nI'd like to collaborate on something and thought of your work:\n\n",
  },
  {
    id: 'hello',
    label: 'Just saying hi',
    icon: FiMessageCircle,
    subject: 'Hello',
    seed: '',
  },
] as const

type IntentId = (typeof INTENTS)[number]['id']

export default function ContactForm() {
  const [form, setForm]     = useState<FormState>({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<Status>('idle')
  const [intent, setIntent] = useState<IntentId | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const chooseIntent = (id: IntentId) => {
    setIntent(id)
    const chosen = INTENTS.find((i) => i.id === id)
    if (!chosen) return
    // Only seed when the visitor has not started writing.
    setForm((prev) => (prev.message.trim().length === 0 ? { ...prev, message: chosen.seed } : prev))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return

    setStatus('sending')

    const chosen = INTENTS.find((i) => i.id === intent)
    // Open mail client with pre-filled content
    const subject = encodeURIComponent(
      chosen ? `${chosen.subject} — ${form.name}` : `Portfolio contact from ${form.name}`,
    )
    const body    = encodeURIComponent(
      `Hi Indrajit,\n\n${form.message}\n\nBest,\n${form.name}\n${form.email}`,
    )

    setTimeout(() => {
      window.location.href = `mailto:${personalInfo.email}?subject=${subject}&body=${body}`
      setStatus('sent')
    }, 600)
  }

  const inputClass = `
    w-full px-4 py-3 rounded-xl text-sm outline-none
    border border-[var(--border)] bg-[var(--surface)]
    text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
    focus:border-[var(--accent-teal)] focus:shadow-[0_0_0_3px_var(--glow-teal)]
    transition-all duration-200
  `

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Contact form">
      <div className="space-y-4">
        {/* ── Intent: the first step, and the one that shapes the message ── */}
        <fieldset>
          <legend
            className="mb-2 block font-mono-code text-[0.7rem] uppercase tracking-widest"
            style={{ color: 'var(--text-muted)' }}
          >
            What's this about?
          </legend>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Message intent">
            {INTENTS.map((option) => {
              const Icon = option.icon
              const selected = intent === option.id
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => chooseIntent(option.id)}
                  aria-pressed={selected}
                  className="
                    inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5
                    font-mono-code text-[0.7rem] transition-all duration-200
                  "
                  style={{
                    borderColor: selected ? 'var(--accent-teal)' : 'var(--border)',
                    background: selected ? 'var(--glow-teal)' : 'var(--surface)',
                    color: selected ? 'var(--accent-teal)' : 'var(--text-secondary)',
                  }}
                >
                  <Icon size={12} aria-hidden="true" />
                  {option.label}
                </button>
              )
            })}
          </div>
        </fieldset>

        <div>
          <label
            htmlFor="contact-name"
            className="block font-mono-code text-[0.7rem] uppercase tracking-widest mb-1.5"
            style={{ color: 'var(--text-muted)' }}
          >
            Your Name
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            placeholder="Jane Smith"
            value={form.name}
            onChange={handleChange}
            required
            autoComplete="name"
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="contact-email"
            className="block font-mono-code text-[0.7rem] uppercase tracking-widest mb-1.5"
            style={{ color: 'var(--text-muted)' }}
          >
            Email Address
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            placeholder="jane@company.com"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="contact-message"
            className="block font-mono-code text-[0.7rem] uppercase tracking-widest mb-1.5"
            style={{ color: 'var(--text-muted)' }}
          >
            Message
          </label>
          <textarea
            id="contact-message"
            name="message"
            placeholder="Tell me about your project or opportunity..."
            value={form.message}
            onChange={handleChange}
            required
            rows={5}
            className={`${inputClass} resize-none`}
          />
        </div>

        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: DURATION.quick, ease: EASE_OUT_EXPO }}
          disabled={status === 'sending' || status === 'sent'}
          className="
            relative w-full py-3.5 rounded-full font-semibold text-[0.9rem]
            flex items-center justify-center gap-2
            bg-[var(--accent-teal)] text-[var(--bg-primary)]
            hover:shadow-[0_0_40px_var(--glow-teal)]
            disabled:opacity-60 disabled:cursor-not-allowed
            transition-all duration-300
          "
        >
          <AnimatePresence mode="wait">
            {status === 'sent' ? (
              <motion.span
                key="sent"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: DURATION.quick, ease: EASE_STANDARD }}
                className="flex items-center gap-2"
              >
                <FiCheck size={16} /> Message Ready — Check Mail Client
              </motion.span>
            ) : status === 'sending' ? (
              <motion.span key="sending" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                Opening…
              </motion.span>
            ) : (
              <motion.span
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <FiSend size={15} /> Send Message
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </form>
  )
}
