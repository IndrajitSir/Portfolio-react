import type { NavItem } from '@/types'

/**
 * Section navigation, in the order the visitor meets them.
 *
 * `Journey` sits directly after `About` because it is the narrative spine: it
 * explains the progression the rest of the page then goes into detail on. The
 * Navbar's IntersectionObserver highlights whichever of these is on screen, so
 * adding a section here is enough to make it navigable.
 */
export const navItems: NavItem[] = [
  { label: 'About', href: '#about' },
  { label: 'Journey', href: '#journey' },
  { label: 'Skills', href: '#skills' },
  { label: 'Experience', href: '#experience' },
  { label: 'Projects', href: '#projects' },
  { label: 'Education', href: '#education' },
  { label: 'Credentials', href: '#credentials' },
  { label: 'Contact', href: '#contact' },
]