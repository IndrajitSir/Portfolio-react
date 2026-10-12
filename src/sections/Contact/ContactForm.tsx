import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { FiBriefcase, FiCode, FiMessageCircle, FiAlertCircle, FiCheckCircle } from 'react-icons/fi'
import { personalInfo } from '@/data'
import { notifyCompanionCue } from '@/utils/companionCues'
import {
  EMAIL_MAX,
  MESSAGE_MAX,
  NAME_MAX,
  normalizeEmail,
  normalizeMessage,
  normalizeName,
  sanitizeNameInput,
  validateContact,
  validateEmail,
  validateMessage,
  validateName,
  type ContactErrors,
  type ContactField,
  type ContactValues,
} from '@/utils/validation'
import SendButton, { type SendStatus } from './SendButton'

/**
 * Conversation intents. Choosing one does two useful things: it seeds the
 * message with a concrete starting point (only while the field is still empty,
 * so nothing a visitor typed is ever overwritten) and it sets the email
 * subject, so the message that lands in the inbox is already triaged.
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

const EMPTY_ERRORS: ContactErrors = { name: null, email: null, message: null }
const EMPTY_TOUCHED: Record<ContactField, boolean> = { name: false, email: false, message: false }
const FIELD_ORDER: ContactField[] = ['name', 'email', 'message']

type Notice = { kind: 'success' | 'error'; text: string } | null

const validateField = (field: ContactField, value: string): string | null => {
  if (field === 'name') return validateName(value)
  if (field === 'email') return validateEmail(value)
  return validateMessage(value)
}

export default function ContactForm() {
  const [values, setValues] = useState<ContactValues>({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState<ContactErrors>(EMPTY_ERRORS)
  const [touched, setTouched] = useState<Record<ContactField, boolean>>(EMPTY_TOUCHED)
  const [status, setStatus] = useState<SendStatus>('idle')
  const [notice, setNotice] = useState<Notice>(null)
  const [intent, setIntent] = useState<IntentId | null>(null)

  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const messageRef = useRef<HTMLTextAreaElement>(null)
  // A duplicate-submission latch that does not depend on render timing.
  const lockedRef = useRef(false)
  const timersRef = useRef<number[]>([])

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id))
    timersRef.current = []
  }, [])

  useEffect(() => () => clearTimers(), [clearTimers])

  const handleChange = (field: ContactField, raw: string) => {
    // The name field filters as you type; every field is validated again at the
    // submit boundary, so this is convenience rather than the real gate.
    const value = field === 'name' ? sanitizeNameInput(raw) : raw
    setValues((prev) => ({ ...prev, [field]: value }))

    // Only re-validate live once the visitor has already seen this field's
    // verdict (touched) — no errors before there has been a chance to type.
    if (touched[field]) {
      const nextError = validateField(field, value)
      setErrors((prev) => (prev[field] === nextError ? prev : { ...prev, [field]: nextError }))
    }
    if (notice) setNotice(null)
    if (status === 'error') setStatus('idle')
  }

  const handleBlur = (field: ContactField) => {
    setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }))
    setErrors((prev) => ({ ...prev, [field]: validateField(field, values[field]) }))
  }

  const chooseIntent = (id: IntentId) => {
    setIntent(id)
    const chosen = INTENTS.find((item) => item.id === id)
    if (!chosen) return
    setValues((prev) => (prev.message.trim().length === 0 ? { ...prev, message: chosen.seed } : prev))
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (lockedRef.current) return

    const nextErrors = validateContact(values)
    setErrors(nextErrors)
    setTouched({ name: true, email: true, message: true })

    const firstInvalid = FIELD_ORDER.find((field) => nextErrors[field])
    if (firstInvalid) {
      // Invalid form: name the problem in text, keep the button actionable, and
      // move focus to the first field that needs fixing.
      setStatus('idle')
      setNotice({
        kind: 'error',
        text:
          firstInvalid === 'name'
            ? 'Nearly there — please check your name.'
            : firstInvalid === 'email'
              ? 'Nearly there — please check your email address.'
              : 'Nearly there — please add a message.',
      })
      notifyCompanionCue('confused')
      const ref =
        firstInvalid === 'name' ? nameRef : firstInvalid === 'email' ? emailRef : messageRef
      ref.current?.focus()
      return
    }

    const name = normalizeName(values.name)
    const email = normalizeEmail(values.email)
    const message = normalizeMessage(values.message)

    lockedRef.current = true
    clearTimers()
    setStatus('sending')
    setNotice(null)

    const chosen = INTENTS.find((item) => item.id === intent)
    const subject = encodeURIComponent(
      chosen ? `${chosen.subject} — ${name}` : `Portfolio contact from ${name}`,
    )
    const body = encodeURIComponent(`Hi Indrajit,\n\n${message}\n\nBest,\n${name}\n${email}`)
    const mailto = `mailto:${personalInfo.email}?subject=${subject}&body=${body}`

    try {
      window.location.href = mailto
    } catch {
      lockedRef.current = false
      setStatus('error')
      setNotice({
        kind: 'error',
        text: `Couldn't open your mail client. Reach me directly at ${personalInfo.email}.`,
      })
      return
    }

    // `mailto:` hands the message to the OS client, which reports nothing back.
    // A short beat confirms the handoff (not a delivery we cannot observe), then
    // the fields are cleared so the next message starts clean.
    const successTimer = window.setTimeout(() => {
      setValues({ name: '', email: '', message: '' })
      setErrors(EMPTY_ERRORS)
      setTouched(EMPTY_TOUCHED)
      setIntent(null)
      setStatus('success')
      setNotice({ kind: 'success', text: 'Your mail client is open — press send there to deliver it.' })
      notifyCompanionCue('celebrate')
      lockedRef.current = false
      const resetTimer = window.setTimeout(() => {
        setStatus('idle')
        setNotice(null)
      }, 6000)
      timersRef.current.push(resetTimer)
    }, 650)
    timersRef.current.push(successTimer)
  }

  const disabled = status === 'sending'
  const buttonLabel =
    status === 'sending'
      ? 'Sending…'
      : status === 'success'
        ? 'Message ready'
        : status === 'error'
          ? 'Retry'
          : 'Send message'

  const fieldClass = (field: ContactField) => {
    const invalid = Boolean(errors[field])
    return [
      'w-full rounded-xl border bg-[var(--surface)] px-4 py-3 text-sm outline-none',
      'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
      'transition-[border-color,box-shadow] duration-200',
      invalid
        ? 'border-[var(--accent-orange)] focus:border-[var(--accent-orange)] focus:shadow-[0_0_0_3px_rgba(251,146,60,0.16)]'
        : 'border-[var(--border)] focus:border-[var(--accent-teal)] focus:shadow-[0_0_0_3px_var(--glow-teal)]',
    ].join(' ')
  }

  const labelClass = 'block font-mono-code text-[0.7rem] uppercase tracking-widest mb-1.5'

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Contact form" className="space-y-5">
      {/* ── Intent: the first step, and the one that shapes the message ── */}
      <fieldset data-reveal>
        <legend className={labelClass} style={{ color: 'var(--text-muted)' }}>
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

      {/* ── Name ─────────────────────────────────────────────────────── */}
      <div data-reveal>
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor="contact-name" className={labelClass} style={{ color: 'var(--text-muted)' }}>
            Your name
          </label>
          <span className="font-mono-code text-[0.6rem]" style={{ color: 'var(--text-muted)' }}>
            letters · max {NAME_MAX}
          </span>
        </div>
        <input
          ref={nameRef}
          id="contact-name"
          name="name"
          type="text"
          placeholder="Jane Smith"
          value={values.name}
          onChange={(event) => handleChange('name', event.target.value)}
          onBlur={() => handleBlur('name')}
          autoComplete="name"
          aria-required="true"
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? 'contact-name-error' : undefined}
          className={fieldClass('name')}
        />
        <p
          id="contact-name-error"
          role="alert"
          className="mt-1.5 ml-2 min-h-[1.05rem] font-mono-code text-[0.68rem]"
          style={{ color: 'var(--accent-orange)' }}
        >
          {errors.name}
        </p>
      </div>

      {/* ── Email ────────────────────────────────────────────────────── */}
      <div data-reveal>
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor="contact-email" className={labelClass} style={{ color: 'var(--text-muted)' }}>
            Email address
          </label>
          <span className="font-mono-code text-[0.6rem]" style={{ color: 'var(--text-muted)' }}>
            max {EMAIL_MAX}
          </span>
        </div>
        <input
          ref={emailRef}
          id="contact-email"
          name="email"
          type="email"
          placeholder="you@site.io"
          value={values.email}
          onChange={(event) => handleChange('email', event.target.value)}
          onBlur={() => handleBlur('email')}
          autoComplete="email"
          inputMode="email"
          aria-required="true"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? 'contact-email-error' : undefined}
          className={fieldClass('email')}
        />
        <p
          id="contact-email-error"
          role="alert"
          className="mt-1.5 ml-2 min-h-[1.05rem] font-mono-code text-[0.68rem]"
          style={{ color: 'var(--accent-orange)' }}
        >
          {errors.email}
        </p>
      </div>

      {/* ── Message ──────────────────────────────────────────────────── */}
      <div data-reveal>
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor="contact-message" className={labelClass} style={{ color: 'var(--text-muted)' }}>
            Message
          </label>
          <span
            id="contact-message-count"
            className="font-mono-code text-[0.64rem] tabular-nums"
            style={{ color: values.message.length >= MESSAGE_MAX ? 'var(--accent-orange)' : 'var(--text-muted)' }}
            aria-live="polite"
          >
            {values.message.length} / {MESSAGE_MAX}
          </span>
        </div>
        <textarea
          ref={messageRef}
          id="contact-message"
          name="message"
          placeholder="Tell me about your project or opportunity…"
          value={values.message}
          onChange={(event) => handleChange('message', event.target.value)}
          onBlur={() => handleBlur('message')}
          rows={5}
          maxLength={MESSAGE_MAX}
          aria-required="true"
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={`contact-message-count${errors.message ? ' contact-message-error' : ''}`}
          className={`${fieldClass('message')} resize-none leading-[1.6]`}
        />
        <p
          id="contact-message-error"
          role="alert"
          className="mt-1.5 ml-2 min-h-[1.05rem] font-mono-code text-[0.68rem]"
          style={{ color: 'var(--accent-orange)' }}
        >
          {errors.message}
        </p>
      </div>

      {/* ── Submission feedback ──────────────────────────────────────── */}
      <p
        role="status"
        aria-live="polite"
        className="flex min-h-[1.2rem] items-start gap-2 text-[0.76rem]"
        style={{ color: notice?.kind === 'error' ? 'var(--accent-orange)' : 'var(--accent-teal)' }}
      >
        {notice && (
          <>
            <span className="mt-0.5 shrink-0" aria-hidden="true">
              {notice.kind === 'error' ? <FiAlertCircle size={14} /> : <FiCheckCircle size={14} />}
            </span>
            <span>{notice.text}</span>
          </>
        )}
      </p>

      <div data-reveal>
        <SendButton status={status} label={buttonLabel} disabled={disabled} />
      </div>
    </form>
  )
}
