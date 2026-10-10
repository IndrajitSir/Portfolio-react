import type definition from '@/assets/strobi.avatar.json'

/**
 * The animation and expression keys that actually exist in `strobi.avatar.json`.
 *
 * Derived from the definition rather than retyped by hand, because the two lists
 * have to agree: the runtime rejects an unknown key with a console error and no
 * visible change, which is exactly the kind of bug that ships quietly. With the
 * keys derived here, a name the avatar does not have — `play('drowsey')` — is a
 * compile error instead of a no-op.
 *
 * `import type` is what keeps the JSON out of every consumer's bundle: these are
 * the only two uses of it, and they are erased.
 */
export type StrobiAnimation = keyof (typeof definition)['animations']

export type StrobiExpression = keyof (typeof definition)['expressions']
