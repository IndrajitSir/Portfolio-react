import { useInView } from 'react-intersection-observer'

interface UseScrollRevealOptions {
  threshold?: number
  triggerOnce?: boolean
  rootMargin?: string
}

export const useScrollReveal = ({
  threshold = 0.15,
  triggerOnce = true,
  rootMargin = '0px 0px -60px 0px',
}: UseScrollRevealOptions = {}) => {
  const { ref, inView } = useInView({
    threshold,
    triggerOnce,
    rootMargin,
  })

  return { ref, inView }
}
