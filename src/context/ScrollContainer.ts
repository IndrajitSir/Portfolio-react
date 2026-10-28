import { createContext, useContext, type RefObject } from 'react'

/**
 * The element a section's scroll-driven values should read from.
 *
 * Every chapter section exists in two places: as a chapter page, where the
 * window is the scroller, and inside a whale container, where the chapter panel
 * is a fixed element scrolling its own content while the window sits frozen at
 * the pinned stage. Sections are shared between the two, so they ask here which
 * container they actually live in.
 *
 * `null` means the window — the usual case, and what every section outside a
 * container gets.
 */
export const ScrollContainerContext = createContext<RefObject<HTMLElement> | null>(null)

/** The scroll container of the nearest chapter panel, or `null` for the page. */
export const useScrollContainer = (): RefObject<HTMLElement> | null =>
  useContext(ScrollContainerContext)
