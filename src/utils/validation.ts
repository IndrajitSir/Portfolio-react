/**
 * Contact-form validation, kept in one place.
 *
 * Two readers share this module: the field handlers call the sanitisers while a
 * visitor types, and the submit handler re-validates the *normalised* value at
 * the boundary. Doing it here rather than inline in the component means the
 * rules cannot drift between the input and the submission.
 *
 * Client-side validation is a usability affordance, not a security boundary.
 * This form's only integration is a `mailto:` handoff (see `ContactForm`), so
 * there is no server of our own to enforce anything — the rules below exist to
 * stop a visitor from shipping a message that cannot reach the inbox.
 */

export const NAME_MAX = 30
export const EMAIL_MAX = 30
export const MESSAGE_MAX = 500

/**
 * Characters a name may *not* contain: anything that is not a Unicode letter, a
 * combining mark, a space, or a hyphen/apostrophe. Property escapes keep this
 * Unicode-aware, so "María", "Nguyễn" and "अनु" all survive while digits and
 * symbols are rejected. Both a straight (') and a typographic (') apostrophe
 * are accepted.
 */
const NAME_DISALLOWED = /[^\p{L}\p{M} \u2019'-]/gu

/**
 * A name reads as letter-groups joined by single separators, so it cannot start
 * or end with a separator, carry a double hyphen, or be a bare string of them.
 * Leading/trailing whitespace is stripped before this runs.
 */
const NAME_SHAPE = /^\p{L}[\p{L}\p{M}]*(?:[ '\u2019-]\p{L}[\p{L}\p{M}]*)*$/u

/**
 * A practical address shape: a local part, exactly one `@`, and a dotted domain
 * ending in a 2+ letter TLD. This rejects `*`, spaces, a missing `@`, and a bare
 * host (`you@localhost`), without pretending to know what is deliverable.
 */
const EMAIL_SHAPE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/

export type ContactField = 'name' | 'email' | 'message'

export interface ContactValues {
  name: string
  email: string
  message: string
}

export type ContactErrors = Record<ContactField, string | null>

/** Count code points, so a name in a supplementary plane is not cut in half. */
const length = (value: string): number => Array.from(value).length

/**
 * Strip characters a name may not contain as they are typed or pasted.
 *
 * Truncation happens by code point, never by UTF-16 unit, so a pasted 22-char
 * name becomes exactly 20 characters instead of a malformed 20-unit string.
 * Valid characters already in the field are never touched.
 */
export const sanitizeNameInput = (raw: string): string =>
  Array.from(raw.replace(NAME_DISALLOWED, '')).slice(0, NAME_MAX).join('')

/** Normalise a name for storage/submission: whitespace at the edges only. */
export const normalizeName = (raw: string): string => raw.trim()

/** Normalise an email for storage/submission: whitespace at the edges only. */
export const normalizeEmail = (raw: string): string => raw.trim()

/** Normalise a message for submission; interior line breaks are preserved. */
export const normalizeMessage = (raw: string): string => raw.trim()

/** A single, field-specific message, or `null` when the value is acceptable. */
export const validateName = (raw: string): string | null => {
  const value = normalizeName(raw)
  if (!value) return 'Please add your name.'
  if (length(value) > NAME_MAX) return `Keep it to ${NAME_MAX} characters or fewer.`
  if (!NAME_SHAPE.test(value)) {
    return 'Use letters only — spaces, hyphens and apostrophes are fine.'
  }
  return null
}

export const validateEmail = (raw: string): string | null => {
  const value = normalizeEmail(raw)
  if (!value) return 'Please add an email address.'
  if (length(value) > EMAIL_MAX) return `Keep it to ${EMAIL_MAX} characters or fewer.`
  if (!EMAIL_SHAPE.test(value)) return 'Enter a valid address, e.g. you@site.io.'
  return null
}

export const validateMessage = (raw: string): string | null => {
  const value = normalizeMessage(raw)
  if (!value) return 'Please write a short message.'
  if (length(raw) > MESSAGE_MAX) return `Keep it to ${MESSAGE_MAX} characters or fewer.`
  return null
}

/** Validate every field at once, returning the errors keyed by field. */
export const validateContact = (values: ContactValues): ContactErrors => ({
  name: validateName(values.name),
  email: validateEmail(values.email),
  message: validateMessage(values.message),
})

/** True when no field carries an error. */
export const isContactValid = (errors: ContactErrors): boolean =>
  !errors.name && !errors.email && !errors.message
