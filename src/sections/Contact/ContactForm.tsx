import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSend, FiCheck } from 'react-icons/fi'
import { personalInfo } from '@/data'

interface FormState {
  name: string
  email: string
  message: string
}

type Status = 'idle' | 'sending' | 'sent' | 'error'

export default function ContactForm() {
  const [form, setForm]     = useState<FormState>({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<Status>('idle')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return

    setStatus('sending')

    // Open mail client with pre-filled content
    const subject = encodeURIComponent(`Portfolio contact from ${form.name}`)
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
