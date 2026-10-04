import { Children, Fragment, cloneElement, isValidElement, useMemo, type ReactElement, type ReactNode } from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { EASE_OUT_EXPO, REVEAL_VIEWPORT } from '@/utils/motion'

/**
 * A word-by-word reveal that keeps the paragraph exactly as written.
 *
 * The words ride up out of a mask rather than fading in, which is the difference
 * between typesetting and a slideshow — the line still occupies its space
 * throughout, so nothing reflows while you are reading it.
 *
 * Existing markup is preserved rather than flattened to a string: `<strong>` and
 * any other element inside the paragraph is cloned with the same treatment
 * applied to its own children, so emphasis and wording are untouched.
 */

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.011, delayChildren: 0.06 } },
}

const word: Variants = {
  hidden: { y: '108%', opacity: 0 },
  visible: {
    y: '0%',
    opacity: 1,
    transition: { duration: 0.52, ease: EASE_OUT_EXPO },
  },
}

/** One masked word. The padding cancels the mask clipping descenders. */
function Curtain({ children }: { children: ReactNode }) {
  return (
    <motion.span
      variants={word}
      className="inline-block overflow-hidden pb-[0.16em] align-bottom"
    >
      <span className="inline-block will-change-transform">{children}</span>
    </motion.span>
  )
}

/**
 * Walk the paragraph's children and wrap every word, leaving the elements — and
 * the spaces between words, which are what let the line still wrap — alone.
 */
function wrapWords(node: ReactNode, key: string): ReactNode[] {
  if (node === null || node === undefined || node === false) return []

  if (typeof node === 'string' || typeof node === 'number') {
    const tokens = String(node).split(/(\s+)/).filter((part) => part.length > 0)
    return tokens.map((token, i) =>
      /^\s+$/.test(token) ? (
        <Fragment key={`${key}-s${i}`}>{token}</Fragment>
      ) : (
        <Curtain key={`${key}-w${i}`}>{token}</Curtain>
      ),
    )
  }

  if (Array.isArray(node)) {
    return Children.toArray(node).flatMap((child, i) => wrapWords(child, `${key}-${i}`))
  }

  if (isValidElement(node)) {
    const element = node as ReactElement<{ children?: ReactNode }>
    if (element.props.children === undefined) return [element]
    return [
      cloneElement(
        element,
        undefined,
        wrapWords(element.props.children, `${key}-e`),
      ) as ReactElement,
    ]
  }

  return [node]
}

export default function RevealWords({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion()
  const words = useMemo(() => wrapWords(children, 'w'), [children])

  // No animation, exactly the same text: reduced-motion visitors read the
  // paragraph normally rather than being shown a half-finished reveal.
  if (reduceMotion) return <>{children}</>

  return (
    <motion.span
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={REVEAL_VIEWPORT}
    >
      {words}
    </motion.span>
  )
}